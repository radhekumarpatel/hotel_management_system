const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pdf = require('html-pdf');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const secretKey = '88b4070fa4f81de07846e5d5ad1726de2e9c0421a2ebc846db3dc8cab9a939fd';

// Database connection pool
const pool = mysql.createPool({
    host: 'hotelbooking.crwsaimc83uc.ca-central-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Secret55',
    database: 'hotel_booking',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send('A token is required for authentication');
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send('Invalid token');
    }
}

// REST API Endpoints

// Register user
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).send('Required fields are missing');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        pool.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).send(err);
            }
            res.status(201).send('User registered');
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send(error.message);
    }
});

// Login user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Required fields are missing');
    }

    try {
        const query = 'SELECT * FROM users WHERE username = ?';
        pool.query(query, [username], async (err, results) => {
            if (err) {
                console.error('Error querying user:', err);
                return res.status(500).send(err);
            }
            if (results.length === 0) {
                return res.status(401).send('Invalid credentials');
            }

            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
                res.json({ message: 'Login successful', token });
            } else {
                res.status(401).send('Invalid credentials');
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send(error.message);
    }
});

// Check availability
app.post('/check-availability', (req, res) => {
    const { room_type, checkin_date, checkout_date } = req.body;

    const query = 'SELECT COUNT(*) as count FROM bookings WHERE room_type = ? AND ((checkin_date <= ? AND checkout_date >= ?) OR (checkin_date <= ? AND checkout_date >= ?))';
    pool.query(query, [room_type, checkin_date, checkin_date, checkout_date, checkout_date], (err, results) => {
        if (err) {
            console.error('Error checking availability:', err);
            return res.status(500).send(err);
        }
        const available = results[0].count === 0;
        res.json({ available });
    });
});

// Book service
app.post('/bookService', verifyToken, (req, res) => {
    const { room_type, checkin_date, checkout_date } = req.body;
    const user_id = req.user.id;

    const availabilityQuery = 'SELECT COUNT(*) as count FROM bookings WHERE room_type = ? AND ((checkin_date <= ? AND checkout_date >= ?) OR (checkin_date <= ? AND checkout_date >= ?))';
    pool.query(availabilityQuery, [room_type, checkin_date, checkin_date, checkout_date, checkout_date], (err, results) => {
        if (err) {
            console.error('Error checking availability:', err);
            return res.status(500).send(err);
        }

        if (results[0].count > 0) {
            return res.status(400).send('Room is not available for the selected dates');
        }

        const bookingQuery = 'INSERT INTO bookings (user_id, room_type, checkin_date, checkout_date) VALUES (?, ?, ?, ?)';
        pool.query(bookingQuery, [user_id, room_type, checkin_date, checkout_date], (err, result) => {
            if (err) {
                console.error('Error booking service:', err);
                return res.status(500).send(err);
            }
            res.status(201).send('Service booked successfully');
        });
    });
});

// Generate PDF receipt
app.post('/generate-receipt', (req, res) => {
    const { user_name, room_type, checkin_date, checkout_date, total_amount } = req.body;

    const receiptHtml = `
        <h1>Hotel Booking Receipt</h1>
        <p><strong>Name:</strong> ${user_name}</p>
        <p><strong>Room Type:</strong> ${room_type}</p>
        <p><strong>Check-in Date:</strong> ${checkin_date}</p>
        <p><strong>Check-out Date:</strong> ${checkout_date}</p>
        <p><strong>Total Amount:</strong> $${total_amount}</p>
    `;

    pdf.create(receiptHtml).toStream((err, stream) => {
        if (err) {
            console.error('Error generating PDF:', err);
            return res.status(500).send(err);
        }
        res.setHeader('Content-type', 'application/pdf');
        stream.pipe(res);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

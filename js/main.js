document.addEventListener('DOMContentLoaded', function () {

    // Register form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const data = {
                username: registerForm.username.value,
                email: registerForm.email.value,
                password: registerForm.password.value
            };

            fetch('http://ec2-3-96-204-231.ca-central-1.compute.amazonaws.com:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (response.ok) {
                    return response.text();
                }
                throw new Error('Registration failed');
            })
            .then(data => {
                alert('Registration successful');
                // Optionally redirect or perform other actions after successful registration
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Registration failed. Please try again.');
            });
        });
    }

    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const data = {
                username: loginForm.username.value,
                password: loginForm.password.value
            };

            fetch('http://ec2-3-96-204-231.ca-central-1.compute.amazonaws.com:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Login failed');
            })
            .then(data => {
                alert('Login successful');
                localStorage.setItem('token', data.token); // Save token
                window.location.href = 'http://hotelbookingweb.s3-website.ca-central-1.amazonaws.com/services.html'; // Redirect to services page
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Login failed. Please check your credentials.');
            });
        });
    }

    // Service form submission
    const serviceForm1 = document.getElementById('serviceForm1');
    if (serviceForm1) {
        serviceForm1.addEventListener('submit', function (e) {
            e.preventDefault();

            const data = {
                service_id: serviceForm1.service_id.value,
                booking_date: serviceForm1.booking_date.value,
                user_id: 1 // Replace with actual user ID after implementing user authentication
            };

            fetch('http://ec2-3-96-204-231.ca-central-1.compute.amazonaws.com:3000/bookService', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Include token in header
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (response.ok) {
                    return response.text();
                }
                throw new Error('Service booking failed');
            })
            .then(data => {
                alert('Service booked successfully');
                // Optionally redirect or perform other actions after booking service
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Service booking failed. Please try again.');
            });
        });
    }

});

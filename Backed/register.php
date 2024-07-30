<?php
// Handle user registration form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve form data
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = $_POST['password'];

    // TODO: Validate inputs (e.g., check if fields are empty, validate email format)

    // Connect to your MySQL database (replace with your database credentials)
    $servername = "localhost";
    $dbusername = "your_db_username";
    $dbpassword = "your_db_password";
    $dbname = "your_database_name";

    $conn = new mysqli($servername, $dbusername, $dbpassword, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Prepare SQL statement to insert user data into users table
    $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $email, $password);

    // Execute SQL statement
    if ($stmt->execute()) {
        echo "User registered successfully!";
        // Redirect to login page or any other page
        // header("Location: login.html");
    } else {
        echo "Error: " . $stmt->error;
    }

    // Close statement and connection
    $stmt->close();
    $conn->close();
}
?>

<?php
// Handle user login form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve form data
    $username = $_POST['username'];
    $password = $_POST['password'];

    // TODO: Validate inputs (e.g., check if fields are empty)

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

    // Prepare SQL statement to fetch user from users table
    $stmt = $conn->prepare("SELECT * FROM users WHERE username=? AND password=?");
    $stmt->bind_param("ss", $username, $password);

    // Execute SQL statement
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if user exists and login successful
    if ($result->num_rows == 1) {
        echo "Login successful!";
        // Redirect to services page or any other page
        // header("Location: services.html");
    } else {
        echo "Login failed. Invalid username or password.";
    }

    // Close statement and connection
    $stmt->close();
    $conn->close();
}
?>

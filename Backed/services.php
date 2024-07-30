<?php
// Handle booking form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve form data
    $service_id = $_POST['service_id'];
    $booking_date = $_POST['booking_date'];

    // TODO: Validate inputs (e.g., check if fields are empty, validate date format)

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

    // Prepare SQL statement to insert booking into bookings table
    $stmt = $conn->prepare("INSERT INTO bookings (service_id, booking_date) VALUES (?, ?)");
    $stmt->bind_param("is", $service_id, $booking_date);

    // Execute SQL statement
    if ($stmt->execute()) {
        echo "Booking successful!";
    } else {
        echo "Error: " . $stmt->error;
    }

    // Close statement and connection
    $stmt->close();
    $conn->close();
}
?>

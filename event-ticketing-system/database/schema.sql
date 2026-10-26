CREATE DATABASE IF NOT EXISTS event_ticketing;
USE event_ticketing;

CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Customer', 'Admin') NOT NULL DEFAULT 'Customer',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    CHECK (capacity > 0)
);

CREATE TABLE IF NOT EXISTS Seats (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL,
    row_label VARCHAR(10) NOT NULL,
    seat_number INT NOT NULL,
    UNIQUE (venue_id, row_label, seat_number),
    UNIQUE (seat_id, venue_id),
    FOREIGN KEY (venue_id) REFERENCES Venues(venue_id),
    CHECK (seat_number > 0)
);

CREATE TABLE IF NOT EXISTS Events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('Scheduled', 'Cancelled', 'Completed') NOT NULL DEFAULT 'Scheduled',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (event_id, venue_id),
    FOREIGN KEY (venue_id) REFERENCES Venues(venue_id),
    CHECK (end_time > start_time),
    INDEX idx_events_start (start_time),
    INDEX idx_events_venue_time (venue_id, start_time, end_time)
);

CREATE TABLE IF NOT EXISTS Ticket_Types (
    ticket_type_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    type_name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    UNIQUE (event_id, type_name),
    UNIQUE (event_id, ticket_type_id),
    FOREIGN KEY (event_id) REFERENCES Events(event_id) ON DELETE CASCADE,
    CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS Event_Seats (
    event_id INT NOT NULL,
    venue_id INT NOT NULL,
    seat_id INT NOT NULL,
    ticket_type_id INT NOT NULL,
    status ENUM('AVAILABLE', 'BOOKED') NOT NULL DEFAULT 'AVAILABLE',
    PRIMARY KEY (event_id, seat_id),
    FOREIGN KEY (event_id, venue_id)
        REFERENCES Events(event_id, venue_id),
    FOREIGN KEY (seat_id, venue_id)
        REFERENCES Seats(seat_id, venue_id),
    FOREIGN KEY (event_id, ticket_type_id)
        REFERENCES Ticket_Types(event_id, ticket_type_id),
    INDEX idx_event_seat_status (event_id, status)
);

CREATE TABLE IF NOT EXISTS Bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    booking_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    UNIQUE (booking_id, event_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (event_id) REFERENCES Events(event_id),
    CHECK (total_amount >= 0),
    INDEX idx_booking_user_time (user_id, booking_time)
);

CREATE TABLE IF NOT EXISTS Booking_Seats (
    booking_id INT NOT NULL,
    event_id INT NOT NULL,
    seat_id INT NOT NULL,
    ticket_price DECIMAL(10,2) NOT NULL,
    status ENUM('ACTIVE', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (booking_id, event_id, seat_id),
    FOREIGN KEY (booking_id, event_id)
        REFERENCES Bookings(booking_id, event_id),
    FOREIGN KEY (event_id, seat_id)
        REFERENCES Event_Seats(event_id, seat_id),
    CHECK (ticket_price >= 0),
    INDEX idx_booking_seat_event (event_id, seat_id)
);

CREATE TABLE IF NOT EXISTS Payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    payment_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    demo_reference VARCHAR(80),
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id),
    CHECK (amount >= 0),
    INDEX idx_payment_booking (booking_id)
);

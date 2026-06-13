-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS voyage_db;
USE voyage_db;

-- Create booking_requests table
CREATE TABLE IF NOT EXISTS booking_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    passenger_names VARCHAR(255) NOT NULL,
    from_location VARCHAR(100) NOT NULL,
    to_location VARCHAR(100) NOT NULL,
    travel_date DATE NOT NULL,
    special_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert seed data for visual testing
INSERT INTO booking_requests (passenger_names, from_location, to_location, travel_date, special_notes)
VALUES 
('Alice Vance, Bob Vance', 'New York, USA', 'Tokyo, Japan', '2026-09-15', 'Window seats preferred, vegeterian meals requested.'),
('Sarah Jenkins', 'London, UK', 'Reykjavik, Iceland', '2026-12-05', 'Honeymoon trip! Looking for a cosy northern lights tour advice.'),
('David Chen', 'Singapore', 'Sydney, Australia', '2026-08-20', 'Business leisure combo. Need high-speed Wi-Fi details.');

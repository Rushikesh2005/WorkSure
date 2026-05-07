-- Create Database
CREATE DATABASE IF NOT EXISTS worksure_db;
USE worksure_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL,
    age INT DEFAULT NULL,
    gender ENUM('Male', 'Female', 'Other') DEFAULT NULL,
    address TEXT DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    state VARCHAR(100) DEFAULT NULL,
    zip_code VARCHAR(10) DEFAULT NULL,
    is_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Worker Profiles Table
CREATE TABLE IF NOT EXISTS worker_profiles (
    worker_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    profile_picture LONGTEXT DEFAULT NULL,
    profession VARCHAR(100) DEFAULT NULL,
    experience_years INT DEFAULT 0,
    hourly_rate DECIMAL(10, 2) DEFAULT 0.00,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    bio TEXT DEFAULT NULL,
    skills TEXT DEFAULT NULL,
    age INT DEFAULT NULL,
    gender ENUM('Male', 'Female', 'Other') DEFAULT NULL,
    address TEXT DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    state VARCHAR(100) DEFAULT NULL,
    zip_code VARCHAR(10) DEFAULT NULL,
    is_complete BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- User Roles Table
CREATE TABLE IF NOT EXISTS user_roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_type ENUM('user', 'worker') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role_type)
);

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    job_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    worker_id INT DEFAULT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    job_type VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    hourly_rate DECIMAL(10, 2) DEFAULT NULL,
    status ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(worker_id) ON DELETE SET NULL
);

-- Job Requests Table (for notifications)
CREATE TABLE IF NOT EXISTS job_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    worker_id INT NOT NULL,
    user_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(worker_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    worker_id INT NOT NULL,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(worker_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
);

-- Insert sample workers (for testing)
INSERT INTO users (full_name, email, phone, password_hash) VALUES
('John Doe', 'john.doe@example.com', '+91 9876543210', '$2y$10$abcdefghijklmnopqrstuvwxyz123456789'),
('Rajesh Kumar', 'rajesh.kumar@example.com', '+91 9876543211', '$2y$10$abcdefghijklmnopqrstuvwxyz123456789'),
('Priya Sharma', 'priya.sharma@example.com', '+91 9876543212', '$2y$10$abcdefghijklmnopqrstuvwxyz123456789'),
('Amit Patel', 'amit.patel@example.com', '+91 9876543213', '$2y$10$abcdefghijklmnopqrstuvwxyz123456789');

-- Insert worker profiles
INSERT INTO worker_profiles (user_id, profession, experience_years, hourly_rate, rating, total_reviews, bio, skills, is_complete, is_available) VALUES
(1, 'Electrician', 5, 500.00, 4.5, 128, 'Experienced and reliable electrician with a proven track record in residential and commercial projects.', 'Electrical Wiring,Troubleshooting,Appliance Installation,Panel Upgrades,Lighting Fixtures,Safety Compliance', TRUE, TRUE),
(2, 'Plumber', 8, 450.00, 4.7, 245, 'Expert plumber specializing in repairs, installations, and maintenance for homes and businesses.', 'Pipe Repair,Drain Cleaning,Water Heater Installation,Leak Detection,Bathroom Fixtures,Emergency Services', TRUE, TRUE),
(3, 'Carpenter', 6, 550.00, 4.6, 167, 'Skilled carpenter with expertise in custom furniture, cabinetry, and home renovations.', 'Furniture Making,Cabinet Installation,Door Repair,Deck Building,Wood Finishing,Custom Design', TRUE, TRUE),
(4, 'Painter', 4, 400.00, 4.4, 92, 'Professional painter providing high-quality interior and exterior painting services.', 'Interior Painting,Exterior Painting,Wall Preparation,Color Consultation,Spray Painting,Touch-ups', TRUE, TRUE);

-- Insert user roles
INSERT INTO user_roles (user_id, role_type) VALUES
(1, 'worker'),
(2, 'worker'),
(3, 'worker'),
(4, 'worker');

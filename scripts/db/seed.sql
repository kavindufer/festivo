SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS festivo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE festivo;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  external_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL,
  mfa_enabled TINYINT(1) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS customers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  user_id BIGINT NOT NULL UNIQUE,
  address VARCHAR(255),
  phone_number VARCHAR(32),
  CONSTRAINT fk_customer_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS vendors (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  verified TINYINT(1) DEFAULT 0,
  starting_price DECIMAL(10,2),
  rating DOUBLE,
  user_id BIGINT,
  CONSTRAINT fk_vendor_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS service_categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS services (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  vendor_id BIGINT,
  category_id BIGINT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(12) NOT NULL,
  CONSTRAINT fk_service_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  CONSTRAINT fk_service_category FOREIGN KEY (category_id) REFERENCES service_categories(id)
);

CREATE TABLE IF NOT EXISTS events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  customer_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE,
  CONSTRAINT fk_event_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  vendor_id BIGINT,
  service_id BIGINT,
  event_id BIGINT,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status VARCHAR(32) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  currency VARCHAR(12) NOT NULL,
  notes TEXT,
  timezone VARCHAR(64) NOT NULL,
  CONSTRAINT uk_booking_vendor_slot UNIQUE (vendor_id, start_time, end_time),
  CONSTRAINT fk_booking_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id),
  CONSTRAINT fk_booking_service FOREIGN KEY (service_id) REFERENCES services(id),
  CONSTRAINT fk_booking_event FOREIGN KEY (event_id) REFERENCES events(id)
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  booking_id BIGINT,
  provider VARCHAR(64) NOT NULL,
  provider_reference VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(12) NOT NULL,
  paid_at DATETIME NULL,
  invoice_number VARCHAR(255),
  CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  booking_id BIGINT,
  sender_id BIGINT,
  content TEXT NOT NULL,
  read_at DATETIME NULL,
  CONSTRAINT fk_message_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  CONSTRAINT fk_message_user FOREIGN KEY (sender_id) REFERENCES users(id)
);

INSERT IGNORE INTO users (id, created_at, updated_at, external_id, email, display_name, role, mfa_enabled) VALUES
  (1, NOW(), NOW(), 'customer-demo', 'customer@festivo.test', 'Casey Customer', 'CUSTOMER', 0),
  (2, NOW(), NOW(), 'vendor-demo', 'vendor@festivo.test', 'Victor Vendor', 'VENDOR', 0),
  (3, NOW(), NOW(), 'admin-demo', 'admin@festivo.test', 'Avery Admin', 'ADMIN', 1);

INSERT IGNORE INTO customers (id, created_at, updated_at, user_id, address, phone_number) VALUES
  (1, NOW(), NOW(), 1, '123 Celebration Ave', '+94 11 123 4567');

INSERT IGNORE INTO service_categories (id, created_at, updated_at, name, description) VALUES
  (1, NOW(), NOW(), 'Catering', 'Full service catering'),
  (2, NOW(), NOW(), 'Photography', 'Photography packages for events');

INSERT IGNORE INTO vendors (id, created_at, updated_at, name, description, location, verified, starting_price, rating, user_id)
VALUES
  (1, NOW(), NOW(), 'Blue Orchid Catering', 'Farm-to-table menus for weddings.', 'Colombo', 1, 120000.00, 4.8, 2);

INSERT IGNORE INTO services (id, created_at, updated_at, vendor_id, category_id, title, description, price, currency) VALUES
  (1, NOW(), NOW(), 1, 1, 'Signature Wedding Buffet', 'Four-course seasonal buffet for up to 150 guests.', 250000.00, 'LKR');

INSERT IGNORE INTO events (id, created_at, updated_at, customer_id, name, description, event_date) VALUES
  (1, NOW(), NOW(), 1, 'Olivia and Liam Wedding', 'Seaside celebration with close family.', DATE_ADD(CURDATE(), INTERVAL 30 DAY));

INSERT IGNORE INTO bookings (id, created_at, updated_at, vendor_id, service_id, event_id, start_time, end_time, status, total_amount, deposit_amount, currency, notes, timezone) VALUES
  (1, NOW(), NOW(), 1, 1, 1, DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 14 DAY), INTERVAL 4 HOUR), 'PENDING', 250000.00, 50000.00, 'LKR', 'Initial discovery call scheduled.', 'Asia/Colombo');

INSERT IGNORE INTO payments (id, created_at, updated_at, booking_id, provider, provider_reference, status, amount, currency, paid_at, invoice_number) VALUES
  (1, NOW(), NOW(), 1, 'PayHere', 'booking-1', 'INITIATED', 50000.00, 'LKR', NULL, 'INV-0001');

INSERT IGNORE INTO messages (id, created_at, updated_at, booking_id, sender_id, content, read_at) VALUES
  (1, NOW(), NOW(), 1, 1, 'Hi Victor! Looking forward to working together.', NULL);

-- Create database and table for maintenance requests
CREATE DATABASE IF NOT EXISTS maintenance_tracker;
USE maintenance_tracker;

-- Requests table: defaults status to 'New'
CREATE TABLE IF NOT EXISTS requests (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  resident_id INT UNSIGNED NOT NULL,
  category ENUM('Plumbing','Electrical','Painting','Other') NOT NULL,
  description TEXT NOT NULL,
  media VARCHAR(1024),
  status ENUM('New','In Progress','Resolved','Closed') NOT NULL DEFAULT 'New',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional index for resident_id lookups
-- Create index (MySQL does not support IF NOT EXISTS for CREATE INDEX consistently)
CREATE INDEX idx_requests_resident_id ON requests(resident_id);
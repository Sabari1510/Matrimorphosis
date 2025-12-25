-- NOTE:
-- This schema.sql is for reference/documentation only.
-- Actual schema used is created directly in MySQL Workbench
-- as per project requirements (users + requests tables).

-- Create database and table for maintenance requests
CREATE DATABASE IF NOT EXISTS maintenance_tracker;
USE maintenance_tracker;

-- Requests table: defaults status to 'New'
CREATE TABLE IF NOT EXISTS requests (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  resident_id INT UNSIGNED NOT NULL, -- resident_id references users(id)
  category ENUM('Plumbing','Electrical','Painting','Other') NOT NULL,
  description TEXT NOT NULL,
  media VARCHAR(1024),
  status ENUM('New','Assigned','In-Progress','Resolved') NOT NULL DEFAULT 'New',
  feedback_rating INT NULL,
  feedback_comment TEXT NULL,
  technician_notes TEXT NULL,
  technician_media TEXT NULL,
  technician_id INT UNSIGNED NULL, -- technician_id references users(id)
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Optional index for resident_id lookups
-- Create index (MySQL does not support IF NOT EXISTS for CREATE INDEX consistently)
CREATE INDEX idx_requests_resident_id ON requests(resident_id);

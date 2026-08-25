CREATE DATABASE IF NOT EXISTS northline_studio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE northline_studio;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS gallery_images (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  cloudinary_url TEXT NOT NULL,
  public_id VARCHAR(512) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  category ENUM('people', 'places', 'stories') NOT NULL,
  description TEXT NULL,
  upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_gallery_category (category),
  INDEX idx_gallery_upload_date (upload_date)
);

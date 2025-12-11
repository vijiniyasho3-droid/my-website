-- Migration to add profile_picture column to users table
USE buzzle_app;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255) NULL 
AFTER email;


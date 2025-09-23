-- Add legacy_user_id column to users table
ALTER TABLE users ADD COLUMN legacy_user_id VARCHAR(255);
CREATE INDEX idx_legacy_user_id ON users (legacy_user_id);
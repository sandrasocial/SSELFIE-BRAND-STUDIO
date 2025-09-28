-- Create archive tables
CREATE TABLE IF NOT EXISTS legacy_victoria_chats AS 
SELECT * FROM victoria_chats;

-- Record migration metadata
CREATE TABLE IF NOT EXISTS legacy_migrations (
  id SERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  migrated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  row_count INTEGER
);

-- Insert migration record
INSERT INTO legacy_migrations (table_name, row_count)
SELECT 'victoria_chats', COUNT(*) FROM victoria_chats;

-- Keep the original tables for now
-- Tables will be dropped after data verification in a separate migration
-- DROP TABLE victoria_chats;
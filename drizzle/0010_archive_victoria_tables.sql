-- Archive victoria_chats table data
CREATE TABLE IF NOT EXISTS legacy_victoria_chats AS SELECT * FROM victoria_chats;
-- Note: Keep the original table for now until data migration is verified
-- DROP TABLE victoria_chats;
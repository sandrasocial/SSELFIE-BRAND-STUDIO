-- 002_add_stack_auth_id_to_users.sql
-- Add stack_auth_id column to users table for Stack Auth integration
ALTER TABLE users ADD COLUMN stack_auth_id VARCHAR(255) UNIQUE;

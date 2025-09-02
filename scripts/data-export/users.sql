-- ============================================================
-- USER ACCOUNTS AND SUBSCRIPTION DATA
-- Table: users
-- Includes: authentication, subscription_status, generation_limits
-- Generated: 2025-09-02T08:21:20.421Z
-- ============================================================

-- Export all data from users
\COPY (
  SELECT * FROM users
  ORDER BY created_at ASC
) TO 'users_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\COPY (
  SELECT row_to_json(users) 
  FROM users
  ORDER BY created_at ASC
) TO 'users_export.json';

-- Count verification
SELECT 
  'users' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM users;

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- ============================================================
-- END USERS EXPORT
-- ============================================================


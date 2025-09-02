-- ============================================================
-- USAGE TRACKING AND LIMITS
-- Table: user_usage
-- Includes: generation_counts, monthly_limits, usage_history
-- Generated: 2025-09-02T08:21:20.425Z
-- ============================================================

-- Export all data from user_usage
\COPY (
  SELECT * FROM user_usage
  ORDER BY created_at ASC
) TO 'user_usage_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\COPY (
  SELECT row_to_json(user_usage) 
  FROM user_usage
  ORDER BY created_at ASC
) TO 'user_usage_export.json';

-- Count verification
SELECT 
  'user_usage' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM user_usage;

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_usage'
ORDER BY ordinal_position;

-- ============================================================
-- END USER_USAGE EXPORT
-- ============================================================


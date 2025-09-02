-- ============================================================
-- PAYMENT AND SUBSCRIPTION DATA
-- Table: subscriptions
-- Includes: stripe_data, billing_periods, plan_details
-- Generated: 2025-09-02T08:21:20.424Z
-- ============================================================

-- Export all data from subscriptions
\COPY (
  SELECT * FROM subscriptions
  ORDER BY created_at ASC
) TO 'subscriptions_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\COPY (
  SELECT row_to_json(subscriptions) 
  FROM subscriptions
  ORDER BY created_at ASC
) TO 'subscriptions_export.json';

-- Count verification
SELECT 
  'subscriptions' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM subscriptions;

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;

-- ============================================================
-- END SUBSCRIPTIONS EXPORT
-- ============================================================


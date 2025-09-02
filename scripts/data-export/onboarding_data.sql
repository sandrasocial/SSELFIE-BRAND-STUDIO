-- ============================================================
-- USER ONBOARDING RESPONSES
-- Table: onboarding_data
-- Includes: brand_story, business_goals, style_preferences
-- Generated: 2025-09-02T08:21:20.426Z
-- ============================================================

-- Export all data from onboarding_data
\COPY (
  SELECT * FROM onboarding_data
  ORDER BY created_at ASC
) TO 'onboarding_data_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\COPY (
  SELECT row_to_json(onboarding_data) 
  FROM onboarding_data
  ORDER BY created_at ASC
) TO 'onboarding_data_export.json';

-- Count verification
SELECT 
  'onboarding_data' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM onboarding_data;

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'onboarding_data'
ORDER BY ordinal_position;

-- ============================================================
-- END ONBOARDING_DATA EXPORT
-- ============================================================


-- ============================================================
-- IMAGE GENERATION TRACKING
-- Table: generation_trackers
-- Includes: prediction_ids, generation_status, temp_urls
-- Generated: 2025-09-02T08:21:20.427Z
-- ============================================================

-- Export all data from generation_trackers
\COPY (
  SELECT * FROM generation_trackers
  ORDER BY created_at ASC
) TO 'generation_trackers_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\COPY (
  SELECT row_to_json(generation_trackers) 
  FROM generation_trackers
  ORDER BY created_at ASC
) TO 'generation_trackers_export.json';

-- Count verification
SELECT 
  'generation_trackers' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM generation_trackers;

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'generation_trackers'
ORDER BY ordinal_position;

-- ============================================================
-- END GENERATION_TRACKERS EXPORT
-- ============================================================


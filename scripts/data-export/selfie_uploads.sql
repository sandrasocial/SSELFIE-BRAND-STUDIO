-- ============================================================
-- TRAINING IMAGE UPLOADS
-- Table: selfie_uploads
-- Includes: upload_urls, processing_status, file_metadata
-- Generated: 2025-09-02T08:21:20.426Z
-- ============================================================

-- Export all data from selfie_uploads
\COPY (
  SELECT * FROM selfie_uploads
  ORDER BY created_at ASC
) TO 'selfie_uploads_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\COPY (
  SELECT row_to_json(selfie_uploads) 
  FROM selfie_uploads
  ORDER BY created_at ASC
) TO 'selfie_uploads_export.json';

-- Count verification
SELECT 
  'selfie_uploads' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM selfie_uploads;

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'selfie_uploads'
ORDER BY ordinal_position;

-- ============================================================
-- END SELFIE_UPLOADS EXPORT
-- ============================================================


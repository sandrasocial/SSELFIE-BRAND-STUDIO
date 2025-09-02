-- ============================================================
-- GENERATED IMAGES GALLERY
-- Table: ai_images
-- Includes: image_urls, prompts, generation_metadata
-- Generated: 2025-09-02T08:21:20.425Z
-- ============================================================

-- Export all data from ai_images
\COPY (
  SELECT * FROM ai_images
  ORDER BY created_at ASC
) TO 'ai_images_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\COPY (
  SELECT row_to_json(ai_images) 
  FROM ai_images
  ORDER BY created_at ASC
) TO 'ai_images_export.json';

-- Count verification
SELECT 
  'ai_images' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM ai_images;

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'ai_images'
ORDER BY ordinal_position;

-- ============================================================
-- END AI_IMAGES EXPORT
-- ============================================================


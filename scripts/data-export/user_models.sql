-- ============================================================
-- TRAINED AI MODELS PER USER
-- Table: user_models
-- Includes: model_paths, trigger_words, training_status, lora_weights
-- Generated: 2025-09-02T08:21:20.424Z
-- ============================================================

-- Export all data from user_models
\COPY (
  SELECT * FROM user_models
  ORDER BY created_at ASC
) TO 'user_models_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\COPY (
  SELECT row_to_json(user_models) 
  FROM user_models
  ORDER BY created_at ASC
) TO 'user_models_export.json';

-- Count verification
SELECT 
  'user_models' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM user_models;

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_models'
ORDER BY ordinal_position;

-- ============================================================
-- END USER_MODELS EXPORT
-- ============================================================


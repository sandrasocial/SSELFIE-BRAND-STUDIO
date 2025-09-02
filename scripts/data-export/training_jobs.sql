-- ============================================================
-- AI MODEL TRAINING JOB HISTORY
-- Table: training_jobs
-- Includes: training_parameters, completion_status, model_outputs
-- Generated: 2025-09-02T08:21:20.424Z
-- ============================================================

-- Export all data from training_jobs
\COPY (
  SELECT * FROM training_jobs
  ORDER BY created_at ASC
) TO 'training_jobs_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\COPY (
  SELECT row_to_json(training_jobs) 
  FROM training_jobs
  ORDER BY created_at ASC
) TO 'training_jobs_export.json';

-- Count verification
SELECT 
  'training_jobs' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM training_jobs;

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'training_jobs'
ORDER BY ordinal_position;

-- ============================================================
-- END TRAINING_JOBS EXPORT
-- ============================================================


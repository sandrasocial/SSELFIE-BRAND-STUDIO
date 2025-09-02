-- ============================================================
-- MAYA-GENERATED CONCEPT CARDS AND PROMPTS
-- Table: maya_concept_cards
-- Includes: concept_data, prompts, styling_intelligence
-- Generated: 2025-09-02T08:21:20.423Z
-- ============================================================

-- Export all data from maya_concept_cards
\COPY (
  SELECT * FROM maya_concept_cards
  ORDER BY created_at ASC
) TO 'maya_concept_cards_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\COPY (
  SELECT row_to_json(maya_concept_cards) 
  FROM maya_concept_cards
  ORDER BY created_at ASC
) TO 'maya_concept_cards_export.json';

-- Count verification
SELECT 
  'maya_concept_cards' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM maya_concept_cards;

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'maya_concept_cards'
ORDER BY ordinal_position;

-- ============================================================
-- END MAYA_CONCEPT_CARDS EXPORT
-- ============================================================


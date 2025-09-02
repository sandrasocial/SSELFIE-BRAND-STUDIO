-- ============================================================
-- MAYA AI CHAT SESSIONS
-- Table: maya_chats
-- Includes: chat_metadata, conversation_context
-- Generated: 2025-09-02T08:21:20.422Z
-- ============================================================

-- Export all data from maya_chats
\COPY (
  SELECT * FROM maya_chats
  ORDER BY created_at ASC
) TO 'maya_chats_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\COPY (
  SELECT row_to_json(maya_chats) 
  FROM maya_chats
  ORDER BY created_at ASC
) TO 'maya_chats_export.json';

-- Count verification
SELECT 
  'maya_chats' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM maya_chats;

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'maya_chats'
ORDER BY ordinal_position;

-- ============================================================
-- END MAYA_CHATS EXPORT
-- ============================================================


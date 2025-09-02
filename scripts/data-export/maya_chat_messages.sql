-- ============================================================
-- INDIVIDUAL MAYA CHAT MESSAGES
-- Table: maya_chat_messages
-- Includes: message_content, timestamps, context_data
-- Generated: 2025-09-02T08:21:20.423Z
-- ============================================================

-- Export all data from maya_chat_messages
\COPY (
  SELECT * FROM maya_chat_messages
  ORDER BY created_at ASC
) TO 'maya_chat_messages_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\COPY (
  SELECT row_to_json(maya_chat_messages) 
  FROM maya_chat_messages
  ORDER BY created_at ASC
) TO 'maya_chat_messages_export.json';

-- Count verification
SELECT 
  'maya_chat_messages' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM maya_chat_messages;

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'maya_chat_messages'
ORDER BY ordinal_position;

-- ============================================================
-- END MAYA_CHAT_MESSAGES EXPORT
-- ============================================================


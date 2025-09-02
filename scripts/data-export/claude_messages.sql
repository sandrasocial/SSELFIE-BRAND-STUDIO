-- ============================================================
-- CLAUDE API MESSAGE HISTORY
-- Table: claude_messages
-- Includes: message_content, tool_calls, results
-- Generated: 2025-09-02T08:21:20.427Z
-- ============================================================

-- Export all data from claude_messages
\COPY (
  SELECT * FROM claude_messages
  ORDER BY created_at ASC
) TO 'claude_messages_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\COPY (
  SELECT row_to_json(claude_messages) 
  FROM claude_messages
  ORDER BY created_at ASC
) TO 'claude_messages_export.json';

-- Count verification
SELECT 
  'claude_messages' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM claude_messages;

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'claude_messages'
ORDER BY ordinal_position;

-- ============================================================
-- END CLAUDE_MESSAGES EXPORT
-- ============================================================


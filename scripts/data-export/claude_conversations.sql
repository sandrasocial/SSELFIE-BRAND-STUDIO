-- ============================================================
-- CLAUDE API CONVERSATION TRACKING
-- Table: claude_conversations
-- Includes: conversation_metadata, agent_contexts
-- Generated: 2025-09-02T08:21:20.427Z
-- ============================================================

-- Export all data from claude_conversations
\COPY (
  SELECT * FROM claude_conversations
  ORDER BY created_at ASC
) TO 'claude_conversations_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\COPY (
  SELECT row_to_json(claude_conversations) 
  FROM claude_conversations
  ORDER BY created_at ASC
) TO 'claude_conversations_export.json';

-- Count verification
SELECT 
  'claude_conversations' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM claude_conversations;

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'claude_conversations'
ORDER BY ordinal_position;

-- ============================================================
-- END CLAUDE_CONVERSATIONS EXPORT
-- ============================================================


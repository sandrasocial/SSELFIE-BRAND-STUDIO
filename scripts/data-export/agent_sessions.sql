-- ============================================================
-- AGENT CONVERSATION CONTEXTS
-- Table: agent_session_contexts
-- Includes: conversation_memory, workflow_states
-- Generated: 2025-09-02T08:21:20.426Z
-- ============================================================

-- Export all data from agent_session_contexts
\COPY (
  SELECT * FROM agent_session_contexts
  ORDER BY created_at ASC
) TO 'agent_session_contexts_export.csv' WITH CSV HEADER;

-- Alternative: JSON export for complex data types
\COPY (
  SELECT row_to_json(agent_session_contexts) 
  FROM agent_session_contexts
  ORDER BY created_at ASC
) TO 'agent_session_contexts_export.json';

-- Count verification
SELECT 
  'agent_session_contexts' as table_name,
  COUNT(*) as total_records,
  MIN(created_at) as earliest_record,
  MAX(created_at) as latest_record
FROM agent_session_contexts;

-- Schema export
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'agent_session_contexts'
ORDER BY ordinal_position;

-- ============================================================
-- END AGENT_SESSION_CONTEXTS EXPORT
-- ============================================================


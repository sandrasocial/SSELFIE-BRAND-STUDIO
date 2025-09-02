-- ============================================================
-- SSELFIE STUDIO MASTER DATA EXPORT SCRIPT
-- Generated: 2025-09-02T08:21:20.428Z
-- 
-- This script exports all critical data from the Replit database
-- Run this in your PostgreSQL environment to export all data
-- ============================================================

-- Set export directory (adjust as needed)
\set export_dir '/tmp/sselfie_export/'

-- Create export directory
\! mkdir -p :export_dir

-- Start transaction for consistency
BEGIN;

-- Export execution log
\echo 'Starting SSELFIE Studio data export...'
\timing on


-- ============================================================
-- EXPORTING: USERS
-- Priority: 1
-- ============================================================
\echo 'Exporting users...'

\COPY (
  SELECT * FROM users
  ORDER BY created_at ASC
) TO ':export_dirusers_export.csv' WITH CSV HEADER;

\COPY (
  SELECT row_to_json(users) 
  FROM users
  ORDER BY created_at ASC
) TO ':export_dirusers_export.json';

\echo 'Completed users export'


-- ============================================================
-- EXPORTING: SUBSCRIPTIONS
-- Priority: 1
-- ============================================================
\echo 'Exporting subscriptions...'

\COPY (
  SELECT * FROM subscriptions
  ORDER BY created_at ASC
) TO ':export_dirsubscriptions_export.csv' WITH CSV HEADER;

\COPY (
  SELECT row_to_json(subscriptions) 
  FROM subscriptions
  ORDER BY created_at ASC
) TO ':export_dirsubscriptions_export.json';

\echo 'Completed subscriptions export'


-- ============================================================
-- EXPORTING: MAYA_CHATS
-- Priority: 2
-- ============================================================
\echo 'Exporting maya_chats...'

\COPY (
  SELECT * FROM maya_chats
  ORDER BY created_at ASC
) TO ':export_dirmaya_chats_export.csv' WITH CSV HEADER;

\COPY (
  SELECT row_to_json(maya_chats) 
  FROM maya_chats
  ORDER BY created_at ASC
) TO ':export_dirmaya_chats_export.json';

\echo 'Completed maya_chats export'


-- ============================================================
-- EXPORTING: MAYA_CHAT_MESSAGES
-- Priority: 2
-- ============================================================
\echo 'Exporting maya_chat_messages...'

\COPY (
  SELECT * FROM maya_chat_messages
  ORDER BY created_at ASC
) TO ':export_dirmaya_chat_messages_export.csv' WITH CSV HEADER;

\COPY (
  SELECT row_to_json(maya_chat_messages) 
  FROM maya_chat_messages
  ORDER BY created_at ASC
) TO ':export_dirmaya_chat_messages_export.json';

\echo 'Completed maya_chat_messages export'


-- ============================================================
-- EXPORTING: MAYA_CONCEPT_CARDS
-- Priority: 2
-- ============================================================
\echo 'Exporting maya_concept_cards...'

\COPY (
  SELECT * FROM maya_concept_cards
  ORDER BY created_at ASC
) TO ':export_dirmaya_concept_cards_export.csv' WITH CSV HEADER;

\COPY (
  SELECT row_to_json(maya_concept_cards) 
  FROM maya_concept_cards
  ORDER BY created_at ASC
) TO ':export_dirmaya_concept_cards_export.json';

\echo 'Completed maya_concept_cards export'


-- ============================================================
-- EXPORTING: USER_USAGE
-- Priority: 2
-- ============================================================
\echo 'Exporting user_usage...'

\COPY (
  SELECT * FROM user_usage
  ORDER BY created_at ASC
) TO ':export_diruser_usage_export.csv' WITH CSV HEADER;

\COPY (
  SELECT row_to_json(user_usage) 
  FROM user_usage
  ORDER BY created_at ASC
) TO ':export_diruser_usage_export.json';

\echo 'Completed user_usage export'


-- ============================================================
-- EXPORTING: ONBOARDING_DATA
-- Priority: 2
-- ============================================================
\echo 'Exporting onboarding_data...'

\COPY (
  SELECT * FROM onboarding_data
  ORDER BY created_at ASC
) TO ':export_dironboarding_data_export.csv' WITH CSV HEADER;

\COPY (
  SELECT row_to_json(onboarding_data) 
  FROM onboarding_data
  ORDER BY created_at ASC
) TO ':export_dironboarding_data_export.json';

\echo 'Completed onboarding_data export'


-- ============================================================
-- EXPORTING: USER_MODELS
-- Priority: 3
-- ============================================================
\echo 'Exporting user_models...'

\COPY (
  SELECT * FROM user_models
  ORDER BY created_at ASC
) TO ':export_diruser_models_export.csv' WITH CSV HEADER;

\COPY (
  SELECT row_to_json(user_models) 
  FROM user_models
  ORDER BY created_at ASC
) TO ':export_diruser_models_export.json';

\echo 'Completed user_models export'


-- ============================================================
-- EXPORTING: TRAINING_JOBS
-- Priority: 3
-- ============================================================
\echo 'Exporting training_jobs...'

\COPY (
  SELECT * FROM training_jobs
  ORDER BY created_at ASC
) TO ':export_dirtraining_jobs_export.csv' WITH CSV HEADER;

\COPY (
  SELECT row_to_json(training_jobs) 
  FROM training_jobs
  ORDER BY created_at ASC
) TO ':export_dirtraining_jobs_export.json';

\echo 'Completed training_jobs export'


-- ============================================================
-- EXPORTING: AI_IMAGES
-- Priority: 3
-- ============================================================
\echo 'Exporting ai_images...'

\COPY (
  SELECT * FROM ai_images
  ORDER BY created_at ASC
) TO ':export_dirai_images_export.csv' WITH CSV HEADER;

\COPY (
  SELECT row_to_json(ai_images) 
  FROM ai_images
  ORDER BY created_at ASC
) TO ':export_dirai_images_export.json';

\echo 'Completed ai_images export'


-- ============================================================
-- EXPORTING: SELFIE_UPLOADS
-- Priority: 3
-- ============================================================
\echo 'Exporting selfie_uploads...'

\COPY (
  SELECT * FROM selfie_uploads
  ORDER BY created_at ASC
) TO ':export_dirselfie_uploads_export.csv' WITH CSV HEADER;

\COPY (
  SELECT row_to_json(selfie_uploads) 
  FROM selfie_uploads
  ORDER BY created_at ASC
) TO ':export_dirselfie_uploads_export.json';

\echo 'Completed selfie_uploads export'


-- ============================================================
-- EXPORTING: GENERATION_TRACKERS
-- Priority: 3
-- ============================================================
\echo 'Exporting generation_trackers...'

\COPY (
  SELECT * FROM generation_trackers
  ORDER BY created_at ASC
) TO ':export_dirgeneration_trackers_export.csv' WITH CSV HEADER;

\COPY (
  SELECT row_to_json(generation_trackers) 
  FROM generation_trackers
  ORDER BY created_at ASC
) TO ':export_dirgeneration_trackers_export.json';

\echo 'Completed generation_trackers export'


-- ============================================================
-- EXPORTING: AGENT_SESSION_CONTEXTS
-- Priority: 4
-- ============================================================
\echo 'Exporting agent_session_contexts...'

\COPY (
  SELECT * FROM agent_session_contexts
  ORDER BY created_at ASC
) TO ':export_diragent_session_contexts_export.csv' WITH CSV HEADER;

\COPY (
  SELECT row_to_json(agent_session_contexts) 
  FROM agent_session_contexts
  ORDER BY created_at ASC
) TO ':export_diragent_session_contexts_export.json';

\echo 'Completed agent_session_contexts export'


-- ============================================================
-- EXPORTING: CLAUDE_CONVERSATIONS
-- Priority: 4
-- ============================================================
\echo 'Exporting claude_conversations...'

\COPY (
  SELECT * FROM claude_conversations
  ORDER BY created_at ASC
) TO ':export_dirclaude_conversations_export.csv' WITH CSV HEADER;

\COPY (
  SELECT row_to_json(claude_conversations) 
  FROM claude_conversations
  ORDER BY created_at ASC
) TO ':export_dirclaude_conversations_export.json';

\echo 'Completed claude_conversations export'


-- ============================================================
-- EXPORTING: CLAUDE_MESSAGES
-- Priority: 4
-- ============================================================
\echo 'Exporting claude_messages...'

\COPY (
  SELECT * FROM claude_messages
  ORDER BY created_at ASC
) TO ':export_dirclaude_messages_export.csv' WITH CSV HEADER;

\COPY (
  SELECT row_to_json(claude_messages) 
  FROM claude_messages
  ORDER BY created_at ASC
) TO ':export_dirclaude_messages_export.json';

\echo 'Completed claude_messages export'


-- Generate summary report
\COPY (
  SELECT 
    'users' as table_name,
    COUNT(*) as record_count,
    MIN(created_at) as earliest,
    MAX(created_at) as latest
  FROM users
  
  UNION ALL
  
  SELECT 
    'maya_chats',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  FROM maya_chats
  
  UNION ALL
  
  SELECT 
    'maya_chat_messages',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  FROM maya_chat_messages
  
  UNION ALL
  
  SELECT 
    'user_models',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  FROM user_models
  
  UNION ALL
  
  SELECT 
    'subscriptions',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  FROM subscriptions
  
  UNION ALL
  
  SELECT 
    'ai_images',
    COUNT(*),
    MIN(created_at),
    MAX(created_at)
  FROM ai_images

) TO ':export_dir export_summary.csv' WITH CSV HEADER;

COMMIT;

\echo 'SSELFIE Studio data export completed!'
\echo 'Export files created in: ' :export_dir
\timing off

-- ============================================================
-- EXPORT COMPLETE
-- ============================================================

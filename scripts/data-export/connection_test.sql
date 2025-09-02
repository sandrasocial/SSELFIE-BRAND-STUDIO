-- ============================================================
-- DATABASE CONNECTION AND VERIFICATION TEST
-- Run this first to verify database access
-- ============================================================

-- Test database connection
SELECT 
  current_database() as database_name,
  current_user as user_name,
  version() as postgres_version,
  now() as connection_time;

-- Verify critical tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users',
    'maya_chats', 
    'maya_chat_messages',
    'user_models',
    'subscriptions',
    'ai_images'
  )
ORDER BY table_name;

-- Check record counts
SELECT 
  'users' as table_name,
  COUNT(*) as records
FROM users

UNION ALL

SELECT 
  'maya_chats',
  COUNT(*)
FROM maya_chats

UNION ALL

SELECT 
  'maya_chat_messages', 
  COUNT(*)
FROM maya_chat_messages

UNION ALL

SELECT 
  'user_models',
  COUNT(*)
FROM user_models

UNION ALL

SELECT 
  'subscriptions',
  COUNT(*)
FROM subscriptions

UNION ALL

SELECT 
  'ai_images',
  COUNT(*)
FROM ai_images;

-- ============================================================
-- If all queries above run successfully, database is ready for export
-- ============================================================

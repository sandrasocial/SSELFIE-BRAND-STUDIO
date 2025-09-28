-- Migration 0011: Add performance indexes for production readiness
-- This migration adds indexes to optimize common queries

-- Add full-text search index for maya_chat_messages content
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maya_messages_content_search 
ON maya_chat_messages USING gin(to_tsvector('english', content))
WHERE content IS NOT NULL;

-- Add index for maya_images category lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maya_images_category 
ON maya_images(category)
WHERE category IS NOT NULL;

-- Add index for maya_concepts type lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maya_concepts_type 
ON maya_concepts(type)
WHERE type IS NOT NULL;

-- Add composite index for user_id and created_at for efficient user queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maya_messages_user_created 
ON maya_chat_messages(user_id, created_at DESC)
WHERE user_id IS NOT NULL;

-- Add index for maya_images user_id and created_at
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maya_images_user_created 
ON maya_images(user_id, created_at DESC)
WHERE user_id IS NOT NULL;

-- Add index for maya_concepts user_id and updated_at
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maya_concepts_user_updated 
ON maya_concepts(user_id, updated_at DESC)
WHERE user_id IS NOT NULL;

-- Add index for message session lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maya_messages_session 
ON maya_chat_messages(session_id)
WHERE session_id IS NOT NULL;

-- Add index for image status filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maya_images_status 
ON maya_images(status)
WHERE status IS NOT NULL;

-- Add partial index for active/published content only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_maya_concepts_active 
ON maya_concepts(user_id, type, updated_at DESC)
WHERE status = 'active' OR status = 'published';

-- Add index for efficient user authentication queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_verified 
ON users(email)
WHERE email_verified = true;

-- Add index for hair_trends performance (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hair_trends') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hair_trends_category_created 
        ON hair_trends(category, created_at DESC);
    END IF;
END $$;

-- Add index for hair_leads performance (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hair_leads') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_hair_leads_status_created 
        ON hair_leads(status, created_at DESC);
    END IF;
END $$;

-- Add index for video performance (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'generated_videos') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_videos_user_status 
        ON generated_videos(user_id, status)
        WHERE user_id IS NOT NULL;
    END IF;
END $$;

-- Add index for brand assets (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_assets') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brand_assets_type_user 
        ON brand_assets(asset_type, user_id)
        WHERE user_id IS NOT NULL;
    END IF;
END $$;

-- Add index for live sessions (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'live_sessions') THEN
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_live_sessions_status 
        ON live_sessions(status, created_at DESC);
    END IF;
END $$;

-- Add maintenance commands for index optimization
-- These should be run periodically in production

-- Update table statistics for better query planning
ANALYZE maya_chat_messages;
ANALYZE maya_images;
ANALYZE maya_concepts;
ANALYZE users;

-- Note: CONCURRENTLY option allows index creation without blocking writes
-- This is important for production environments with active traffic
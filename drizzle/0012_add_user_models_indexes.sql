-- Migration 0012: Fix user_models table performance for Maya generation
-- This migration adds critical indexes to resolve 1500ms timeout issues

-- Add primary performance index for user_id lookups (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_models_user_id 
ON user_models(user_id)
WHERE user_id IS NOT NULL;

-- Add index for training status filtering (Maya checks for completed models)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_models_status 
ON user_models(training_status)
WHERE training_status IS NOT NULL;

-- Add composite index for user_id + training_status (Maya's exact query pattern)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_models_user_status 
ON user_models(user_id, training_status)
WHERE user_id IS NOT NULL AND training_status IS NOT NULL;

-- Add index for trigger_word lookups (used in model validation)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_models_trigger_word 
ON user_models(trigger_word)
WHERE trigger_word IS NOT NULL;

-- Add index for replicate_version_id lookups (used in generation)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_models_version_id 
ON user_models(replicate_version_id)
WHERE replicate_version_id IS NOT NULL;

-- Add partial index for completed models only (Maya's primary use case)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_models_completed 
ON user_models(user_id, replicate_version_id, trigger_word)
WHERE training_status = 'completed' AND replicate_version_id IS NOT NULL;

-- Add index for model type filtering (flux-dev vs flux-pro)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_models_type 
ON user_models(model_type, training_status)
WHERE model_type IS NOT NULL;

-- Update table statistics for better query planning
ANALYZE user_models;

-- Verify the unique constraints still work correctly
-- The existing UNIQUE constraints on user_id and trigger_word are maintained

-- Performance note: CONCURRENTLY option allows index creation without blocking writes
-- This prevents downtime during migration in production environment
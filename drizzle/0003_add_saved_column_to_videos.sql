-- Add saved column to generated_videos table for favorites functionality
ALTER TABLE "generated_videos" ADD COLUMN IF NOT EXISTS "saved" boolean DEFAULT false;
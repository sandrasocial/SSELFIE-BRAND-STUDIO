-- Migration: Add Live Sessions Table for Stage Mode
-- Created: 2025-01-19
-- Description: Adds live_sessions table for interactive presentation sessions

-- Live Sessions - Store session data for Stage Mode presentations
CREATE TABLE IF NOT EXISTS "live_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"deck_url" text,
	"menti_url" text,
	"cta_url" text,
	"title" text NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);

-- Add foreign key constraint to users table
DO $$ BEGIN
 ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_live_sessions_created_by" ON "live_sessions" ("created_by");
CREATE INDEX IF NOT EXISTS "idx_live_sessions_created_at" ON "live_sessions" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_live_sessions_title" ON "live_sessions" ("title");

-- Add updated_at trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_live_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_live_sessions_updated_at
  BEFORE UPDATE ON live_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_live_sessions_updated_at();

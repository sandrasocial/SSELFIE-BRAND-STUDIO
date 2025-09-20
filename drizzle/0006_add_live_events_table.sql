-- Migration: Add Live Events Table for Stage Mode Analytics
-- Created: 2025-01-19
-- Description: Adds live_events table for tracking Stage Mode interactions and analytics

-- Live Events - Store analytics events for Stage Mode sessions
CREATE TABLE IF NOT EXISTS "live_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"session_id" uuid NOT NULL,
	"event_type" varchar NOT NULL, -- 'qr_view', 'cta_click', 'signup_success', 'reaction', 'state_change'
	"meta" jsonb DEFAULT '{}'::jsonb, -- Additional event metadata
	"user_agent" text,
	"ip_address" inet,
	"utm_source" varchar,
	"utm_campaign" varchar,
	"utm_medium" varchar,
	"utm_content" varchar,
	"utm_term" varchar,
	"created_at" timestamptz DEFAULT now() NOT NULL
);

-- Add foreign key constraint to live_sessions table
DO $$ BEGIN
 ALTER TABLE "live_events" ADD CONSTRAINT "live_events_session_id_live_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "live_sessions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add indexes for performance and analytics queries
CREATE INDEX IF NOT EXISTS "idx_live_events_session_id" ON "live_events" ("session_id");
CREATE INDEX IF NOT EXISTS "idx_live_events_type" ON "live_events" ("event_type");
CREATE INDEX IF NOT EXISTS "idx_live_events_created_at" ON "live_events" ("created_at");
CREATE INDEX IF NOT EXISTS "idx_live_events_session_type" ON "live_events" ("session_id", "event_type");
CREATE INDEX IF NOT EXISTS "idx_live_events_utm_source" ON "live_events" ("utm_source");

-- Add composite index for analytics queries
CREATE INDEX IF NOT EXISTS "idx_live_events_analytics" ON "live_events" ("session_id", "event_type", "created_at");

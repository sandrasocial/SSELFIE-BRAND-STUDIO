-- Add video_storyboards table for multi-scene video composition
CREATE TABLE IF NOT EXISTS "video_storyboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"scenes" jsonb NOT NULL,
	"mode" varchar DEFAULT 'sequential',
	"composed_video_url" varchar,
	"status" varchar DEFAULT 'pending',
	"progress" integer DEFAULT 0,
	"job_id" varchar,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);

-- Add foreign key constraint
ALTER TABLE "video_storyboards" ADD CONSTRAINT "video_storyboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "video_storyboards_user_id_idx" ON "video_storyboards" ("user_id");
CREATE INDEX IF NOT EXISTS "video_storyboards_status_idx" ON "video_storyboards" ("status");


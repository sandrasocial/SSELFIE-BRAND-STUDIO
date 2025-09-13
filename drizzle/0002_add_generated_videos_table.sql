-- Add generated_videos table for VEO 3 video generation
CREATE TABLE IF NOT EXISTS "generated_videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"image_id" integer,
	"image_source" varchar DEFAULT 'generated',
	"motion_prompt" text NOT NULL,
	"video_url" varchar,
	"job_id" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"estimated_time" varchar,
	"progress" integer DEFAULT 0,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);

-- Add foreign key constraint
ALTER TABLE "generated_videos" ADD CONSTRAINT "generated_videos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "generated_videos_user_id_idx" ON "generated_videos" ("user_id");
CREATE INDEX IF NOT EXISTS "generated_videos_job_id_idx" ON "generated_videos" ("job_id");
CREATE INDEX IF NOT EXISTS "generated_videos_status_idx" ON "generated_videos" ("status");
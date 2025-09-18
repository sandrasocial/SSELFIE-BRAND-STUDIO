-- Migration: Add image variants table for inpainting and variations feature
-- Created: 2025-01-18

CREATE TABLE IF NOT EXISTS "image_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"original_image_id" integer,
	"original_image_type" varchar NOT NULL,
	"image_url" varchar NOT NULL,
	"kind" varchar NOT NULL,
	"prompt" text,
	"mask_data" text,
	"prediction_id" varchar,
	"generation_status" varchar DEFAULT 'pending',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);

-- Add foreign key constraint
DO $$ BEGIN
 ALTER TABLE "image_variants" ADD CONSTRAINT "image_variants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_image_variants_user_id" ON "image_variants" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_image_variants_original" ON "image_variants" ("original_image_id", "original_image_type");
CREATE INDEX IF NOT EXISTS "idx_image_variants_kind" ON "image_variants" ("kind");
CREATE INDEX IF NOT EXISTS "idx_image_variants_status" ON "image_variants" ("generation_status");

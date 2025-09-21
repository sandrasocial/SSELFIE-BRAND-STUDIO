-- Migration: Add Image Variants Table
-- Created: 2025-01-18
-- Description: Adds images_variants table for storing HD upscaled versions of images (non-breaking)

-- Image Variants - Store different variants of images (HD upscaled, etc.)
CREATE TABLE IF NOT EXISTS "images_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_id" integer NOT NULL REFERENCES "ai_images"("id") ON DELETE CASCADE,
	"kind" varchar NOT NULL, -- 'hd', 'compressed', 'cropped', etc.
	"url" varchar NOT NULL,
	"width" integer,
	"height" integer,
	"provider" varchar, -- 'real_esrgan', 'topaz', etc.
	"scale" integer, -- 2, 4, etc. for upscaled images
	"file_size" integer, -- in bytes
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_images_variants_image_id" ON "images_variants" ("image_id");
CREATE INDEX IF NOT EXISTS "idx_images_variants_kind" ON "images_variants" ("kind");
CREATE INDEX IF NOT EXISTS "idx_images_variants_created_at" ON "images_variants" ("created_at");

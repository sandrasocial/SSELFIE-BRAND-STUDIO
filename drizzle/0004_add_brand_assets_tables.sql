-- Migration for P3-C Brand Assets feature
-- Creates brand_assets and image_variants tables

CREATE TABLE IF NOT EXISTS "brand_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"kind" varchar NOT NULL,
	"url" varchar NOT NULL,
	"filename" varchar NOT NULL,
	"file_size" integer,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_brand_assets_user" ON "brand_assets" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_brand_assets_kind" ON "brand_assets" ("kind");

ALTER TABLE "brand_assets" ADD CONSTRAINT "brand_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;

CREATE TABLE IF NOT EXISTS "image_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"original_image_id" integer NOT NULL,
	"variant_url" varchar NOT NULL,
	"variant_type" varchar NOT NULL,
	"brand_asset_id" integer,
	"placement_data" jsonb,
	"processing_status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_image_variants_user" ON "image_variants" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_image_variants_original" ON "image_variants" ("original_image_id");
CREATE INDEX IF NOT EXISTS "idx_image_variants_asset" ON "image_variants" ("brand_asset_id");

ALTER TABLE "image_variants" ADD CONSTRAINT "image_variants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "image_variants" ADD CONSTRAINT "image_variants_original_image_id_ai_images_id_fk" FOREIGN KEY ("original_image_id") REFERENCES "ai_images"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "image_variants" ADD CONSTRAINT "image_variants_brand_asset_id_brand_assets_id_fk" FOREIGN KEY ("brand_asset_id") REFERENCES "brand_assets"("id") ON DELETE set null ON UPDATE no action;

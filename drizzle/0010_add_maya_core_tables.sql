-- Migration: Add Maya Core Tables
-- Created: 2024-12-28
-- Description: Adds core Maya system tables for models, images, concepts, payments, and profiles

-- Maya Models Table - AI Model Training and Management
CREATE TABLE IF NOT EXISTS "maya_models" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"model_type" varchar NOT NULL,
	"training_status" varchar NOT NULL,
	"training_progress" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"quality_score" integer,
	"usage_count" integer DEFAULT 0,
	"last_used" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Maya Images Table - Generated and User Images
CREATE TABLE IF NOT EXISTS "maya_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"url" varchar NOT NULL,
	"thumbnail_url" varchar,
	"category" varchar,
	"subcategory" varchar,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"is_favorite" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"rating" integer,
	"view_count" integer DEFAULT 0,
	"share_count" integer DEFAULT 0,
	"download_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Maya Concepts Table - Creative Concepts and Prompts
CREATE TABLE IF NOT EXISTS "maya_concepts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"prompt" text,
	"type" varchar,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"usage_count" integer DEFAULT 0,
	"success_rate" integer,
	"avg_rating" numeric(3, 2),
	"status" varchar DEFAULT 'active',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_template" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Maya Payments Table - Stripe Integration and Billing
CREATE TABLE IF NOT EXISTS "maya_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"stripe_session_id" varchar,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"subscription_status" varchar,
	"plan_type" varchar,
	"billing_cycle" varchar,
	"amount" integer,
	"currency" varchar DEFAULT 'usd',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"trial_ends_at" timestamp,
	"subscription_ends_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Maya Profile Table - User Preferences and Settings
CREATE TABLE IF NOT EXISTS "maya_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"onboarding_status" varchar DEFAULT 'pending',
	"onboarding_step" integer DEFAULT 1,
	"completed_steps" jsonb DEFAULT '[]'::jsonb,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"billing_info" jsonb DEFAULT '{}'::jsonb,
	"total_generations" integer DEFAULT 0,
	"monthly_generations" integer DEFAULT 0,
	"last_reset_date" timestamp DEFAULT now(),
	"feature_access" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "maya_models" ADD CONSTRAINT "maya_models_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "maya_images" ADD CONSTRAINT "maya_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "maya_concepts" ADD CONSTRAINT "maya_concepts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "maya_payments" ADD CONSTRAINT "maya_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "maya_profile" ADD CONSTRAINT "maya_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_maya_models_user_id" ON "maya_models" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_maya_models_status" ON "maya_models" ("user_id", "training_status");
CREATE INDEX IF NOT EXISTS "idx_maya_models_type" ON "maya_models" ("user_id", "model_type");

CREATE INDEX IF NOT EXISTS "idx_maya_images_user_id" ON "maya_images" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_maya_images_category" ON "maya_images" ("user_id", "category");
CREATE INDEX IF NOT EXISTS "idx_maya_images_favorites" ON "maya_images" ("user_id", "is_favorite");
CREATE INDEX IF NOT EXISTS "idx_maya_images_created" ON "maya_images" ("created_at");

CREATE INDEX IF NOT EXISTS "idx_maya_concepts_user_id" ON "maya_concepts" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_maya_concepts_type" ON "maya_concepts" ("user_id", "type");
CREATE INDEX IF NOT EXISTS "idx_maya_concepts_status" ON "maya_concepts" ("status");
CREATE INDEX IF NOT EXISTS "idx_maya_concepts_usage" ON "maya_concepts" ("usage_count");

CREATE INDEX IF NOT EXISTS "idx_maya_payments_user_id" ON "maya_payments" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_maya_payments_status" ON "maya_payments" ("user_id", "subscription_status");
CREATE INDEX IF NOT EXISTS "idx_maya_payments_stripe_customer" ON "maya_payments" ("stripe_customer_id");
CREATE INDEX IF NOT EXISTS "idx_maya_payments_active" ON "maya_payments" ("is_active");

CREATE INDEX IF NOT EXISTS "idx_maya_profile_user_id" ON "maya_profile" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_maya_profile_onboarding" ON "maya_profile" ("user_id", "onboarding_status");
CREATE INDEX IF NOT EXISTS "idx_maya_profile_generations" ON "maya_profile" ("user_id", "monthly_generations");
-- Migration: Add Maya Onboarding Tables
-- Created: 2025-08-27
-- Description: Adds comprehensive Maya onboarding system with personal brand discovery

-- User Personal Brand - Core transformation story and vision
CREATE TABLE IF NOT EXISTS "user_personal_brand" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"transformation_story" text,
	"current_situation" text,
	"struggles_story" text,
	"personality_traits" jsonb DEFAULT '[]'::jsonb,
	"dream_outcome" text,
	"future_vision" text,
	"business_goals" text,
	"target_audience" text,
	"values_and_mission" text,
	"business_type" varchar,
	"brand_vision" text,
	"unique_value_proposition" text,
	"professional_goals" text,
	"photo_usage_goals" jsonb DEFAULT '[]'::jsonb,
	"content_creation_goals" text,
	"professional_image_goals" text,
	"onboarding_step" integer DEFAULT 1,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- User Style Profile - Comprehensive style preferences
CREATE TABLE IF NOT EXISTS "user_style_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"personal_brand_id" integer,
	"style_categories" jsonb DEFAULT '[]'::jsonb,
	"color_preferences" jsonb DEFAULT '{"primaryColors":[],"accentColors":[],"avoidColors":[]}'::jsonb,
	"settings_preferences" jsonb DEFAULT '[]'::jsonb,
	"location_vibes" jsonb DEFAULT '[]'::jsonb,
	"clothing_preferences" jsonb DEFAULT '{"preferredStyles":[],"favoriteItems":[],"bodyTypeConsiderations":[],"comfortLevel":"moderate","occasionTypes":[]}'::jsonb,
	"beauty_preferences" jsonb DEFAULT '{"makeupStyle":"natural","hairPreferences":[],"skinToneConsiderations":"","beautyComfortLevel":"moderate"}'::jsonb,
	"style_avoidances" jsonb DEFAULT '[]'::jsonb,
	"boundaries_and_limits" text,
	"inspiration_images" jsonb DEFAULT '[]'::jsonb,
	"style_icons" jsonb DEFAULT '[]'::jsonb,
	"brand_references" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Maya Personal Memory - Maya's personalized understanding of each user
CREATE TABLE IF NOT EXISTS "maya_personal_memory" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"personal_brand_id" integer,
	"personal_insights" jsonb DEFAULT '{"coreMotivations":[],"transformationJourney":"","strengthsIdentified":[],"growthAreas":[],"personalityNotes":"","communicationStyle":""}'::jsonb,
	"ongoing_goals" jsonb DEFAULT '{"shortTermGoals":[],"longTermVision":[],"milestonesToCelebrate":[],"challengesToSupport":[]}'::jsonb,
	"preferred_topics" jsonb DEFAULT '[]'::jsonb,
	"conversation_style" jsonb DEFAULT '{"energyLevel":"balanced","supportType":"friend","communicationTone":"encouraging","motivationApproach":"support"}'::jsonb,
	"personalized_styling_notes" text,
	"successful_prompt_patterns" jsonb DEFAULT '[]'::jsonb,
	"user_feedback_patterns" jsonb DEFAULT '{"lovedElements":[],"dislikedElements":[],"requestPatterns":[]}'::jsonb,
	"last_memory_update" timestamp DEFAULT now(),
	"memory_version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "user_personal_brand" ADD CONSTRAINT "user_personal_brand_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_style_profile" ADD CONSTRAINT "user_style_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_style_profile" ADD CONSTRAINT "user_style_profile_personal_brand_id_user_personal_brand_id_fk" FOREIGN KEY ("personal_brand_id") REFERENCES "user_personal_brand"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "maya_personal_memory" ADD CONSTRAINT "maya_personal_memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "maya_personal_memory" ADD CONSTRAINT "maya_personal_memory_personal_brand_id_user_personal_brand_id_fk" FOREIGN KEY ("personal_brand_id") REFERENCES "user_personal_brand"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_user_personal_brand_user_id" ON "user_personal_brand" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_personal_brand_completed" ON "user_personal_brand" ("user_id", "is_completed");
CREATE INDEX IF NOT EXISTS "idx_user_style_profile_user_id" ON "user_style_profile" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_maya_personal_memory_user_id" ON "maya_personal_memory" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_maya_personal_memory_updated" ON "maya_personal_memory" ("user_id", "last_memory_update");
-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "agent_capabilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_name" varchar NOT NULL,
	"capability_type" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"enabled" boolean DEFAULT true,
	"config" jsonb,
	"version" varchar DEFAULT '1.0',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"user_message" text NOT NULL,
	"agent_response" text NOT NULL,
	"dev_preview" jsonb,
	"timestamp" timestamp DEFAULT now(),
	"conversation_title" varchar,
	"conversation_data" jsonb,
	"message_count" integer DEFAULT 0,
	"last_agent_response" text,
	"is_active" boolean DEFAULT true,
	"is_starred" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"parent_thread_id" integer,
	"branched_from_message_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_knowledge_base" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" varchar NOT NULL,
	"topic" varchar NOT NULL,
	"content" text NOT NULL,
	"source" varchar NOT NULL,
	"confidence" numeric NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"tags" text[]
);
--> statement-breakpoint
CREATE TABLE "agent_session_contexts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"agent_id" varchar NOT NULL,
	"session_id" varchar NOT NULL,
	"context_data" jsonb NOT NULL,
	"workflow_state" varchar DEFAULT 'ready',
	"last_interaction" timestamp DEFAULT now(),
	"memory_snapshot" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"admin_bypass" boolean DEFAULT false,
	"unlimited_context" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "agent_performance_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" varchar NOT NULL,
	"task_type" varchar NOT NULL,
	"success_rate" numeric NOT NULL,
	"average_time" integer DEFAULT 0,
	"user_satisfaction_score" numeric DEFAULT '0',
	"total_tasks" integer DEFAULT 0,
	"improvement_trend" varchar DEFAULT 'stable',
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_onboarding" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"business_name" varchar NOT NULL,
	"tagline" text NOT NULL,
	"personal_story" text NOT NULL,
	"why_started" text,
	"target_client" text NOT NULL,
	"problem_you_solve" text NOT NULL,
	"unique_approach" text NOT NULL,
	"primary_offer" varchar NOT NULL,
	"primary_offer_price" varchar NOT NULL,
	"secondary_offer" varchar,
	"secondary_offer_price" varchar,
	"free_resource" text,
	"instagram_handle" varchar,
	"website_url" varchar,
	"email" varchar NOT NULL,
	"location" varchar,
	"brand_personality" varchar NOT NULL,
	"brand_values" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"style_preference" varchar DEFAULT 'editorial-luxury',
	"color_scheme" varchar DEFAULT 'black-white-editorial',
	"typography_style" varchar DEFAULT 'times-editorial',
	"design_personality" varchar DEFAULT 'sophisticated',
	"feed_personality" varchar,
	"preferred_typography" varchar,
	"brand_messaging_style" varchar,
	CONSTRAINT "brand_onboarding_user_id_key" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "agent_tasks" (
	"task_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_name" text NOT NULL,
	"instruction" text NOT NULL,
	"conversation_context" jsonb,
	"priority" text DEFAULT 'medium',
	"completion_criteria" jsonb,
	"quality_gates" jsonb,
	"estimated_duration" integer,
	"status" text DEFAULT 'pending',
	"progress" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"execution_data" jsonb,
	"implementations" jsonb,
	"rollback_plan" jsonb,
	"validation_results" jsonb,
	"results" jsonb,
	"validation_status" text,
	"error_log" text
);
--> statement-breakpoint
CREATE TABLE "architecture_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"audit_date" timestamp DEFAULT now(),
	"total_users" integer,
	"compliant_users" integer,
	"violations_found" text[],
	"violations_fixed" text[],
	"audit_status" varchar(50)
);
--> statement-breakpoint
CREATE TABLE "agent_learning" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_name" varchar NOT NULL,
	"user_id" varchar,
	"learning_type" varchar NOT NULL,
	"category" varchar,
	"data" jsonb NOT NULL,
	"confidence" numeric(3, 2) DEFAULT '0.5',
	"frequency" integer DEFAULT 1,
	"last_seen" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"intelligence_level" integer DEFAULT 7,
	"memory_strength" numeric(3, 2) DEFAULT '0.7'
);
--> statement-breakpoint
CREATE TABLE "brandbooks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"business_name" varchar NOT NULL,
	"tagline" varchar,
	"story" text,
	"primary_font" varchar DEFAULT 'Times New Roman',
	"secondary_font" varchar DEFAULT 'Inter',
	"primary_color" varchar DEFAULT '#0a0a0a',
	"secondary_color" varchar DEFAULT '#ffffff',
	"accent_color" varchar DEFAULT '#f5f5f5',
	"logo_type" varchar NOT NULL,
	"logo_url" varchar,
	"logo_prompt" text,
	"moodboard_style" varchar NOT NULL,
	"voice_tone" text,
	"voice_personality" text,
	"key_phrases" text,
	"is_published" boolean DEFAULT false,
	"brandbook_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"template_type" varchar DEFAULT 'minimal-executive',
	"custom_domain" varchar,
	"is_live" boolean DEFAULT false,
	CONSTRAINT "brandbooks_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "claude_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" varchar NOT NULL,
	"role" varchar NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"tool_calls" jsonb,
	"tool_results" jsonb,
	"timestamp" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "claude_messages_content_not_empty" CHECK ((content IS NOT NULL) AND (length(TRIM(BOTH FROM content)) > 0))
);
--> statement-breakpoint
CREATE TABLE "dashboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"config" jsonb NOT NULL,
	"onboarding_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"template_type" varchar NOT NULL,
	"quick_links" jsonb,
	"custom_url" varchar,
	"is_published" boolean DEFAULT false,
	"background_color" varchar DEFAULT '#ffffff',
	"accent_color" varchar DEFAULT '#0a0a0a',
	"is_live" boolean DEFAULT false,
	CONSTRAINT "dashboards_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "claude_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"agent_name" varchar NOT NULL,
	"conversation_id" varchar NOT NULL,
	"title" varchar,
	"status" varchar DEFAULT 'active',
	"last_message_at" timestamp DEFAULT now(),
	"message_count" integer DEFAULT 0,
	"context" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"admin_bypass_enabled" boolean DEFAULT false,
	CONSTRAINT "claude_conversations_conversation_id_key" UNIQUE("conversation_id")
);
--> statement-breakpoint
CREATE TABLE "domains" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"domain" varchar NOT NULL,
	"subdomain" varchar,
	"is_verified" boolean DEFAULT false,
	"dns_records" jsonb,
	"ssl_status" varchar DEFAULT 'pending',
	"connected_to" varchar,
	"resource_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "domains_domain_unique" UNIQUE("domain"),
	CONSTRAINT "domains_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
CREATE TABLE "email_captures" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"plan" varchar NOT NULL,
	"source" varchar NOT NULL,
	"captured" timestamp DEFAULT now(),
	"converted" boolean DEFAULT false,
	"user_id" varchar
);
--> statement-breakpoint
CREATE TABLE "generation_trackers" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"prediction_id" varchar,
	"prompt" text,
	"style" varchar,
	"status" varchar DEFAULT 'pending',
	"image_urls" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inspiration_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"image_url" varchar NOT NULL,
	"description" text,
	"tags" jsonb,
	"source" varchar DEFAULT 'upload',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "imported_subscribers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"source" varchar NOT NULL,
	"original_id" varchar NOT NULL,
	"status" varchar NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"custom_fields" jsonb DEFAULT '{}'::jsonb,
	"messenger_data" jsonb,
	"imported_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_subscriber_email" UNIQUE("email"),
	CONSTRAINT "unique_subscriber_source_id" UNIQUE("source","original_id")
);
--> statement-breakpoint
CREATE TABLE "maya_chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"chat_title" varchar(500) NOT NULL,
	"chat_summary" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"chat_category" varchar DEFAULT 'Style Consultation',
	"last_activity" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "landing_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"template" varchar NOT NULL,
	"config" jsonb NOT NULL,
	"onboarding_data" jsonb,
	"is_published" boolean DEFAULT false,
	"url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"custom_url" varchar,
	"custom_domain" varchar,
	"is_live" boolean DEFAULT false,
	"seo_title" varchar,
	"seo_description" text
);
--> statement-breakpoint
CREATE TABLE "maya_personal_memory" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"personal_brand_id" integer,
	"personal_insights" jsonb DEFAULT '{"growthAreas":[],"coreMotivations":[],"personalityNotes":"","communicationStyle":"","strengthsIdentified":[],"transformationJourney":""}'::jsonb,
	"ongoing_goals" jsonb DEFAULT '{"longTermVision":[],"shortTermGoals":[],"challengesToSupport":[],"milestonesToCelebrate":[]}'::jsonb,
	"preferred_topics" jsonb DEFAULT '[]'::jsonb,
	"conversation_style" jsonb DEFAULT '{"energyLevel":"balanced","supportType":"friend","communicationTone":"encouraging","motivationApproach":"support"}'::jsonb,
	"personalized_styling_notes" text,
	"successful_prompt_patterns" jsonb DEFAULT '[]'::jsonb,
	"user_feedback_patterns" jsonb DEFAULT '{"lovedElements":[],"requestPatterns":[],"dislikedElements":[]}'::jsonb,
	"last_memory_update" timestamp DEFAULT now(),
	"memory_version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "generated_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"model_id" integer,
	"category" varchar NOT NULL,
	"subcategory" varchar NOT NULL,
	"prompt" text NOT NULL,
	"image_urls" text NOT NULL,
	"selected_url" text,
	"saved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "model_recovery_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"old_model_id" varchar(255),
	"new_model_id" varchar(255),
	"recovery_status" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"status" varchar DEFAULT 'draft',
	"template_id" varchar,
	"custom_domain" varchar,
	"ai_images_generated" boolean DEFAULT false,
	"content_generated" boolean DEFAULT false,
	"payment_setup" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"prompt" text NOT NULL,
	"camera" varchar,
	"texture" varchar,
	"collection" varchar DEFAULT 'My Prompts',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sandra_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"response" text NOT NULL,
	"user_style_preferences" jsonb,
	"suggested_prompt" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "selfie_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"filename" varchar NOT NULL,
	"original_url" varchar NOT NULL,
	"processed_url" varchar,
	"processing_status" varchar DEFAULT 'pending',
	"ai_model_output" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"upload_progress" jsonb,
	"validation_status" varchar(50),
	"error_details" jsonb,
	"guided_step_completion" jsonb
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photo_selections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"selected_selfie_ids" jsonb NOT NULL,
	"selected_flatlay_collection" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "styleguide_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"colors" jsonb NOT NULL,
	"typography" jsonb NOT NULL,
	"style_profile" jsonb NOT NULL,
	"preview_image" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "styleguide_templates_template_id_key" UNIQUE("template_id")
);
--> statement-breakpoint
CREATE TABLE "usage_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"action_type" varchar NOT NULL,
	"resource_used" varchar NOT NULL,
	"cost" numeric(6, 4) NOT NULL,
	"details" jsonb,
	"generated_image_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"category" varchar,
	"preview_image_url" varchar,
	"template_data" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"plan" varchar NOT NULL,
	"status" varchar NOT NULL,
	"stripe_subscription_id" varchar,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"full_name" varchar,
	"phone" varchar,
	"location" varchar,
	"instagram_handle" varchar,
	"website_url" varchar,
	"bio" text,
	"brand_vibe" text,
	"goals" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_personal_brand" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"transformation_story" text,
	"current_situation" text,
	"future_vision" text,
	"business_goals" text,
	"business_type" varchar,
	"onboarding_step" integer DEFAULT 1,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"style_preferences" text,
	"photo_goals" text,
	"name" text
);
--> statement-breakpoint
CREATE TABLE "user_landing_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"html_content" text NOT NULL,
	"css_content" text NOT NULL,
	"template_used" varchar,
	"is_published" boolean DEFAULT false,
	"custom_domain" varchar,
	"seo_title" varchar,
	"seo_description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_landing_pages_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_simplified_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"transformation_story" text,
	"current_situation" text,
	"future_vision" text,
	"business_goals" text,
	"business_type" varchar,
	"style_preferences" text,
	"photo_goals" text,
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_styleguides" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"template_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"colors" jsonb NOT NULL,
	"typography" jsonb NOT NULL,
	"content" jsonb NOT NULL,
	"ai_images" jsonb,
	"moodboard_images" jsonb,
	"status" varchar DEFAULT 'draft',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"plan" varchar NOT NULL,
	"total_generations_allowed" integer,
	"total_generations_used" integer DEFAULT 0,
	"monthly_generations_allowed" integer,
	"monthly_generations_used" integer DEFAULT 0,
	"total_cost_incurred" numeric(10, 4) DEFAULT '0.0000',
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"is_limit_reached" boolean DEFAULT false,
	"last_generation_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"upload_count" integer DEFAULT 0,
	"upload_status" varchar(50),
	"last_upload" timestamp,
	"completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "user_website_onboarding" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"personal_brand_name" varchar(255),
	"story" text,
	"business_type" varchar(255),
	"color_preferences" jsonb DEFAULT '{}'::jsonb,
	"target_audience" text,
	"brand_keywords" jsonb DEFAULT '[]'::jsonb,
	"goals" text,
	"current_step" varchar(255) DEFAULT 'story',
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "victoria_chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" varchar NOT NULL,
	"message" text NOT NULL,
	"sender" varchar NOT NULL,
	"message_type" varchar DEFAULT 'text',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_models" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"replicate_model_id" varchar,
	"trigger_word" varchar NOT NULL,
	"training_status" varchar DEFAULT 'pending',
	"model_name" varchar,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"replicate_version_id" varchar,
	"training_progress" integer DEFAULT 0,
	"estimated_completion_time" timestamp,
	"failure_reason" text,
	"updated_at" timestamp DEFAULT now(),
	"trained_model_path" varchar(255),
	"started_at" timestamp,
	"is_luxury" boolean DEFAULT false,
	"model_type" varchar(255) DEFAULT 'flux-standard',
	"finetune_id" varchar(255),
	"lora_weights_url" varchar,
	"training_id" varchar,
	CONSTRAINT "user_models_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_models_trigger_word_unique" UNIQUE("trigger_word")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"maya_ai_access" boolean DEFAULT true,
	"victoria_ai_access" boolean DEFAULT false,
	"plan" varchar DEFAULT 'sselfie-studio',
	"role" varchar DEFAULT 'user',
	"monthly_generation_limit" integer DEFAULT 100,
	"generations_used_this_month" integer DEFAULT 0,
	"auth_provider" varchar DEFAULT 'stack-auth',
	"stack_auth_user_id" varchar,
	"display_name" varchar,
	"last_login_at" timestamp,
	"profile_completed" boolean DEFAULT false,
	"onboarding_step" integer DEFAULT 0,
	"gender" varchar,
	"profession" varchar,
	"brand_style" varchar,
	"photo_goals" text,
	"has_retraining_access" boolean DEFAULT false,
	"retraining_session_id" varchar,
	"retraining_paid_at" timestamp,
	"stack_auth_id" varchar,
	"training_coaching_started" boolean DEFAULT false,
	"training_coaching_completed" boolean DEFAULT false,
	"training_coaching_phase" varchar,
	"training_coaching_step" integer DEFAULT 0,
	"brand_strategy_context" jsonb,
	"onboarding_progress" jsonb DEFAULT '{}'::jsonb,
	"preferred_onboarding_mode" varchar DEFAULT 'conversational',
	"visual_template" varchar,
	"brand_colors" jsonb,
	"typography_preferences" jsonb,
	"feed_aesthetic" varchar,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_stack_auth_id_key" UNIQUE("stack_auth_id")
);
--> statement-breakpoint
CREATE TABLE "websites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"url" varchar,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"content" jsonb NOT NULL,
	"template_id" varchar DEFAULT 'victoria-editorial',
	"screenshot_url" varchar,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "websites_slug_key" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "maya_chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"role" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"image_preview" text,
	"generated_prompt" text,
	"created_at" timestamp DEFAULT now(),
	"concept_cards" text,
	"quick_buttons" text,
	"can_generate" boolean DEFAULT false,
	"original_styling_context" text,
	"concept_description" text,
	"styling_details" jsonb,
	CONSTRAINT "maya_chat_messages_role_check" CHECK ((role)::text = ANY ((ARRAY['user'::character varying, 'maya'::character varying, 'assistant'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "playing_with_neon" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"value" real
);
--> statement-breakpoint
CREATE TABLE "user_style_memory" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"preferred_categories" jsonb DEFAULT '[]'::jsonb,
	"favorite_prompt_patterns" jsonb DEFAULT '[]'::jsonb,
	"color_preferences" jsonb DEFAULT '[]'::jsonb,
	"setting_preferences" jsonb DEFAULT '[]'::jsonb,
	"styling_keywords" jsonb DEFAULT '[]'::jsonb,
	"total_interactions" integer DEFAULT 0,
	"total_favorites" integer DEFAULT 0,
	"average_session_length" integer DEFAULT 0,
	"most_active_hours" jsonb DEFAULT '[]'::jsonb,
	"high_performing_prompts" jsonb DEFAULT '[]'::jsonb,
	"rejected_prompts" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "test_persistence" (
	"id" serial PRIMARY KEY NOT NULL,
	"test_data" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stack_auth_migration_marker" (
	"id" serial PRIMARY KEY NOT NULL,
	"migration_timestamp" timestamp DEFAULT now(),
	"migration_status" varchar(50) DEFAULT 'COMPLETED',
	"stack_auth_ready" boolean DEFAULT true,
	"created_by" varchar(50) DEFAULT 'SSELFIE_REPLIT_AGENT'
);
--> statement-breakpoint
CREATE TABLE "prompt_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"original_prompt" text NOT NULL,
	"generated_prompt" text,
	"concept_title" text,
	"category" varchar,
	"was_generated" boolean DEFAULT false,
	"was_favorited" boolean DEFAULT false,
	"was_saved" boolean DEFAULT false,
	"view_duration" integer,
	"prompt_length" integer,
	"keyword_density" jsonb DEFAULT '{}'::jsonb,
	"technical_specs" jsonb DEFAULT '{}'::jsonb,
	"generation_time" integer,
	"success_score" numeric(3, 2) DEFAULT '0.0',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"image_url" varchar NOT NULL,
	"prompt" text,
	"style" varchar,
	"is_selected" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"prediction_id" varchar,
	"generation_status" varchar DEFAULT 'pending',
	"is_favorite" boolean DEFAULT false,
	"generated_prompt" text,
	"category" text DEFAULT 'Lifestyle',
	"source" text DEFAULT 'maya-chat',
	"supports_text_overlay" boolean DEFAULT true,
	"text_overlay_areas" jsonb
);
--> statement-breakpoint
CREATE TABLE "feed_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"name" varchar NOT NULL,
	"category" varchar NOT NULL,
	"description" text,
	"text_overlay_style" jsonb,
	"color_palette" jsonb,
	"typography_settings" jsonb,
	"layout_config" jsonb,
	"is_public" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "branded_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"template_id" integer,
	"original_image_url" varchar NOT NULL,
	"processed_image_url" varchar,
	"text_overlay" text,
	"overlay_position" varchar,
	"overlay_style" jsonb,
	"social_platform" varchar,
	"engagement_data" jsonb,
	"is_published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feed_collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"name" varchar NOT NULL,
	"description" text,
	"post_ids" jsonb,
	"color_theme" jsonb,
	"brand_guidelines" jsonb,
	"target_platforms" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "onboarding_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"brand_story" text,
	"personal_mission" text,
	"business_goals" text,
	"target_audience" text,
	"business_type" varchar,
	"brand_voice" varchar,
	"style_preferences" text,
	"selfie_upload_status" varchar DEFAULT 'not_started',
	"ai_training_status" varchar DEFAULT 'not_started',
	"current_step" integer DEFAULT 1,
	"completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "agent_session_contexts" ADD CONSTRAINT "agent_session_contexts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_onboarding" ADD CONSTRAINT "brand_onboarding_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "agent_learning" ADD CONSTRAINT "agent_learning_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claude_messages" ADD CONSTRAINT "claude_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."claude_conversations"("conversation_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claude_conversations" ADD CONSTRAINT "claude_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domains" ADD CONSTRAINT "domains_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "email_captures" ADD CONSTRAINT "email_captures_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "generation_trackers" ADD CONSTRAINT "generation_trackers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "inspiration_photos" ADD CONSTRAINT "inspiration_photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "maya_personal_memory" ADD CONSTRAINT "maya_personal_memory_personal_brand_id_fkey" FOREIGN KEY ("personal_brand_id") REFERENCES "public"."user_personal_brand"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maya_personal_memory" ADD CONSTRAINT "maya_personal_memory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_images" ADD CONSTRAINT "generated_images_model_id_user_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."user_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_images" ADD CONSTRAINT "generated_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_prompts" ADD CONSTRAINT "saved_prompts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "selfie_uploads" ADD CONSTRAINT "selfie_uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "photo_selections" ADD CONSTRAINT "photo_selections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "usage_history" ADD CONSTRAINT "usage_history_generated_image_id_generated_images_id_fk" FOREIGN KEY ("generated_image_id") REFERENCES "public"."generated_images"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_history" ADD CONSTRAINT "usage_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_personal_brand" ADD CONSTRAINT "user_personal_brand_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_landing_pages" ADD CONSTRAINT "user_landing_pages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_simplified_profile" ADD CONSTRAINT "user_simplified_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_styleguides" ADD CONSTRAINT "user_styleguides_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_usage" ADD CONSTRAINT "user_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_website_onboarding" ADD CONSTRAINT "user_website_onboarding_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "victoria_chats" ADD CONSTRAINT "victoria_chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "user_models" ADD CONSTRAINT "user_models_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maya_chat_messages" ADD CONSTRAINT "maya_chat_messages_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "public"."maya_chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_style_memory" ADD CONSTRAINT "user_style_memory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_analysis" ADD CONSTRAINT "prompt_analysis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_images" ADD CONSTRAINT "ai_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "feed_templates" ADD CONSTRAINT "feed_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branded_posts" ADD CONSTRAINT "branded_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branded_posts" ADD CONSTRAINT "branded_posts_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."feed_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_collections" ADD CONSTRAINT "feed_collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_agent_session_unique" ON "agent_session_contexts" USING btree ("user_id" text_ops,"agent_id" text_ops,"session_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_agent_session_updated" ON "agent_session_contexts" USING btree ("updated_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_agent_session_user" ON "agent_session_contexts" USING btree ("user_id" text_ops,"agent_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_maya_personal_memory_updated" ON "maya_personal_memory" USING btree ("user_id" text_ops,"last_memory_update" text_ops);--> statement-breakpoint
CREATE INDEX "idx_maya_personal_memory_user_id" ON "maya_personal_memory" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_generated_images_saved" ON "generated_images" USING btree ("saved" bool_ops) WHERE (saved = true);--> statement-breakpoint
CREATE INDEX "idx_generated_images_user_created" ON "generated_images" USING btree ("user_id" text_ops,"created_at" text_ops);--> statement-breakpoint
CREATE INDEX "idx_selfie_uploads_created" ON "selfie_uploads" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_selfie_uploads_status" ON "selfie_uploads" USING btree ("processing_status" text_ops);--> statement-breakpoint
CREATE INDEX "idx_selfie_uploads_user_id" ON "selfie_uploads" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire" timestamp_ops);--> statement-breakpoint
CREATE INDEX "idx_user_personal_brand_completed" ON "user_personal_brand" USING btree ("user_id" text_ops,"is_completed" text_ops);--> statement-breakpoint
CREATE INDEX "idx_user_personal_brand_user_id" ON "user_personal_brand" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_user_usage_user_id" ON "user_usage" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE INDEX "idx_ai_images_user_id" ON "ai_images" USING btree ("user_id" text_ops);--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."user_generation_stats" AS (SELECT user_id, count(*) AS total_generations, count( CASE WHEN saved = true THEN 1 ELSE NULL::integer END) AS saved_generations, max(created_at) AS last_generation_date, count( CASE WHEN created_at >= (CURRENT_DATE - '30 days'::interval) THEN 1 ELSE NULL::integer END) AS generations_last_30_days FROM generated_images GROUP BY user_id);
*/
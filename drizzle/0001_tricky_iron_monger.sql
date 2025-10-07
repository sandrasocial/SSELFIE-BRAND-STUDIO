CREATE TABLE "agent_budgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"agent_id" varchar,
	"budget_type" varchar NOT NULL,
	"budget_limit" numeric NOT NULL,
	"current_spend" numeric DEFAULT '0.00',
	"is_active" boolean DEFAULT true,
	"reset_date" timestamp,
	"alert_threshold" integer DEFAULT 80,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
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
	"tags" jsonb DEFAULT '[]',
	"parent_thread_id" integer,
	"branched_from_message_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_cost_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"agent_id" varchar NOT NULL,
	"conversation_id" varchar,
	"api_calls" integer DEFAULT 0,
	"tokens_used" integer DEFAULT 0,
	"estimated_cost" numeric DEFAULT '0.0000',
	"date" timestamp DEFAULT now(),
	"task_type" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_handoff_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_agent_id" varchar NOT NULL,
	"to_target_type" varchar NOT NULL,
	"to_target_id" varchar,
	"request_type" varchar NOT NULL,
	"context_summary" text NOT NULL,
	"urgency_level" varchar DEFAULT 'normal',
	"conversation_id" varchar,
	"original_task" text,
	"current_progress" jsonb,
	"status" varchar DEFAULT 'pending',
	"response_required" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"responded_at" timestamp
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
CREATE TABLE "agent_learning" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_name" varchar NOT NULL,
	"user_id" varchar,
	"learning_type" varchar NOT NULL,
	"category" varchar,
	"data" jsonb NOT NULL,
	"confidence" numeric DEFAULT '0.5',
	"frequency" integer DEFAULT 1,
	"last_seen" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
CREATE TABLE "agent_session_contexts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"agent_id" varchar NOT NULL,
	"session_id" varchar NOT NULL,
	"context_data" jsonb NOT NULL,
	"workflow_state" varchar DEFAULT 'ready',
	"last_interaction" timestamp DEFAULT now() NOT NULL,
	"memory_snapshot" jsonb,
	"admin_bypass" boolean DEFAULT false,
	"unlimited_context" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"conversation_id" varchar,
	"status" varchar DEFAULT 'active',
	"started_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"ended_at" timestamp
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
	"estimated_duration" integer NOT NULL,
	"status" text DEFAULT 'received',
	"progress" integer DEFAULT 0,
	"implementations" jsonb,
	"rollback_plan" jsonb,
	"validation_results" jsonb,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "agent_training_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" varchar NOT NULL,
	"session_type" varchar NOT NULL,
	"training_data" jsonb NOT NULL,
	"improvements" text,
	"performance_gain" numeric,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"trained_by" varchar
);
--> statement-breakpoint
CREATE TABLE "ai_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"image_url" varchar NOT NULL,
	"prompt" text,
	"generated_prompt" text,
	"style" varchar,
	"category" varchar,
	"source" varchar DEFAULT 'workspace',
	"prediction_id" varchar,
	"generation_status" varchar DEFAULT 'pending',
	"is_selected" boolean DEFAULT false,
	"is_favorite" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "approval_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"agent_id" varchar NOT NULL,
	"content_type" varchar NOT NULL,
	"content_title" varchar NOT NULL,
	"content_preview" text NOT NULL,
	"full_content" jsonb NOT NULL,
	"target_audience" varchar,
	"impact_level" varchar DEFAULT 'medium',
	"estimated_cost" numeric,
	"status" varchar DEFAULT 'pending',
	"admin_comments" text,
	"original_conversation_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp,
	"approved_by" varchar
);
--> statement-breakpoint
CREATE TABLE "architecture_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"audit_date" timestamp DEFAULT now(),
	"total_users" integer,
	"compliant_users" integer,
	"violations_found" text[],
	"violations_fixed" text[],
	"audit_status" varchar
);
--> statement-breakpoint
CREATE TABLE "brand_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"kind" varchar NOT NULL,
	"url" varchar NOT NULL,
	"filename" varchar NOT NULL,
	"file_size" integer,
	"meta" jsonb,
	"created_at" timestamp DEFAULT now()
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
	"style_preference" varchar DEFAULT 'editorial-luxury',
	"color_scheme" varchar DEFAULT 'black-white-editorial',
	"typography_style" varchar DEFAULT 'times-editorial',
	"design_personality" varchar DEFAULT 'sophisticated',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "brand_onboarding_user_id_unique" UNIQUE("user_id")
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
	"template_type" varchar DEFAULT 'minimal-executive',
	"custom_domain" varchar,
	"is_live" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
	"admin_bypass_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "claude_conversations_conversation_id_unique" UNIQUE("conversation_id")
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
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "concept_cards" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"conversation_id" varchar,
	"client_id" varchar,
	"title" varchar NOT NULL,
	"description" text,
	"images" jsonb DEFAULT '[]',
	"tags" text[] DEFAULT '{}',
	"status" varchar DEFAULT 'draft',
	"sort_order" integer DEFAULT 0,
	"generated_images" jsonb,
	"is_loading" boolean DEFAULT false,
	"is_generating" boolean DEFAULT false,
	"has_generated" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "conversation_summaries" (
	"id" varchar PRIMARY KEY NOT NULL,
	"conversation_id" varchar NOT NULL,
	"summary" text NOT NULL,
	"last_message_id" varchar,
	"message_count" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "conversation_summaries_conversation_id_unique" UNIQUE("conversation_id")
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"agent_name" varchar DEFAULT 'maya' NOT NULL,
	"title" varchar,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dashboards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"config" jsonb NOT NULL,
	"onboarding_data" jsonb,
	"template_type" varchar NOT NULL,
	"quick_links" jsonb,
	"custom_url" varchar,
	"is_published" boolean DEFAULT false,
	"background_color" varchar DEFAULT '#ffffff',
	"accent_color" varchar DEFAULT '#0a0a0a',
	"is_live" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
CREATE TABLE "email_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"account_type" varchar NOT NULL,
	"email" varchar NOT NULL,
	"provider" varchar NOT NULL,
	"display_name" varchar,
	"access_token" text,
	"refresh_token" text,
	"is_active" boolean DEFAULT true,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_captures" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"plan" varchar(50) DEFAULT 'free' NOT NULL,
	"source" varchar(100) DEFAULT 'landing_page' NOT NULL,
	"captured" timestamp DEFAULT now(),
	"converted" boolean DEFAULT false,
	"user_id" varchar
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
CREATE TABLE "generated_videos" (
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
	"saved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp
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
CREATE TABLE "hair_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"navn" varchar NOT NULL,
	"epost" varchar NOT NULL,
	"telefon" varchar,
	"kilde" varchar DEFAULT 'qr-code',
	"interesse" text,
	"levelpartner_synced" boolean DEFAULT false,
	"levelpartner_synced_at" timestamp,
	"status" varchar DEFAULT 'new',
	"notater" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "image_variants" (
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
--> statement-breakpoint
CREATE TABLE "imported_subscribers" (
	"id" varchar PRIMARY KEY NOT NULL,
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
CREATE TABLE "instagram_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"platform" varchar NOT NULL,
	"external_id" varchar NOT NULL,
	"from_username" varchar NOT NULL,
	"from_id" varchar NOT NULL,
	"message" text NOT NULL,
	"message_type" varchar NOT NULL,
	"received_at" timestamp NOT NULL,
	"category" varchar NOT NULL,
	"priority" varchar NOT NULL,
	"sentiment" varchar NOT NULL,
	"needs_response" boolean DEFAULT false,
	"has_response" boolean DEFAULT false,
	"is_business_opportunity" boolean DEFAULT false,
	"tags" jsonb,
	"ai_summary" text,
	"suggested_response" text,
	"is_archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "landing_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"template_name" varchar NOT NULL,
	"customizations" jsonb,
	"content" jsonb,
	"photo_selections" jsonb,
	"is_published" boolean DEFAULT false,
	"published_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "live_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"event_type" varchar NOT NULL,
	"meta" jsonb DEFAULT '{}'::jsonb,
	"user_agent" text,
	"ip_address" text,
	"utm_source" varchar,
	"utm_campaign" varchar,
	"utm_medium" varchar,
	"utm_content" varchar,
	"utm_term" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "live_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deck_url" text,
	"menti_url" text,
	"cta_url" text,
	"title" text NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lora_weights" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"training_run_id" integer NOT NULL,
	"trigger_word" varchar NOT NULL,
	"base_model" varchar DEFAULT 'flux-dev' NOT NULL,
	"s3_bucket" varchar,
	"s3_key" varchar,
	"file_size" integer,
	"checksum" varchar,
	"rank" integer DEFAULT 32,
	"network_type" varchar DEFAULT 'lora',
	"status" varchar DEFAULT 'available',
	"default_scales" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "maya_chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_id" integer NOT NULL,
	"role" varchar NOT NULL,
	"content" text NOT NULL,
	"image_preview" text,
	"generated_prompt" text,
	"concept_cards" jsonb,
	"quick_buttons" text,
	"can_generate" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "maya_chats" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"chat_title" varchar NOT NULL,
	"chat_summary" text,
	"chat_category" varchar DEFAULT 'Style Consultation',
	"last_activity" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "maya_context_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" varchar NOT NULL,
	"current_mood" varchar,
	"styling_goals" jsonb DEFAULT '[]',
	"contextual_cues" jsonb DEFAULT '{}',
	"adaptation_triggers" jsonb DEFAULT '[]',
	"session_started" timestamp DEFAULT now(),
	"last_interaction" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "maya_personal_memory" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"personal_insights" jsonb,
	"ongoing_goals" jsonb,
	"conversation_style" jsonb,
	"user_feedback_patterns" jsonb,
	"preferred_topics" jsonb,
	"personalized_styling_notes" text,
	"successful_prompt_patterns" jsonb,
	"last_memory_update" timestamp DEFAULT now(),
	"memory_version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY NOT NULL,
	"conversation_id" varchar NOT NULL,
	"role" varchar NOT NULL,
	"content" text NOT NULL,
	"meta" jsonb,
	"token_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "model_recovery_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"old_model_id" varchar,
	"new_model_id" varchar,
	"recovery_status" varchar,
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
	"brand_voice" text,
	"style_preferences" varchar,
	"selfie_upload_status" varchar DEFAULT 'pending',
	"ai_training_status" varchar DEFAULT 'not_started',
	"current_step" integer DEFAULT 1,
	"completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
CREATE TABLE "processed_emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"account_id" integer NOT NULL,
	"external_id" varchar NOT NULL,
	"from_address" varchar NOT NULL,
	"to_addresses" jsonb NOT NULL,
	"subject" text NOT NULL,
	"body_preview" text,
	"received_at" timestamp NOT NULL,
	"category" varchar NOT NULL,
	"priority" varchar NOT NULL,
	"needs_response" boolean DEFAULT false,
	"has_response" boolean DEFAULT false,
	"sentiment" varchar NOT NULL,
	"tags" jsonb,
	"ai_summary" text,
	"suggested_response" text,
	"is_archived" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
	"keyword_density" jsonb DEFAULT '{}',
	"technical_specs" jsonb DEFAULT '{}',
	"generation_time" integer,
	"success_score" numeric DEFAULT '0.0',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sandra_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"message" text NOT NULL,
	"response" text NOT NULL,
	"user_style_preferences" jsonb,
	"suggested_prompt" text,
	"created_at" timestamp DEFAULT now()
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
	"collection" varchar,
	"created_at" timestamp DEFAULT now()
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
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "styleguide_templates" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"color_scheme" jsonb,
	"typography_setup" jsonb,
	"layout_structure" jsonb,
	"target_personality" jsonb,
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
CREATE TABLE "training_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"training_id" varchar NOT NULL,
	"status" varchar NOT NULL,
	"progress" integer DEFAULT 0,
	"base_model" varchar DEFAULT 'flux-dev',
	"parameters" jsonb,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"dataset_zip_url" text,
	"output_artifact_url" text,
	"error" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usage_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"action_type" varchar NOT NULL,
	"resource_used" varchar NOT NULL,
	"cost" numeric NOT NULL,
	"details" jsonb,
	"generated_image_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_generated_websites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"onboarding_id" integer,
	"title" varchar NOT NULL,
	"subdomain" varchar(63),
	"html_content" text NOT NULL,
	"css_content" text NOT NULL,
	"js_content" text DEFAULT '',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"is_published" boolean DEFAULT false,
	"status" varchar DEFAULT 'draft',
	"template_used" varchar,
	"customizations" jsonb DEFAULT '{}'::jsonb,
	"analytics" jsonb DEFAULT '{}'::jsonb,
	"seo_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"published_at" timestamp,
	CONSTRAINT "user_generated_websites_subdomain_unique" UNIQUE("subdomain")
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
	CONSTRAINT "user_landing_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_models" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"training_id" varchar,
	"replicate_model_id" varchar,
	"replicate_version_id" varchar,
	"trained_model_path" varchar,
	"trigger_word" varchar NOT NULL,
	"training_status" varchar DEFAULT 'pending',
	"model_name" varchar,
	"is_luxury" boolean DEFAULT false,
	"finetune_id" varchar,
	"model_type" varchar DEFAULT 'flux-dev',
	"training_progress" integer DEFAULT 0,
	"estimated_completion_time" timestamp,
	"failure_reason" text,
	"started_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	CONSTRAINT "user_models_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_models_trigger_word_unique" UNIQUE("trigger_word")
);
--> statement-breakpoint
CREATE TABLE "user_personal_brand" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text,
	"transformation_story" text,
	"current_situation" text,
	"future_vision" text,
	"business_goals" text,
	"business_type" varchar,
	"style_preferences" text,
	"photo_goals" text,
	"onboarding_step" integer DEFAULT 1,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
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
CREATE TABLE "user_style_evolution" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"learning_progress" jsonb DEFAULT '{}',
	"style_evolution_path" jsonb DEFAULT '[]',
	"feedback_patterns" jsonb DEFAULT '{}',
	"contextual_preferences" jsonb DEFAULT '{}',
	"trend_adaptation" jsonb DEFAULT '{}',
	"cultural_context" jsonb DEFAULT '{}',
	"sustainability_preferences" jsonb DEFAULT '{}',
	"last_adaptation" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_style_memory" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"preferred_categories" jsonb DEFAULT '[]',
	"favorite_prompt_patterns" jsonb DEFAULT '[]',
	"color_preferences" jsonb DEFAULT '[]',
	"setting_preferences" jsonb DEFAULT '[]',
	"styling_keywords" jsonb DEFAULT '[]',
	"total_interactions" integer DEFAULT 0,
	"total_favorites" integer DEFAULT 0,
	"average_session_length" integer DEFAULT 0,
	"most_active_hours" jsonb DEFAULT '[]',
	"high_performing_prompts" jsonb DEFAULT '[]',
	"rejected_prompts" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_styleguides" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "user_styleguides_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" varchar NOT NULL,
	"template_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"subtitle" varchar,
	"personal_mission" text,
	"brand_voice" text,
	"target_audience" text,
	"visual_style" text,
	"color_palette" jsonb,
	"typography" jsonb,
	"image_selections" jsonb,
	"brand_personality" jsonb,
	"business_applications" jsonb,
	"customizations" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"plan" varchar NOT NULL,
	"monthly_generations_allowed" integer NOT NULL,
	"monthly_generations_used" integer DEFAULT 0,
	"total_cost_incurred" numeric DEFAULT '0.0000',
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"is_limit_reached" boolean DEFAULT false,
	"last_generation_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_website_onboarding" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"personal_brand_name" varchar,
	"story" text,
	"business_type" varchar,
	"color_preferences" jsonb DEFAULT '{}'::jsonb,
	"target_audience" text,
	"brand_keywords" jsonb DEFAULT '[]'::jsonb,
	"goals" text,
	"current_step" varchar DEFAULT 'story',
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"stack_auth_id" varchar,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"display_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_login_at" timestamp,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"plan" varchar DEFAULT 'sselfie-studio',
	"role" varchar DEFAULT 'user',
	"monthly_generation_limit" integer DEFAULT 100,
	"generations_used_this_month" integer DEFAULT 0,
	"maya_ai_access" boolean DEFAULT true,
	"victoria_ai_access" boolean DEFAULT false,
	"has_retraining_access" boolean DEFAULT false,
	"retraining_session_id" varchar,
	"retraining_paid_at" timestamp,
	"onboarding_progress" jsonb DEFAULT '{}',
	"preferred_onboarding_mode" varchar DEFAULT 'conversational',
	"gender" varchar,
	"profession" varchar,
	"brand_style" varchar,
	"photo_goals" text,
	"training_coaching_started" boolean DEFAULT false,
	"training_coaching_completed" boolean DEFAULT false,
	"training_coaching_phase" varchar,
	"training_coaching_step" integer DEFAULT 0,
	"brand_strategy_context" jsonb,
	CONSTRAINT "users_stack_auth_id_unique" UNIQUE("stack_auth_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
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
CREATE TABLE "video_storyboards" (
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
--> statement-breakpoint
CREATE TABLE "website_builder_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"website_id" integer,
	"onboarding_id" integer,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"context" jsonb DEFAULT '{}'::jsonb,
	"last_activity" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"conversation_type" varchar DEFAULT 'onboarding',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
	CONSTRAINT "websites_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "agent_budgets" ADD CONSTRAINT "agent_budgets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_conversations" ADD CONSTRAINT "agent_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_cost_tracking" ADD CONSTRAINT "agent_cost_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_learning" ADD CONSTRAINT "agent_learning_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_session_contexts" ADD CONSTRAINT "agent_session_contexts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_sessions" ADD CONSTRAINT "agent_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_images" ADD CONSTRAINT "ai_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_queue" ADD CONSTRAINT "approval_queue_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_assets" ADD CONSTRAINT "brand_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_onboarding" ADD CONSTRAINT "brand_onboarding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brandbooks" ADD CONSTRAINT "brandbooks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claude_conversations" ADD CONSTRAINT "claude_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claude_messages" ADD CONSTRAINT "claude_messages_conversation_id_claude_conversations_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."claude_conversations"("conversation_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_cards" ADD CONSTRAINT "concept_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "concept_cards" ADD CONSTRAINT "concept_cards_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_summaries" ADD CONSTRAINT "conversation_summaries_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_summaries" ADD CONSTRAINT "conversation_summaries_last_message_id_messages_id_fk" FOREIGN KEY ("last_message_id") REFERENCES "public"."messages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dashboards" ADD CONSTRAINT "dashboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "domains" ADD CONSTRAINT "domains_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_accounts" ADD CONSTRAINT "email_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_captures" ADD CONSTRAINT "email_captures_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_images" ADD CONSTRAINT "generated_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_images" ADD CONSTRAINT "generated_images_model_id_user_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."user_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_videos" ADD CONSTRAINT "generated_videos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_trackers" ADD CONSTRAINT "generation_trackers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_variants" ADD CONSTRAINT "image_variants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_variants" ADD CONSTRAINT "image_variants_original_image_id_ai_images_id_fk" FOREIGN KEY ("original_image_id") REFERENCES "public"."ai_images"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image_variants" ADD CONSTRAINT "image_variants_brand_asset_id_brand_assets_id_fk" FOREIGN KEY ("brand_asset_id") REFERENCES "public"."brand_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inspiration_photos" ADD CONSTRAINT "inspiration_photos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "instagram_messages" ADD CONSTRAINT "instagram_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_events" ADD CONSTRAINT "live_events_session_id_live_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."live_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lora_weights" ADD CONSTRAINT "lora_weights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lora_weights" ADD CONSTRAINT "lora_weights_training_run_id_training_runs_id_fk" FOREIGN KEY ("training_run_id") REFERENCES "public"."training_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maya_chat_messages" ADD CONSTRAINT "maya_chat_messages_chat_id_maya_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."maya_chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maya_context_sessions" ADD CONSTRAINT "maya_context_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maya_personal_memory" ADD CONSTRAINT "maya_personal_memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model_recovery_log" ADD CONSTRAINT "model_recovery_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "onboarding_data" ADD CONSTRAINT "onboarding_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photo_selections" ADD CONSTRAINT "photo_selections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processed_emails" ADD CONSTRAINT "processed_emails_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processed_emails" ADD CONSTRAINT "processed_emails_account_id_email_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."email_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_analysis" ADD CONSTRAINT "prompt_analysis_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandra_conversations" ADD CONSTRAINT "sandra_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_prompts" ADD CONSTRAINT "saved_prompts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "selfie_uploads" ADD CONSTRAINT "selfie_uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_runs" ADD CONSTRAINT "training_runs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_history" ADD CONSTRAINT "usage_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_history" ADD CONSTRAINT "usage_history_generated_image_id_generated_images_id_fk" FOREIGN KEY ("generated_image_id") REFERENCES "public"."generated_images"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_generated_websites" ADD CONSTRAINT "user_generated_websites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_generated_websites" ADD CONSTRAINT "user_generated_websites_onboarding_id_user_website_onboarding_id_fk" FOREIGN KEY ("onboarding_id") REFERENCES "public"."user_website_onboarding"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_landing_pages" ADD CONSTRAINT "user_landing_pages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_models" ADD CONSTRAINT "user_models_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_personal_brand" ADD CONSTRAINT "user_personal_brand_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_style_evolution" ADD CONSTRAINT "user_style_evolution_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_style_memory" ADD CONSTRAINT "user_style_memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_usage" ADD CONSTRAINT "user_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_website_onboarding" ADD CONSTRAINT "user_website_onboarding_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "victoria_chats" ADD CONSTRAINT "victoria_chats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_storyboards" ADD CONSTRAINT "video_storyboards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_builder_conversations" ADD CONSTRAINT "website_builder_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_builder_conversations" ADD CONSTRAINT "website_builder_conversations_website_id_user_generated_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."user_generated_websites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_builder_conversations" ADD CONSTRAINT "website_builder_conversations_onboarding_id_user_website_onboarding_id_fk" FOREIGN KEY ("onboarding_id") REFERENCES "public"."user_website_onboarding"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
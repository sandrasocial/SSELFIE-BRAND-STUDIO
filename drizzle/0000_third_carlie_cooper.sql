CREATE TABLE "maya_concepts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"prompt" text,
	"type" varchar,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"usage_count" integer DEFAULT 0,
	"success_rate" integer,
	"avg_rating" numeric,
	"status" varchar DEFAULT 'active',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_template" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maya_images" (
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
--> statement-breakpoint
CREATE TABLE "maya_models" (
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
--> statement-breakpoint
CREATE TABLE "maya_payments" (
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
--> statement-breakpoint
CREATE TABLE "maya_profile" (
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
--> statement-breakpoint
ALTER TABLE "maya_concepts" ADD CONSTRAINT "maya_concepts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maya_images" ADD CONSTRAINT "maya_images_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maya_models" ADD CONSTRAINT "maya_models_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maya_payments" ADD CONSTRAINT "maya_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maya_profile" ADD CONSTRAINT "maya_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
DROP TABLE "maya_context_sessions" CASCADE;--> statement-breakpoint
DROP TABLE "maya_personal_memory" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "auth_provider" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stack_auth_user_id" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "legacy_user_id" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_completed" boolean;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_step" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "visual_template" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "brand_colors" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "typography_preferences" jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "feed_aesthetic" varchar;--> statement-breakpoint
ALTER TABLE "maya_models" ADD COLUMN "replicate_model_id" varchar;--> statement-breakpoint
ALTER TABLE "maya_models" ADD COLUMN "replicate_version_id" varchar;
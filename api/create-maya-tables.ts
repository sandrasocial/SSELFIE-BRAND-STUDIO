import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Manual Maya Table Creation Endpoint
 * Creates Maya tables that are missing from migrations
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { DatabaseStorage } = await import('../server/storage.js');
    const storage = new DatabaseStorage();
    
    // Get the database connection
    const db = (storage as any).db;
    
    // Create Maya profile table manually
    const createMayaProfileTable = `
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
        "feature_access" jsonb DEFAULT '{"basicGeneration": true}'::jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;
    
    const addForeignKey = `
      DO $$ BEGIN
        ALTER TABLE "maya_profile" ADD CONSTRAINT "maya_profile_user_id_users_id_fk" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    const addIndexes = `
      CREATE INDEX IF NOT EXISTS "idx_maya_profile_user_id" ON "maya_profile" ("user_id");
      CREATE INDEX IF NOT EXISTS "idx_maya_profile_onboarding" ON "maya_profile" ("user_id", "onboarding_status");
      CREATE INDEX IF NOT EXISTS "idx_maya_profile_generations" ON "maya_profile" ("user_id", "monthly_generations");
    `;
    
    // Execute the SQL
    const { sql } = await import('drizzle-orm');
    await db.execute(sql.raw(createMayaProfileTable));
    await db.execute(sql.raw(addForeignKey));
    await db.execute(sql.raw(addIndexes));
    
    // Also create other Maya tables if needed
    const createOtherMayaTables = `
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

      CREATE TABLE IF NOT EXISTS "conversations" (
        "id" varchar PRIMARY KEY NOT NULL,
        "user_id" varchar NOT NULL,
        "agent_name" varchar NOT NULL DEFAULT 'maya',
        "title" varchar,
        "status" varchar DEFAULT 'active',
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "messages" (
        "id" varchar PRIMARY KEY NOT NULL,
        "conversation_id" varchar NOT NULL,
        "role" varchar NOT NULL,
        "content" text NOT NULL,
        "meta" jsonb,
        "token_count" integer DEFAULT 0,
        "created_at" timestamp DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "concept_cards" (
        "id" varchar PRIMARY KEY NOT NULL,
        "user_id" varchar NOT NULL,
        "conversation_id" varchar,
        "title" varchar NOT NULL,
        "description" text,
        "tags" jsonb DEFAULT '[]'::jsonb,
        "status" varchar DEFAULT 'draft',
        "sort_order" integer DEFAULT 0,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `;
    
    await db.execute(sql.raw(createOtherMayaTables));

    return res.status(200).json({
      success: true,
      message: 'Maya tables created successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Maya table creation failed:', error);
    return res.status(500).json({
      error: 'Maya table creation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
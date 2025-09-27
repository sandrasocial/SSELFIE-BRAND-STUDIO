import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from './env.js';

async function setupDatabase() {
  const sql = neon(DATABASE_URL!);

  // Maya Onboarding Steps
  await sql`
    CREATE TABLE IF NOT EXISTS maya_onboarding_steps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      step_number INTEGER NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      is_required BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(step_number)
    );

    -- Insert default onboarding steps
    INSERT INTO maya_onboarding_steps (step_number, title, description)
    VALUES 
      (1, 'Welcome & Setup', 'Initial welcome and account setup'),
      (2, 'Brand Profile', 'Create your brand profile'),
      (3, 'Style Preferences', 'Define your visual style preferences'),
      (4, 'Content Goals', 'Set your content creation goals'),
      (5, 'AI Training', 'Train Maya with your preferences'),
      (6, 'Final Setup', 'Complete setup and review preferences')
    ON CONFLICT (step_number) DO NOTHING;
  `;

  // Add plan_type to maya_subscriptions if not exists
  await sql`
    DO $$ 
    BEGIN 
      IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'maya_subscriptions' AND column_name = 'plan_type'
      ) THEN
        ALTER TABLE maya_subscriptions ADD COLUMN plan_type VARCHAR(50);
      END IF;
    END $$;
  `;

  // Create indexes
  await sql`
    CREATE INDEX IF NOT EXISTS maya_subscriptions_plan_type_idx ON maya_subscriptions(plan_type);
  `;

  // Insert default subscription plans
  await sql`
    INSERT INTO maya_subscriptions (plan_type, active)
    VALUES 
      ('sselfie-studio', true),
      ('sselfie-pro', true)
    ON CONFLICT DO NOTHING;
  `;

  // Create missing tables
  await sql`
    CREATE TABLE IF NOT EXISTS video_storyboards (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      video_id UUID NOT NULL REFERENCES generated_videos(id),
      frames JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS hair_trends (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image_url VARCHAR(2048),
      likes_count INTEGER DEFAULT 0,
      views_count INTEGER DEFAULT 0,
      tags VARCHAR(255)[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Create required indexes
  await sql`
    CREATE INDEX IF NOT EXISTS video_storyboards_user_id_idx ON video_storyboards(user_id);
    CREATE INDEX IF NOT EXISTS video_storyboards_video_id_idx ON video_storyboards(video_id);
    CREATE INDEX IF NOT EXISTS hair_trends_title_idx ON hair_trends(title);
    CREATE INDEX IF NOT EXISTS hair_trends_tags_idx ON hair_trends USING GIN(tags);
  `;

  console.log('✅ Database setup completed successfully');
}

setupDatabase().catch(error => {
  console.error('❌ Database setup failed:', error);
  process.exit(1);
});
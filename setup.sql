-- Add missing tables and columns for launch validation

-- maya_onboarding_steps
CREATE TABLE IF NOT EXISTS maya_onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

-- Add plan_type column to maya_subscriptions if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'maya_subscriptions' AND column_name = 'plan_type'
  ) THEN
    ALTER TABLE maya_subscriptions ADD COLUMN plan_type VARCHAR(50);
    CREATE INDEX IF NOT EXISTS maya_subscriptions_plan_type_idx ON maya_subscriptions(plan_type);
  END IF;
END $$;

-- Insert default subscription plans
INSERT INTO maya_subscriptions (id, plan_type, active) 
VALUES 
  (gen_random_uuid(), 'sselfie-studio', true),
  (gen_random_uuid(), 'sselfie-pro', true)
ON CONFLICT DO NOTHING;

-- Create missing required tables
CREATE TABLE IF NOT EXISTS video_storyboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  video_id UUID NOT NULL REFERENCES generated_videos(id),
  frames JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

-- Create required indexes
CREATE INDEX IF NOT EXISTS video_storyboards_user_id_idx ON video_storyboards(user_id);
CREATE INDEX IF NOT EXISTS video_storyboards_video_id_idx ON video_storyboards(video_id);
CREATE INDEX IF NOT EXISTS hair_trends_title_idx ON hair_trends(title);
CREATE INDEX IF NOT EXISTS hair_trends_tags_idx ON hair_trends USING GIN(tags);
CREATE INDEX IF NOT EXISTS maya_onboarding_steps_step_number_idx ON maya_onboarding_steps(step_number);

-- Other required tables from the validator
CREATE TABLE IF NOT EXISTS user_personal_brand (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  brand_name VARCHAR(255) NOT NULL,
  brand_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_style_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  style_preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maya_personal_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  memory_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maya_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action_type VARCHAR(100) NOT NULL,
  action_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
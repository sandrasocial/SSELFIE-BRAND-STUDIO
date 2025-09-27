-- Create maya_onboarding_steps table
CREATE TABLE IF NOT EXISTS maya_onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on step_number
CREATE UNIQUE INDEX IF NOT EXISTS maya_onboarding_steps_step_number_idx ON maya_onboarding_steps(step_number);

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
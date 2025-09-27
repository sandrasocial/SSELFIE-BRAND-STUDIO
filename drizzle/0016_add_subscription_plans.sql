-- Add plan_type column to maya_subscriptions table
ALTER TABLE maya_subscriptions ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50);
CREATE INDEX IF NOT EXISTS maya_subscriptions_plan_type_idx ON maya_subscriptions(plan_type);

-- Insert default subscription plans
INSERT INTO maya_subscriptions (id, plan_type, active) 
VALUES 
  (gen_random_uuid(), 'sselfie-studio', true),
  (gen_random_uuid(), 'sselfie-pro', true)
ON CONFLICT (id) DO NOTHING;
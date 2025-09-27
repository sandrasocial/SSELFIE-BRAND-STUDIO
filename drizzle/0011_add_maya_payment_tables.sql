CREATE TABLE IF NOT EXISTS maya_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR,
  plan VARCHAR NOT NULL,
  status VARCHAR NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  generations_per_month INTEGER DEFAULT 100,
  generations_used INTEGER DEFAULT 0,
  generations_remaining INTEGER,
  story_studio_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_maya_subscriptions_user ON maya_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_maya_subscriptions_status ON maya_subscriptions(status);

CREATE TABLE IF NOT EXISTS maya_payments (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_session_id VARCHAR UNIQUE,
  stripe_payment_intent_id VARCHAR,
  amount INTEGER NOT NULL,
  currency VARCHAR DEFAULT 'eur',
  status VARCHAR DEFAULT 'pending',
  payment_method VARCHAR,
  error_message TEXT,
  customer_email VARCHAR,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  succeeded_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_maya_payments_user ON maya_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_maya_payments_status ON maya_payments(status);
CREATE INDEX IF NOT EXISTS idx_maya_payments_session ON maya_payments(stripe_session_id);

CREATE TABLE IF NOT EXISTS maya_usage_tracking (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR NOT NULL,
  resource_type VARCHAR NOT NULL,
  cost DECIMAL(10,4),
  quota_used INTEGER DEFAULT 1,
  model_id VARCHAR,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  request_id VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maya_usage_user ON maya_usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_maya_usage_action ON maya_usage_tracking(action_type);
CREATE INDEX IF NOT EXISTS idx_maya_usage_date ON maya_usage_tracking(created_at);

CREATE TABLE IF NOT EXISTS maya_usage_budgets (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  budget_type VARCHAR NOT NULL,
  generation_limit INTEGER NOT NULL,
  reset_date TIMESTAMP,
  current_usage INTEGER DEFAULT 0,
  is_limit_reached BOOLEAN DEFAULT false,
  alert_threshold INTEGER DEFAULT 80,
  is_active BOOLEAN DEFAULT true,
  is_overridden BOOLEAN DEFAULT false,
  override_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maya_budgets_user ON maya_usage_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_maya_budgets_active ON maya_usage_budgets(is_active);
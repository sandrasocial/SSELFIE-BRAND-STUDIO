-- Add index to created_at column
CREATE INDEX IF NOT EXISTS idx_hair_trends_created_at ON hair_trends(created_at);

-- Add index to week_range column
CREATE INDEX IF NOT EXISTS idx_hair_trends_week_range ON hair_trends(week_range);
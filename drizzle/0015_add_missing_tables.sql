-- Add video_storyboards table
CREATE TABLE IF NOT EXISTS video_storyboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  video_id UUID NOT NULL REFERENCES generated_videos(id),
  frames JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS video_storyboards_user_id_idx ON video_storyboards(user_id);
CREATE INDEX IF NOT EXISTS video_storyboards_video_id_idx ON video_storyboards(video_id);

-- Add hair_trends table
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

CREATE INDEX IF NOT EXISTS hair_trends_title_idx ON hair_trends(title);
CREATE INDEX IF NOT EXISTS hair_trends_tags_idx ON hair_trends USING GIN(tags);
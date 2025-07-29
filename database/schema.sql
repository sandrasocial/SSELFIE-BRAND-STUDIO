-- SSELFIE Studio Database Schema
-- Complete user journey database architecture

-- Users table with AI model preferences
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    
    -- AI Model Preferences
    preferred_ai_model VARCHAR(50) DEFAULT 'flux-schnell',
    model_settings JSONB DEFAULT '{}',
    
    -- Account status
    is_active BOOLEAN DEFAULT true,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Image generation tracking (100/month limit)
CREATE TABLE image_generations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Generation details
    prompt TEXT NOT NULL,
    ai_model VARCHAR(50) NOT NULL,
    image_url TEXT,
    thumbnail_url TEXT,
    
    -- Usage tracking
    generation_month DATE NOT NULL, -- YYYY-MM-01 format for monthly limits
    status VARCHAR(20) DEFAULT 'generating', -- generating, completed, failed
    
    -- Metadata
    model_settings JSONB,
    generation_time_ms INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monthly usage summary for quick limit checks
CREATE TABLE monthly_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    month_year DATE NOT NULL, -- YYYY-MM-01 format
    generations_count INTEGER DEFAULT 0,
    last_generation_at TIMESTAMP,
    
    UNIQUE(user_id, month_year)
);

-- Workspaces for project organization
CREATE TABLE workspaces (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366f1', -- hex color
    
    -- Settings
    is_default BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects within workspaces
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Project data
    project_data JSONB DEFAULT '{}',
    thumbnail_url TEXT,
    
    -- Status
    is_archived BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Image collections within projects
CREATE TABLE image_collections (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link images to collections
CREATE TABLE collection_images (
    id SERIAL PRIMARY KEY,
    collection_id INTEGER REFERENCES image_collections(id) ON DELETE CASCADE,
    image_generation_id INTEGER REFERENCES image_generations(id) ON DELETE CASCADE,
    
    -- Organization
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(collection_id, image_generation_id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_image_generations_user_month ON image_generations(user_id, generation_month);
CREATE INDEX idx_monthly_usage_user_month ON monthly_usage(user_id, month_year);
CREATE INDEX idx_workspaces_user ON workspaces(user_id);
CREATE INDEX idx_projects_workspace ON projects(workspace_id);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_collections_project ON image_collections(project_id);

-- Trigger to update monthly usage
CREATE OR REPLACE FUNCTION update_monthly_usage()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO monthly_usage (user_id, month_year, generations_count, last_generation_at)
    VALUES (NEW.user_id, DATE_TRUNC('month', NEW.created_at), 1, NEW.created_at)
    ON CONFLICT (user_id, month_year)
    DO UPDATE SET 
        generations_count = monthly_usage.generations_count + 1,
        last_generation_at = NEW.created_at;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_monthly_usage
    AFTER INSERT ON image_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_monthly_usage();
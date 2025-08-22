-- Add enum type for task states
CREATE TYPE task_state AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'failed',
    'abandoned',
    'blocked',
    'validation_required'
);

-- Add state transition validation function
CREATE OR REPLACE FUNCTION validate_task_state_transition()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent invalid state transitions
    IF OLD.status::task_state = 'completed' AND NEW.status::task_state NOT IN ('validation_required', 'failed') THEN
        RAISE EXCEPTION 'Cannot transition from completed state unless to validation_required or failed';
    END IF;

    -- Ensure atomic updates with proper locking
    IF TG_OP = 'UPDATE' THEN
        -- Lock the row for update to prevent race conditions
        PERFORM 1 FROM agent_tasks 
        WHERE task_id = NEW.task_id 
        FOR UPDATE;
        
        -- Validate state transition logic
        CASE OLD.status::task_state
            WHEN 'pending' THEN
                IF NEW.status::task_state NOT IN ('in_progress', 'abandoned') THEN
                    RAISE EXCEPTION 'Invalid transition from pending state';
                END IF;
            WHEN 'in_progress' THEN
                IF NEW.status::task_state NOT IN ('completed', 'failed', 'blocked', 'abandoned') THEN
                    RAISE EXCEPTION 'Invalid transition from in_progress state';
                END IF;
            WHEN 'blocked' THEN
                IF NEW.status::task_state NOT IN ('in_progress', 'abandoned') THEN
                    RAISE EXCEPTION 'Invalid transition from blocked state';
                END IF;
            WHEN 'failed' THEN
                IF NEW.status::task_state NOT IN ('in_progress', 'abandoned') THEN
                    RAISE EXCEPTION 'Invalid transition from failed state';
                END IF;
        END CASE;
    END IF;

    -- Add transition timestamp
    NEW.updated_at = CURRENT_TIMESTAMP;
    
    -- Log state transition
    INSERT INTO task_state_history (
        task_id,
        previous_state,
        new_state,
        transition_timestamp,
        transition_reason
    ) VALUES (
        NEW.task_id,
        OLD.status,
        NEW.status,
        CURRENT_TIMESTAMP,
        NEW.execution_data->>'state_transition_reason'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create task state history table
CREATE TABLE task_state_history (
    history_id SERIAL PRIMARY KEY,
    task_id UUID REFERENCES agent_tasks(task_id),
    previous_state TEXT,
    new_state TEXT,
    transition_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transition_reason TEXT
);

-- Add trigger for state transitions
CREATE TRIGGER task_state_transition_validation
    BEFORE UPDATE OF status ON agent_tasks
    FOR EACH ROW
    EXECUTE FUNCTION validate_task_state_transition();

-- Add indexes for performance
CREATE INDEX idx_task_state_history_task_id ON task_state_history(task_id);
CREATE INDEX idx_agent_tasks_status ON agent_tasks(status);

-- Update existing status column to use enum
ALTER TABLE agent_tasks ALTER COLUMN status TYPE task_state USING status::task_state;

-- Add constraints
ALTER TABLE agent_tasks ADD CONSTRAINT valid_status CHECK (
    status IN ('pending', 'in_progress', 'completed', 'failed', 'abandoned', 'blocked', 'validation_required')
);

-- Add column for transition locking
ALTER TABLE agent_tasks ADD COLUMN state_transition_lock_version INTEGER DEFAULT 0;
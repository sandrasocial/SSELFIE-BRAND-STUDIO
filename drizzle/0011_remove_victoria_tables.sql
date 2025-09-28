-- Verify data migration was successful
DO $$
DECLARE
    legacy_count INTEGER;
    original_count INTEGER;
BEGIN
    -- Get counts
    SELECT COUNT(*) INTO legacy_count FROM legacy_victoria_chats;
    SELECT COUNT(*) INTO original_count FROM victoria_chats;
    
    -- Verify counts match
    IF legacy_count = original_count THEN
        -- Safe to drop original tables
        DROP TABLE IF EXISTS victoria_chats;
        
        -- Update migration record
        UPDATE legacy_migrations 
        SET migrated_at = CURRENT_TIMESTAMP 
        WHERE table_name = 'victoria_chats';
    ELSE
        RAISE EXCEPTION 'Data verification failed. Legacy count (%) does not match original count (%)', 
            legacy_count, original_count;
    END IF;
END $$;
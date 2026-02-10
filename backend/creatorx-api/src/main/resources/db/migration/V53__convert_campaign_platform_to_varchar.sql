-- Migration V53: Convert campaign_platform enum to VARCHAR

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'campaigns'
          AND column_name = 'platform'
          AND data_type = 'USER-DEFINED'
          AND udt_name = 'campaign_platform'
    ) THEN
        ALTER TABLE campaigns
            ALTER COLUMN platform TYPE VARCHAR(50) USING platform::TEXT;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public'
          AND t.typtype = 'e'
          AND t.typname = 'campaign_platform'
    ) THEN
        DROP TYPE IF EXISTS campaign_platform CASCADE;
    END IF;
END $$;

-- Migration V51: Restore campaign deliverable types support
-- Fixes missing campaign_deliverable_types table and deliverable type column after enum cleanup

-- 1) Ensure campaign_deliverable_types join table exists (matches JPA mapping)
CREATE TABLE IF NOT EXISTS campaign_deliverable_types (
    campaign_id VARCHAR(36) NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    deliverable_type VARCHAR(50) NOT NULL,
    PRIMARY KEY (campaign_id, deliverable_type)
);

-- 2) Backfill join table from legacy array column if present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'campaigns'
          AND column_name = 'deliverable_types'
    ) THEN
        INSERT INTO campaign_deliverable_types (campaign_id, deliverable_type)
        SELECT c.id, unnest(c.deliverable_types)
        FROM campaigns c
        WHERE c.deliverable_types IS NOT NULL
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 3) Ensure campaign_deliverables.type exists and is VARCHAR
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campaign_deliverables') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'campaign_deliverables'
              AND column_name = 'type'
        ) THEN
            ALTER TABLE campaign_deliverables
                ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'IMAGE';
        END IF;

        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'campaign_deliverables'
              AND column_name = 'type'
              AND data_type = 'USER-DEFINED'
        ) THEN
            ALTER TABLE campaign_deliverables
                ALTER COLUMN type TYPE VARCHAR(50) USING type::TEXT;
        END IF;
    END IF;
END $$;

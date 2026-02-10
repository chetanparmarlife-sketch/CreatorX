-- Migration V52: Ensure campaign and platform settings schema is present
-- Safeguards against missing tables/columns after enum/uuid conversions.

-- 1) Ensure platform_settings table exists (needed by PlatformSettingsResolver)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'platform_settings'
    ) THEN
        CREATE TABLE platform_settings (
            id VARCHAR(36) PRIMARY KEY,
            setting_key VARCHAR(120) NOT NULL UNIQUE,
            setting_value TEXT NOT NULL,
            data_type VARCHAR(50) NOT NULL DEFAULT 'STRING',
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            version BIGINT NOT NULL DEFAULT 0
        );
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'platform_settings'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(setting_key);
    END IF;
END $$;

-- 2) Ensure campaign_deliverable_types join table exists (JPA @ElementCollection)
CREATE TABLE IF NOT EXISTS campaign_deliverable_types (
    campaign_id VARCHAR(36) NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    deliverable_type VARCHAR(50) NOT NULL,
    PRIMARY KEY (campaign_id, deliverable_type)
);

-- 3) Backfill join table from legacy campaigns.deliverable_types if present
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

-- 4) Ensure campaign_deliverables.type exists and is VARCHAR
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'campaign_deliverables'
    ) THEN
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

-- 5) Ensure campaign FK columns are VARCHAR(36) if still UUID
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'campaigns'
          AND column_name = 'brand_id'
          AND udt_name = 'uuid'
    ) THEN
        ALTER TABLE campaigns ALTER COLUMN brand_id TYPE VARCHAR(36) USING brand_id::VARCHAR;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'campaign_deliverables'
          AND column_name = 'campaign_id'
          AND udt_name = 'uuid'
    ) THEN
        ALTER TABLE campaign_deliverables ALTER COLUMN campaign_id TYPE VARCHAR(36) USING campaign_id::VARCHAR;
    END IF;
END $$;

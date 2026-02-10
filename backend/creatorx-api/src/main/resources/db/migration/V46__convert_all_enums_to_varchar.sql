-- Migration V46: Convert all ENUM columns to VARCHAR
-- This fixes "operator does not exist: enum_type = character varying" errors
-- Similar to V44 which fixed UUID issues

-- Step 1: Find all columns using custom enum types and convert them to VARCHAR
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Loop through all columns that use custom enum types
    FOR r IN (
        SELECT
            c.table_name,
            c.column_name,
            c.udt_name,
            c.character_maximum_length
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
        AND c.data_type = 'USER-DEFINED'
        AND c.udt_name IN (
            'user_role', 'user_status', 'social_platform', 'campaign_status',
            'application_status', 'deliverable_status', 'payment_status',
            'transaction_type', 'wallet_transaction_type', 'withdrawal_status',
            'dispute_status', 'refund_status', 'kyc_status', 'notification_type',
            'appeal_status', 'flag_status', 'gdpr_request_type', 'gdpr_status',
            'invoice_status', 'compliance_status', 'setting_type', 'action_type',
            'device_platform', 'deliverable_type', 'review_status'
        )
    ) LOOP
        BEGIN
            -- Convert enum column to VARCHAR(50)
            EXECUTE format(
                'ALTER TABLE %I ALTER COLUMN %I TYPE VARCHAR(50) USING %I::TEXT',
                r.table_name,
                r.column_name,
                r.column_name
            );
            RAISE NOTICE 'Converted %.% from % to VARCHAR(50)',
                r.table_name, r.column_name, r.udt_name;
        EXCEPTION
            WHEN others THEN
                RAISE WARNING 'Failed to convert %.%: %',
                    r.table_name, r.column_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 2: Drop the enum types (they're no longer needed)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT t.typname
        FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public'
        AND t.typtype = 'e'
        AND t.typname IN (
            'user_role', 'user_status', 'social_platform', 'campaign_status',
            'application_status', 'deliverable_status', 'payment_status',
            'transaction_type', 'wallet_transaction_type', 'withdrawal_status',
            'dispute_status', 'refund_status', 'kyc_status', 'notification_type',
            'appeal_status', 'flag_status', 'gdpr_request_type', 'gdpr_status',
            'invoice_status', 'compliance_status', 'setting_type', 'action_type',
            'device_platform', 'deliverable_type', 'review_status'
        )
    ) LOOP
        BEGIN
            EXECUTE format('DROP TYPE IF EXISTS %I CASCADE', r.typname);
            RAISE NOTICE 'Dropped enum type: %', r.typname;
        EXCEPTION
            WHEN others THEN
                RAISE WARNING 'Failed to drop type %: %', r.typname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Verify conversions
DO $$
DECLARE
    enum_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO enum_count
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND data_type = 'USER-DEFINED'
    AND udt_name LIKE '%status'
       OR udt_name LIKE '%type'
       OR udt_name LIKE '%role'
       OR udt_name LIKE '%platform';

    IF enum_count > 0 THEN
        RAISE WARNING 'Still have % enum columns remaining', enum_count;
    ELSE
        RAISE NOTICE 'Successfully converted all enum columns to VARCHAR';
    END IF;
END $$;

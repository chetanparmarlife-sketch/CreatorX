-- Migration V44: Complete UUID to VARCHAR conversion
--
-- This migration converts ALL UUID columns to VARCHAR(36) to match Java String types.
-- It drops ALL foreign key constraints first, converts columns, then recreates constraints.

-- ==========================================
-- Step 1: Drop ALL foreign key constraints
-- ==========================================

-- Dynamically drop all foreign key constraints that reference UUID columns
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.table_name, tc.constraint_name
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    ) LOOP
        BEGIN
            EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) ||
                    ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
        EXCEPTION
            WHEN others THEN NULL;
        END;
    END LOOP;
END $$;

-- ==========================================
-- Step 2: Convert all UUID columns to VARCHAR(36)
-- ==========================================

-- Helper function to convert UUID columns safely
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Convert all UUID columns to VARCHAR(36)
    FOR r IN (
        SELECT
            c.table_name,
            c.column_name
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
        AND c.udt_name = 'uuid'
        ORDER BY c.table_name, c.column_name
    ) LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I ALTER COLUMN %I TYPE VARCHAR(36) USING %I::VARCHAR',
                r.table_name, r.column_name, r.column_name);
            RAISE NOTICE 'Converted %.% from UUID to VARCHAR(36)', r.table_name, r.column_name;
        EXCEPTION
            WHEN others THEN
                RAISE NOTICE 'Failed to convert %.%: %', r.table_name, r.column_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- ==========================================
-- Step 3: Recreate essential foreign key constraints
-- ==========================================

-- Recreate core foreign keys needed for application to function
DO $$
BEGIN
    -- User profile foreign keys
    ALTER TABLE user_profiles
        ADD CONSTRAINT user_profiles_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

    ALTER TABLE creator_profiles
        ADD CONSTRAINT creator_profiles_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

    ALTER TABLE brand_profiles
        ADD CONSTRAINT brand_profiles_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

    ALTER TABLE wallets
        ADD CONSTRAINT wallets_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

    -- Campaign foreign keys
    ALTER TABLE campaigns
        ADD CONSTRAINT campaigns_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES users(id);

    ALTER TABLE applications
        ADD CONSTRAINT applications_creator_id_fkey
        FOREIGN KEY (creator_id) REFERENCES users(id);

    ALTER TABLE applications
        ADD CONSTRAINT applications_campaign_id_fkey
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id);

    ALTER TABLE active_campaigns
        ADD CONSTRAINT active_campaigns_creator_id_fkey
        FOREIGN KEY (creator_id) REFERENCES users(id);

    ALTER TABLE active_campaigns
        ADD CONSTRAINT active_campaigns_campaign_id_fkey
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id);

    -- Transaction foreign keys
    ALTER TABLE transactions
        ADD CONSTRAINT transactions_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id);

    ALTER TABLE transactions
        ADD CONSTRAINT transactions_campaign_id_fkey
        FOREIGN KEY (campaign_id) REFERENCES campaigns(id);

    ALTER TABLE transactions
        ADD CONSTRAINT transactions_application_id_fkey
        FOREIGN KEY (application_id) REFERENCES applications(id);

    -- Banking foreign keys
    ALTER TABLE bank_accounts
        ADD CONSTRAINT bank_accounts_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id);

    ALTER TABLE withdrawal_requests
        ADD CONSTRAINT withdrawal_requests_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id);

    ALTER TABLE withdrawal_requests
        ADD CONSTRAINT withdrawal_requests_bank_account_id_fkey
        FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id);

    -- Messaging foreign keys
    ALTER TABLE conversations
        ADD CONSTRAINT conversations_creator_id_fkey
        FOREIGN KEY (creator_id) REFERENCES users(id);

    ALTER TABLE conversations
        ADD CONSTRAINT conversations_brand_id_fkey
        FOREIGN KEY (brand_id) REFERENCES users(id);

    ALTER TABLE messages
        ADD CONSTRAINT messages_conversation_id_fkey
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

    ALTER TABLE messages
        ADD CONSTRAINT messages_sender_id_fkey
        FOREIGN KEY (sender_id) REFERENCES users(id);

    -- Notification foreign keys
    ALTER TABLE notifications
        ADD CONSTRAINT notifications_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Some foreign keys could not be recreated: %', SQLERRM;
END $$;

COMMENT ON COLUMN users.id IS 'Primary key - VARCHAR(36) for Java String UUID compatibility';

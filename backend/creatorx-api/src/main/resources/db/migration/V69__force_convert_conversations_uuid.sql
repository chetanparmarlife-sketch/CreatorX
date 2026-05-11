-- ============================================================
-- V69: Force-convert ALL remaining UUID columns to VARCHAR(36)
-- ============================================================
-- V44 attempted this but silently failed for some tables because
-- CHECK constraints (e.g. chk_creator_brand_different) used
-- operators that break when one operand is VARCHAR and the other
-- is still UUID mid-conversion.
--
-- Strategy:
--   1. Drop ALL foreign keys (already done by V44 but some were
--      recreated, and new tables were added since).
--   2. Drop ALL CHECK constraints that reference UUID columns.
--   3. Convert every remaining UUID column to VARCHAR(36).
--   4. Recreate the CHECK and FK constraints.
-- ============================================================

-- Step 1: Drop ALL foreign key constraints
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

-- Step 2: Drop ALL CHECK constraints (they may reference UUID
-- columns with operators like <> that break during type change)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.table_name, tc.constraint_name
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_type = 'CHECK'
        AND tc.table_schema = 'public'
        AND tc.constraint_name NOT LIKE '%_not_null'
    ) LOOP
        BEGIN
            EXECUTE 'ALTER TABLE ' || quote_ident(r.table_name) ||
                    ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
        EXCEPTION
            WHEN others THEN NULL;
        END;
    END LOOP;
END $$;

-- Step 3: Drop ALL UNIQUE constraints (they reference UUID cols)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.table_name, tc.constraint_name
        FROM information_schema.table_constraints tc
        WHERE tc.constraint_type = 'UNIQUE'
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

-- Step 4: Convert EVERY remaining UUID column to VARCHAR(36)
DO $$
DECLARE
    r RECORD;
    converted INT := 0;
BEGIN
    FOR r IN (
        SELECT c.table_name, c.column_name
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
        AND c.udt_name = 'uuid'
        ORDER BY c.table_name, c.column_name
    ) LOOP
        BEGIN
            EXECUTE format(
                'ALTER TABLE %I ALTER COLUMN %I TYPE VARCHAR(36) USING %I::VARCHAR',
                r.table_name, r.column_name, r.column_name
            );
            converted := converted + 1;
            RAISE NOTICE 'Converted %.% from UUID to VARCHAR(36)', r.table_name, r.column_name;
        EXCEPTION
            WHEN others THEN
                RAISE WARNING 'FAILED to convert %.%: %', r.table_name, r.column_name, SQLERRM;
        END;
    END LOOP;
    RAISE NOTICE 'Total columns converted: %', converted;
END $$;

-- Step 5: Recreate essential constraints
-- 5a. conversations CHECK constraint
DO $$
BEGIN
    ALTER TABLE conversations
        ADD CONSTRAINT chk_creator_brand_different
        CHECK (creator_id != brand_id);
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not add chk_creator_brand_different: %', SQLERRM;
END $$;

DO $$
BEGIN
    ALTER TABLE conversations
        ADD CONSTRAINT chk_unique_conversation
        UNIQUE (campaign_id, creator_id, brand_id);
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not add chk_unique_conversation: %', SQLERRM;
END $$;

-- 5b. Recreate core foreign keys
DO $$
BEGIN
    -- Users → profiles
    ALTER TABLE user_profiles       ADD CONSTRAINT user_profiles_user_id_fkey       FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE creator_profiles    ADD CONSTRAINT creator_profiles_user_id_fkey    FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE brand_profiles      ADD CONSTRAINT brand_profiles_user_id_fkey      FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE wallets             ADD CONSTRAINT wallets_user_id_fkey             FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE social_links        ADD CONSTRAINT social_links_user_id_fkey        FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE kyc_documents       ADD CONSTRAINT kyc_documents_user_id_fkey       FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE;

    -- Campaigns
    ALTER TABLE campaigns           ADD CONSTRAINT campaigns_created_by_fkey        FOREIGN KEY (created_by)  REFERENCES users(id);
    ALTER TABLE campaign_deliverables ADD CONSTRAINT campaign_deliverables_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;

    -- Applications
    ALTER TABLE applications        ADD CONSTRAINT applications_creator_id_fkey     FOREIGN KEY (creator_id)  REFERENCES users(id);
    ALTER TABLE applications        ADD CONSTRAINT applications_campaign_id_fkey    FOREIGN KEY (campaign_id) REFERENCES campaigns(id);
    ALTER TABLE application_feedback ADD CONSTRAINT application_feedback_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

    -- Active campaigns
    ALTER TABLE active_campaigns    ADD CONSTRAINT active_campaigns_creator_id_fkey  FOREIGN KEY (creator_id)  REFERENCES users(id);
    ALTER TABLE active_campaigns    ADD CONSTRAINT active_campaigns_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES campaigns(id);

    -- Deliverables
    ALTER TABLE deliverable_submissions ADD CONSTRAINT deliverable_submissions_application_id_fkey FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE;

    -- Transactions
    ALTER TABLE transactions        ADD CONSTRAINT transactions_user_id_fkey         FOREIGN KEY (user_id)         REFERENCES users(id);
    ALTER TABLE transactions        ADD CONSTRAINT transactions_campaign_id_fkey     FOREIGN KEY (campaign_id)     REFERENCES campaigns(id);
    ALTER TABLE transactions        ADD CONSTRAINT transactions_application_id_fkey  FOREIGN KEY (application_id)  REFERENCES applications(id);

    -- Banking
    ALTER TABLE bank_accounts       ADD CONSTRAINT bank_accounts_user_id_fkey        FOREIGN KEY (user_id)         REFERENCES users(id);
    ALTER TABLE withdrawal_requests ADD CONSTRAINT withdrawal_requests_user_id_fkey  FOREIGN KEY (user_id)         REFERENCES users(id);
    ALTER TABLE withdrawal_requests ADD CONSTRAINT withdrawal_requests_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id);

    -- Messaging
    ALTER TABLE conversations       ADD CONSTRAINT conversations_creator_id_fkey     FOREIGN KEY (creator_id)      REFERENCES users(id);
    ALTER TABLE conversations       ADD CONSTRAINT conversations_brand_id_fkey       FOREIGN KEY (brand_id)        REFERENCES users(id);
    ALTER TABLE conversations       ADD CONSTRAINT conversations_campaign_id_fkey    FOREIGN KEY (campaign_id)     REFERENCES campaigns(id);
    ALTER TABLE messages            ADD CONSTRAINT messages_conversation_id_fkey     FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
    ALTER TABLE messages            ADD CONSTRAINT messages_sender_id_fkey           FOREIGN KEY (sender_id)       REFERENCES users(id);

    -- Notifications
    ALTER TABLE notifications       ADD CONSTRAINT notifications_user_id_fkey        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE fcm_tokens          ADD CONSTRAINT fcm_tokens_user_id_fkey           FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

    -- Disputes
    ALTER TABLE disputes            ADD CONSTRAINT disputes_reporter_id_fkey         FOREIGN KEY (reporter_id) REFERENCES users(id);

    -- Referrals
    ALTER TABLE referrals           ADD CONSTRAINT referrals_referrer_id_fkey        FOREIGN KEY (referrer_id) REFERENCES users(id);
    ALTER TABLE referrals           ADD CONSTRAINT referrals_referred_id_fkey        FOREIGN KEY (referred_id) REFERENCES users(id);

    -- Payment orders
    ALTER TABLE payment_orders      ADD CONSTRAINT payment_orders_campaign_id_fkey   FOREIGN KEY (campaign_id)    REFERENCES campaigns(id);
    ALTER TABLE payment_orders      ADD CONSTRAINT payment_orders_brand_id_fkey      FOREIGN KEY (brand_id)       REFERENCES users(id);

    -- Refunds
    ALTER TABLE refunds             ADD CONSTRAINT refunds_transaction_id_fkey       FOREIGN KEY (transaction_id) REFERENCES transactions(id);

    -- Social accounts
    ALTER TABLE social_accounts     ADD CONSTRAINT social_accounts_user_id_fkey      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

    -- Saved campaigns
    ALTER TABLE saved_campaigns     ADD CONSTRAINT saved_campaigns_user_id_fkey      FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE saved_campaigns     ADD CONSTRAINT saved_campaigns_campaign_id_fkey  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;

    -- Team members
    ALTER TABLE team_members        ADD CONSTRAINT team_members_brand_id_fkey        FOREIGN KEY (brand_id) REFERENCES users(id);
    ALTER TABLE team_members        ADD CONSTRAINT team_members_user_id_fkey         FOREIGN KEY (user_id)  REFERENCES users(id);

    -- Brand lists
    ALTER TABLE brand_lists         ADD CONSTRAINT brand_lists_brand_id_fkey         FOREIGN KEY (brand_id) REFERENCES users(id) ON DELETE CASCADE;
    ALTER TABLE brand_list_creators ADD CONSTRAINT brand_list_creators_list_id_fkey  FOREIGN KEY (list_id)  REFERENCES brand_lists(id) ON DELETE CASCADE;
    ALTER TABLE brand_list_creators ADD CONSTRAINT brand_list_creators_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE;

EXCEPTION WHEN others THEN
    RAISE NOTICE 'Some foreign keys could not be recreated: %', SQLERRM;
END $$;

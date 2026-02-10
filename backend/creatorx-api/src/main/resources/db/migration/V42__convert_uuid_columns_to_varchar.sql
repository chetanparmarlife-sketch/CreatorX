-- Migration V42: Convert UUID columns to VARCHAR for String compatibility (Fixed)
--
-- The Java entities use String type for IDs, but PostgreSQL columns were UUID type.
-- This causes "operator does not exist: uuid = character varying" errors.
--
-- Solution: Convert all UUID columns to VARCHAR to match Java String type.
-- UUID values are preserved as their string representation.
--
-- Strategy:
-- 1. Drop all foreign key constraints
-- 2. Convert all UUID columns to VARCHAR(36)
-- 3. Recreate foreign key constraints

-- ==========================================
-- Step 1: Drop all foreign key constraints
-- ==========================================

-- User-related foreign keys
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
ALTER TABLE creator_profiles DROP CONSTRAINT IF EXISTS creator_profiles_user_id_fkey;
ALTER TABLE brand_profiles DROP CONSTRAINT IF EXISTS brand_profiles_user_id_fkey;
ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_user_id_fkey;
ALTER TABLE bank_accounts DROP CONSTRAINT IF EXISTS bank_accounts_user_id_fkey;
ALTER TABLE withdrawal_requests DROP CONSTRAINT IF EXISTS withdrawal_requests_user_id_fkey;
ALTER TABLE withdrawal_requests DROP CONSTRAINT IF EXISTS withdrawal_requests_processed_by_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE social_accounts DROP CONSTRAINT IF EXISTS social_accounts_user_id_fkey;
ALTER TABLE media_kits DROP CONSTRAINT IF EXISTS media_kits_user_id_fkey;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey;
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS referrals_referee_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_creator_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_brand_id_fkey;
ALTER TABLE disputes DROP CONSTRAINT IF EXISTS disputes_filed_by_fkey;

-- Campaign-related foreign keys
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_created_by_fkey;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_campaign_id_fkey;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_creator_id_fkey;
ALTER TABLE active_campaigns DROP CONSTRAINT IF EXISTS active_campaigns_campaign_id_fkey;
ALTER TABLE active_campaigns DROP CONSTRAINT IF EXISTS active_campaigns_creator_id_fkey;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_campaign_id_fkey;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_application_id_fkey;
ALTER TABLE disputes DROP CONSTRAINT IF EXISTS disputes_active_campaign_id_fkey;

-- Other foreign keys
ALTER TABLE withdrawal_requests DROP CONSTRAINT IF EXISTS withdrawal_requests_bank_account_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;

-- ==========================================
-- Step 2: Convert all UUID columns to VARCHAR(36)
-- ==========================================

-- Convert primary key columns
ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE campaigns ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE applications ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE active_campaigns ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE transactions ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE bank_accounts ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE withdrawal_requests ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE messages ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE conversations ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE notifications ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE social_accounts ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE media_kits ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE kyc_documents ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE disputes ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE referrals ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE admin_actions ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE compliance_reports ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE gdpr_requests ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;

-- Convert profile primary keys (which are also foreign keys to users)
ALTER TABLE user_profiles ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE creator_profiles ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE brand_profiles ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE wallets ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;

-- Convert foreign key columns that reference users
ALTER TABLE campaigns ALTER COLUMN created_by TYPE VARCHAR(36) USING created_by::VARCHAR;
ALTER TABLE applications ALTER COLUMN creator_id TYPE VARCHAR(36) USING creator_id::VARCHAR;
ALTER TABLE active_campaigns ALTER COLUMN creator_id TYPE VARCHAR(36) USING creator_id::VARCHAR;
ALTER TABLE transactions ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE bank_accounts ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE withdrawal_requests ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE withdrawal_requests ALTER COLUMN processed_by TYPE VARCHAR(36) USING processed_by::VARCHAR;
ALTER TABLE notifications ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE social_accounts ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE media_kits ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE referrals ALTER COLUMN referrer_id TYPE VARCHAR(36) USING referrer_id::VARCHAR;
ALTER TABLE referrals ALTER COLUMN referee_id TYPE VARCHAR(36) USING referee_id::VARCHAR;
ALTER TABLE messages ALTER COLUMN sender_id TYPE VARCHAR(36) USING sender_id::VARCHAR;
ALTER TABLE conversations ALTER COLUMN creator_id TYPE VARCHAR(36) USING creator_id::VARCHAR;
ALTER TABLE conversations ALTER COLUMN brand_id TYPE VARCHAR(36) USING brand_id::VARCHAR;
ALTER TABLE disputes ALTER COLUMN filed_by TYPE VARCHAR(36) USING filed_by::VARCHAR;

-- Convert foreign key columns that reference other entities
ALTER TABLE applications ALTER COLUMN campaign_id TYPE VARCHAR(36) USING campaign_id::VARCHAR;
ALTER TABLE active_campaigns ALTER COLUMN campaign_id TYPE VARCHAR(36) USING campaign_id::VARCHAR;
ALTER TABLE transactions ALTER COLUMN campaign_id TYPE VARCHAR(36) USING campaign_id::VARCHAR;
ALTER TABLE transactions ALTER COLUMN application_id TYPE VARCHAR(36) USING application_id::VARCHAR;
ALTER TABLE withdrawal_requests ALTER COLUMN bank_account_id TYPE VARCHAR(36) USING bank_account_id::VARCHAR;
ALTER TABLE messages ALTER COLUMN conversation_id TYPE VARCHAR(36) USING conversation_id::VARCHAR;
ALTER TABLE disputes ALTER COLUMN active_campaign_id TYPE VARCHAR(36) USING active_campaign_id::VARCHAR;

-- ==========================================
-- Step 3: Recreate foreign key constraints
-- ==========================================

-- User-related foreign keys
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

ALTER TABLE bank_accounts
    ADD CONSTRAINT bank_accounts_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_processed_by_fkey
    FOREIGN KEY (processed_by) REFERENCES users(id);

ALTER TABLE notifications
    ADD CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE social_accounts
    ADD CONSTRAINT social_accounts_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE media_kits
    ADD CONSTRAINT media_kits_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE transactions
    ADD CONSTRAINT transactions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE referrals
    ADD CONSTRAINT referrals_referrer_id_fkey
    FOREIGN KEY (referrer_id) REFERENCES users(id);

ALTER TABLE referrals
    ADD CONSTRAINT referrals_referee_id_fkey
    FOREIGN KEY (referee_id) REFERENCES users(id);

ALTER TABLE messages
    ADD CONSTRAINT messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES users(id);

ALTER TABLE conversations
    ADD CONSTRAINT conversations_creator_id_fkey
    FOREIGN KEY (creator_id) REFERENCES users(id);

ALTER TABLE conversations
    ADD CONSTRAINT conversations_brand_id_fkey
    FOREIGN KEY (brand_id) REFERENCES users(id);

ALTER TABLE disputes
    ADD CONSTRAINT disputes_filed_by_fkey
    FOREIGN KEY (filed_by) REFERENCES users(id);

-- Campaign-related foreign keys
ALTER TABLE campaigns
    ADD CONSTRAINT campaigns_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES users(id);

ALTER TABLE applications
    ADD CONSTRAINT applications_campaign_id_fkey
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id);

ALTER TABLE applications
    ADD CONSTRAINT applications_creator_id_fkey
    FOREIGN KEY (creator_id) REFERENCES users(id);

ALTER TABLE active_campaigns
    ADD CONSTRAINT active_campaigns_campaign_id_fkey
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id);

ALTER TABLE active_campaigns
    ADD CONSTRAINT active_campaigns_creator_id_fkey
    FOREIGN KEY (creator_id) REFERENCES users(id);

ALTER TABLE transactions
    ADD CONSTRAINT transactions_campaign_id_fkey
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id);

ALTER TABLE transactions
    ADD CONSTRAINT transactions_application_id_fkey
    FOREIGN KEY (application_id) REFERENCES applications(id);

ALTER TABLE disputes
    ADD CONSTRAINT disputes_active_campaign_id_fkey
    FOREIGN KEY (active_campaign_id) REFERENCES active_campaigns(id);

-- Other foreign keys
ALTER TABLE withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_bank_account_id_fkey
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id);

ALTER TABLE messages
    ADD CONSTRAINT messages_conversation_id_fkey
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

-- ==========================================
-- Step 4: Add comments for documentation
-- ==========================================

COMMENT ON COLUMN users.id IS 'Primary key - VARCHAR(36) to match Java String UUID representation';
COMMENT ON COLUMN brand_profiles.user_id IS 'Foreign key to users - VARCHAR(36) for String compatibility';
COMMENT ON COLUMN creator_profiles.user_id IS 'Foreign key to users - VARCHAR(36) for String compatibility';
COMMENT ON COLUMN user_profiles.user_id IS 'Foreign key to users - VARCHAR(36) for String compatibility';
COMMENT ON COLUMN wallets.user_id IS 'Foreign key to users - VARCHAR(36) for String compatibility';

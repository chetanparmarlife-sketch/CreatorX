-- Migration V41: Convert UUID columns to VARCHAR for String compatibility
--
-- The Java entities use String type for IDs, but PostgreSQL columns were UUID type.
-- This causes "operator does not exist: uuid = character varying" errors.
--
-- Solution: Convert all UUID columns to VARCHAR to match Java String type.
-- UUID values are preserved as their string representation.

-- Convert primary key columns
ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE user_profiles ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE creator_profiles ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE brand_profiles ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
ALTER TABLE wallets ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;

-- Convert all other entity ID columns
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

-- Convert foreign key columns that reference other entities
ALTER TABLE applications ALTER COLUMN campaign_id TYPE VARCHAR(36) USING campaign_id::VARCHAR;
ALTER TABLE active_campaigns ALTER COLUMN campaign_id TYPE VARCHAR(36) USING campaign_id::VARCHAR;
ALTER TABLE transactions ALTER COLUMN campaign_id TYPE VARCHAR(36) USING campaign_id::VARCHAR;
ALTER TABLE transactions ALTER COLUMN application_id TYPE VARCHAR(36) USING application_id::VARCHAR;
ALTER TABLE withdrawal_requests ALTER COLUMN bank_account_id TYPE VARCHAR(36) USING bank_account_id::VARCHAR;
ALTER TABLE messages ALTER COLUMN conversation_id TYPE VARCHAR(36) USING conversation_id::VARCHAR;
ALTER TABLE messages ALTER COLUMN sender_id TYPE VARCHAR(36) USING sender_id::VARCHAR;
ALTER TABLE conversations ALTER COLUMN creator_id TYPE VARCHAR(36) USING creator_id::VARCHAR;
ALTER TABLE conversations ALTER COLUMN brand_id TYPE VARCHAR(36) USING brand_id::VARCHAR;
ALTER TABLE disputes ALTER COLUMN active_campaign_id TYPE VARCHAR(36) USING active_campaign_id::VARCHAR;
ALTER TABLE disputes ALTER COLUMN filed_by TYPE VARCHAR(36) USING filed_by::VARCHAR;

COMMENT ON COLUMN users.id IS 'Primary key - VARCHAR(36) to match Java String UUID representation';
COMMENT ON COLUMN brand_profiles.user_id IS 'Foreign key to users - VARCHAR(36) for String compatibility';
COMMENT ON COLUMN creator_profiles.user_id IS 'Foreign key to users - VARCHAR(36) for String compatibility';
COMMENT ON COLUMN user_profiles.user_id IS 'Foreign key to users - VARCHAR(36) for String compatibility';
COMMENT ON COLUMN wallets.user_id IS 'Foreign key to users - VARCHAR(36) for String compatibility';

-- ============================================================
-- V66: Ensure every BaseEntity table has updated_at and version
-- ============================================================
-- V38 added version to many tables but missed several that were
-- created later.  Some tables also lack updated_at.  Rather than
-- chase each failure one-by-one we sweep ALL entity tables here.
-- Every statement uses IF NOT EXISTS so it is fully idempotent.
-- ============================================================

-- admin_feedback
ALTER TABLE admin_feedback      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE admin_feedback      ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- admin_session_events
ALTER TABLE admin_session_events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE admin_session_events ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- admin_actions  (V65 should have covered this, belt-and-suspenders)
ALTER TABLE admin_actions       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE admin_actions       ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- admin_permissions
ALTER TABLE admin_permissions   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE admin_permissions   ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- users
ALTER TABLE users               ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE users               ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- user_profiles
ALTER TABLE user_profiles       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE user_profiles       ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- creator_profiles
ALTER TABLE creator_profiles    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE creator_profiles    ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- brand_profiles
ALTER TABLE brand_profiles      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE brand_profiles      ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- campaigns
ALTER TABLE campaigns           ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE campaigns           ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- applications
ALTER TABLE applications        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE applications        ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- campaign_applications
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_applications') THEN
    ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;
  END IF;
END $$;

-- active_campaigns
ALTER TABLE active_campaigns    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE active_campaigns    ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- deliverables
ALTER TABLE deliverables        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE deliverables        ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- deliverable_submissions
ALTER TABLE deliverable_submissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE deliverable_submissions ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- deliverable_reviews
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deliverable_reviews') THEN
    ALTER TABLE deliverable_reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE deliverable_reviews ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;
  END IF;
END $$;

-- wallets
ALTER TABLE wallets             ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE wallets             ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- brand_wallets
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_wallets') THEN
    ALTER TABLE brand_wallets   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE brand_wallets   ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;
  END IF;
END $$;

-- transactions
ALTER TABLE transactions        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE transactions        ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- escrow_transactions
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'escrow_transactions') THEN
    ALTER TABLE escrow_transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE escrow_transactions ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;
  END IF;
END $$;

-- bank_accounts
ALTER TABLE bank_accounts       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE bank_accounts       ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- payment_orders
ALTER TABLE payment_orders      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE payment_orders      ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- payment_methods
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_methods') THEN
    ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;
  END IF;
END $$;

-- withdrawal_requests
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- refunds
ALTER TABLE refunds             ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE refunds             ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- invoices
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
    ALTER TABLE invoices        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE invoices        ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;
  END IF;
END $$;

-- conversations
ALTER TABLE conversations       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE conversations       ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- messages
ALTER TABLE messages            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE messages            ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- notifications
ALTER TABLE notifications       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE notifications       ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- fcm_tokens
ALTER TABLE fcm_tokens          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE fcm_tokens          ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- disputes
ALTER TABLE disputes            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE disputes            ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- dispute_notes
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dispute_notes') THEN
    ALTER TABLE dispute_notes   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE dispute_notes   ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;
  END IF;
END $$;

-- dispute_evidence
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dispute_evidence') THEN
    ALTER TABLE dispute_evidence ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE dispute_evidence ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;
  END IF;
END $$;

-- referrals
ALTER TABLE referrals           ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE referrals           ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- social_accounts
ALTER TABLE social_accounts     ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE social_accounts     ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- social_links
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_links') THEN
    ALTER TABLE social_links    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE social_links    ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;
  END IF;
END $$;

-- saved_campaigns
ALTER TABLE saved_campaigns     ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE saved_campaigns     ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- team_members
ALTER TABLE team_members        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE team_members        ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- team_member_invitations
ALTER TABLE team_member_invitations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE team_member_invitations ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- brand_verification_documents
ALTER TABLE brand_verification_documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE brand_verification_documents ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- campaign_templates
ALTER TABLE campaign_templates  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE campaign_templates  ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- campaign_template_deliverables
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_template_deliverables') THEN
    ALTER TABLE campaign_template_deliverables ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE campaign_template_deliverables ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;
  END IF;
END $$;

-- campaign_deliverables
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_deliverables') THEN
    ALTER TABLE campaign_deliverables ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE campaign_deliverables ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;
  END IF;
END $$;

-- campaign_flags
ALTER TABLE campaign_flags      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE campaign_flags      ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- moderation_rules
ALTER TABLE moderation_rules    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE moderation_rules    ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- account_appeals
ALTER TABLE account_appeals     ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE account_appeals     ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- compliance_reports
ALTER TABLE compliance_reports  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE compliance_reports  ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- gdpr_requests
ALTER TABLE gdpr_requests       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE gdpr_requests       ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- kyc_documents
ALTER TABLE kyc_documents       ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE kyc_documents       ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- webhook_events
ALTER TABLE webhook_events      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE webhook_events      ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- reconciliation_reports
ALTER TABLE reconciliation_reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE reconciliation_reports ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- platform_settings
ALTER TABLE platform_settings   ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE platform_settings   ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- brand_lists
ALTER TABLE brand_lists         ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE brand_lists         ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- brand_list_creators
ALTER TABLE brand_list_creators ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE brand_list_creators ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;

-- idempotency_keys
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'idempotency_keys') THEN
    ALTER TABLE idempotency_keys ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE idempotency_keys ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;
  END IF;
END $$;

-- media_kits
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media_kits') THEN
    ALTER TABLE media_kits      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE media_kits      ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;
  END IF;
END $$;

-- application_feedback
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'application_feedback') THEN
    ALTER TABLE application_feedback ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    ALTER TABLE application_feedback ADD COLUMN IF NOT EXISTS version    BIGINT    NOT NULL DEFAULT 0;
  END IF;
END $$;

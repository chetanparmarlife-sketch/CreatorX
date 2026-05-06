-- ============================================================
-- V68: Ensure every BaseEntity table has created_at
-- ============================================================
-- The applications table (V4) was created with applied_at instead
-- of created_at. But since the Application entity extends BaseEntity,
-- Hibernate expects created_at to exist as well.
-- We add created_at to ALL tables with IF NOT EXISTS to guarantee
-- completeness and avoid whack-a-mole. We backfill using NOW() or
-- another timestamp if applicable, but default NOW() is safest.
-- ============================================================

-- admin_feedback
ALTER TABLE admin_feedback      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- admin_session_events
ALTER TABLE admin_session_events ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- admin_actions
ALTER TABLE admin_actions       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- admin_permissions
ALTER TABLE admin_permissions   ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- users
ALTER TABLE users               ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- user_profiles
ALTER TABLE user_profiles       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- creator_profiles
ALTER TABLE creator_profiles    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- brand_profiles
ALTER TABLE brand_profiles      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- campaigns
ALTER TABLE campaigns           ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- applications (This is the known missing one)
ALTER TABLE applications        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
-- Let's copy applied_at to created_at if created_at is newly added and we want it to make sense,
-- but the default NOW() is fine for schema validation. Let's update it to match applied_at just in case.
UPDATE applications SET created_at = applied_at WHERE created_at = NOW();

-- campaign_applications
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_applications') THEN
    ALTER TABLE campaign_applications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- active_campaigns
ALTER TABLE active_campaigns    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- deliverables
ALTER TABLE deliverables        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- deliverable_submissions
ALTER TABLE deliverable_submissions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- deliverable_reviews
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deliverable_reviews') THEN
    ALTER TABLE deliverable_reviews ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- wallets
ALTER TABLE wallets             ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- brand_wallets
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'brand_wallets') THEN
    ALTER TABLE brand_wallets   ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- transactions
ALTER TABLE transactions        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- escrow_transactions
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'escrow_transactions') THEN
    ALTER TABLE escrow_transactions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- bank_accounts
ALTER TABLE bank_accounts       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- payment_orders
ALTER TABLE payment_orders      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- payment_methods
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_methods') THEN
    ALTER TABLE payment_methods ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- withdrawal_requests
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- refunds
ALTER TABLE refunds             ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- invoices
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') THEN
    ALTER TABLE invoices        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- conversations
ALTER TABLE conversations       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- messages
ALTER TABLE messages            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- notifications
ALTER TABLE notifications       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- fcm_tokens
ALTER TABLE fcm_tokens          ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- disputes
ALTER TABLE disputes            ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- dispute_notes
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dispute_notes') THEN
    ALTER TABLE dispute_notes   ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- dispute_evidence
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dispute_evidence') THEN
    ALTER TABLE dispute_evidence ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- referrals
ALTER TABLE referrals           ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- social_accounts
ALTER TABLE social_accounts     ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- social_links
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_links') THEN
    ALTER TABLE social_links    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- saved_campaigns
ALTER TABLE saved_campaigns     ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- team_members
ALTER TABLE team_members        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- team_member_invitations
ALTER TABLE team_member_invitations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- brand_verification_documents
ALTER TABLE brand_verification_documents ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- campaign_templates
ALTER TABLE campaign_templates  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- campaign_template_deliverables
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_template_deliverables') THEN
    ALTER TABLE campaign_template_deliverables ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- campaign_deliverables
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_deliverables') THEN
    ALTER TABLE campaign_deliverables ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- campaign_flags
ALTER TABLE campaign_flags      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- moderation_rules
ALTER TABLE moderation_rules    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- account_appeals
ALTER TABLE account_appeals     ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- compliance_reports
ALTER TABLE compliance_reports  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- gdpr_requests
ALTER TABLE gdpr_requests       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- kyc_documents
ALTER TABLE kyc_documents       ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- webhook_events
ALTER TABLE webhook_events      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- reconciliation_reports
ALTER TABLE reconciliation_reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- platform_settings
ALTER TABLE platform_settings   ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- brand_lists
ALTER TABLE brand_lists         ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- brand_list_creators
ALTER TABLE brand_list_creators ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

-- idempotency_keys
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'idempotency_keys') THEN
    ALTER TABLE idempotency_keys ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- media_kits
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'media_kits') THEN
    ALTER TABLE media_kits      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- application_feedback
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'application_feedback') THEN
    ALTER TABLE application_feedback ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- ============================================================
-- V38: Add version columns for optimistic locking
-- ============================================================
-- This migration adds the 'version' column to all tables that
-- extend BaseEntity for Hibernate optimistic locking support.
-- ============================================================

-- Add version to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to creator_profiles table
ALTER TABLE creator_profiles
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to brand_profiles table
ALTER TABLE brand_profiles
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to campaigns table
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to applications table
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to active_campaigns table
ALTER TABLE active_campaigns
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to deliverables table
ALTER TABLE deliverables
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to deliverable_submissions table
ALTER TABLE deliverable_submissions
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to wallets table
ALTER TABLE wallets
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to bank_accounts table
ALTER TABLE bank_accounts
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to withdrawal_requests table
ALTER TABLE withdrawal_requests
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to conversations table
ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to notifications table
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to disputes table
ALTER TABLE disputes
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to referrals table
ALTER TABLE referrals
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to saved_campaigns table
ALTER TABLE saved_campaigns
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to team_members table
ALTER TABLE team_members
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to team_member_invitations table
ALTER TABLE team_member_invitations
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to brand_verification_documents table
ALTER TABLE brand_verification_documents
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to campaign_templates table
ALTER TABLE campaign_templates
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to admin_permissions table
ALTER TABLE admin_permissions
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to admin_actions table
ALTER TABLE admin_actions
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to admin_session_events table
ALTER TABLE admin_session_events
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to moderation_rules table
ALTER TABLE moderation_rules
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to campaign_flags table
ALTER TABLE campaign_flags
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to account_appeals table
ALTER TABLE account_appeals
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to compliance_reports table
ALTER TABLE compliance_reports
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to gdpr_requests table
ALTER TABLE gdpr_requests
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to social_accounts table (if exists)
ALTER TABLE social_accounts
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to webhook_events table (if exists)
ALTER TABLE webhook_events
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to payment_orders table (if exists)
ALTER TABLE payment_orders
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to refunds table (if exists)
ALTER TABLE refunds
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to reconciliation_reports table (if exists)
ALTER TABLE reconciliation_reports
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to fcm_tokens table (if exists)
ALTER TABLE fcm_tokens
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- Add version to kyc_documents table (if exists)
ALTER TABLE kyc_documents
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

COMMENT ON COLUMN users.version IS 'Optimistic locking version for Hibernate';

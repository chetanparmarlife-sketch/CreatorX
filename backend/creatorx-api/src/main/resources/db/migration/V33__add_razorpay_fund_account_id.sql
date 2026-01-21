-- Migration: Add Razorpay fund account ID to bank_accounts
-- Purpose: Track fund account IDs for webhook-based verification (fund_account.validation)
-- Phase: Phase 4.1 - Payout Security Hardening

-- Add column for Razorpay fund account ID
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS razorpay_fund_account_id VARCHAR(100);

-- Index for webhook lookups
CREATE INDEX IF NOT EXISTS idx_bank_accounts_razorpay_fund_account_id
ON bank_accounts(razorpay_fund_account_id) WHERE razorpay_fund_account_id IS NOT NULL;

-- Add verification_status column for more granular tracking
ALTER TABLE bank_accounts ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'pending';

COMMENT ON COLUMN bank_accounts.razorpay_fund_account_id IS 'Razorpay fund account ID for penny drop verification webhook';
COMMENT ON COLUMN bank_accounts.verification_status IS 'Verification status: pending, active, failed';

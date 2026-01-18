-- Migration: Add webhook-related fields to withdrawal_requests
-- Purpose: Support idempotent refunds and UTR tracking from Razorpay webhooks
-- Phase: Phase 4 - Real Money Payouts

-- UTR (Unique Transaction Reference) from bank for successful payouts
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS utr VARCHAR(100);

-- Timestamp when refund was processed (for idempotency - prevent double refunds)
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP;

-- Timestamp when webhook was received (audit trail)
ALTER TABLE withdrawal_requests ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMP;

-- Index for UTR lookups
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_utr ON withdrawal_requests(utr) WHERE utr IS NOT NULL;

-- Comments
COMMENT ON COLUMN withdrawal_requests.utr IS 'Bank UTR (Unique Transaction Reference) from Razorpay payout.processed webhook';
COMMENT ON COLUMN withdrawal_requests.refunded_at IS 'Timestamp when refund was processed - prevents double refunds on webhook retries';
COMMENT ON COLUMN withdrawal_requests.webhook_received_at IS 'Timestamp when status-changing webhook was received';

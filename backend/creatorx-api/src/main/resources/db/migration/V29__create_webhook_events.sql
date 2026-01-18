-- Migration: Create webhook_events table for Razorpay webhook deduplication
-- Purpose: Store incoming webhooks to prevent duplicate processing
-- Phase: Phase 4 - Real Money Payouts

CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint to prevent duplicate webhook processing
    CONSTRAINT uk_webhook_events_webhook_id UNIQUE (webhook_id)
);

-- Index for querying by event type
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);

-- Index for querying by created_at (for cleanup jobs)
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at);

-- Index for webhook_id lookups (unique constraint already creates index, but explicit for clarity)
CREATE INDEX idx_webhook_events_webhook_id ON webhook_events(webhook_id);

-- Comment on table
COMMENT ON TABLE webhook_events IS 'Stores Razorpay webhook events for idempotent processing and audit trail';
COMMENT ON COLUMN webhook_events.webhook_id IS 'Unique identifier from Razorpay webhook event (e.g., evt_xxxx)';
COMMENT ON COLUMN webhook_events.event_type IS 'Type of webhook event (e.g., payout.processed, payout.failed)';
COMMENT ON COLUMN webhook_events.payload IS 'Full JSON payload from Razorpay webhook';
COMMENT ON COLUMN webhook_events.processed_at IS 'Timestamp when webhook was successfully processed';

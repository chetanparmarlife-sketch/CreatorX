-- Migration: Add content_type column to idempotency_keys
-- Purpose: Store response Content-Type for accurate cache replay
-- Phase: Phase 4 - Real Money Payouts (IdempotencyFilter)

-- Content-Type header value for cached response replay
ALTER TABLE idempotency_keys ADD COLUMN IF NOT EXISTS content_type VARCHAR(255);

-- Comment
COMMENT ON COLUMN idempotency_keys.content_type IS 'Content-Type header from cached response for accurate replay';

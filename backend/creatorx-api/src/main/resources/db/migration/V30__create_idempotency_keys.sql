-- Migration: Create idempotency_keys table for API request deduplication
-- Purpose: Store idempotency keys to prevent duplicate API requests
-- Phase: Phase 4 - Real Money Payouts

CREATE TABLE idempotency_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(255) NOT NULL,
    response_status_code INTEGER,
    response_body TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,

    -- Unique constraint to prevent duplicate key usage
    CONSTRAINT uk_idempotency_keys_key UNIQUE (key)
);

-- Index for key lookups (unique constraint already creates index, but explicit for clarity)
CREATE INDEX idx_idempotency_keys_key ON idempotency_keys(key);

-- Index for cleanup jobs (delete expired keys)
CREATE INDEX idx_idempotency_keys_expires_at ON idempotency_keys(expires_at);

-- Comment on table
COMMENT ON TABLE idempotency_keys IS 'Stores idempotency keys for preventing duplicate API requests (withdrawals, payouts)';
COMMENT ON COLUMN idempotency_keys.key IS 'Unique idempotency key from request header or generated';
COMMENT ON COLUMN idempotency_keys.response_status_code IS 'HTTP status code of cached response';
COMMENT ON COLUMN idempotency_keys.response_body IS 'Cached response body to return for duplicate requests';
COMMENT ON COLUMN idempotency_keys.expires_at IS 'Expiration timestamp (TTL: 24 hours recommended)';

-- Note: A scheduled job or cron should periodically delete expired keys:
-- DELETE FROM idempotency_keys WHERE expires_at < NOW();

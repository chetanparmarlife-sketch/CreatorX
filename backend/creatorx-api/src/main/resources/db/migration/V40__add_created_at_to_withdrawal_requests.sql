-- Migration V40: Add created_at column to withdrawal_requests
-- The WithdrawalRequest entity extends BaseEntity which requires created_at field
-- This migration adds the missing column and populates it from requested_at

ALTER TABLE withdrawal_requests
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;

-- Populate created_at with requested_at for existing records
UPDATE withdrawal_requests
SET created_at = requested_at
WHERE created_at IS NULL;

-- Now make it NOT NULL
ALTER TABLE withdrawal_requests
ALTER COLUMN created_at SET NOT NULL,
ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

COMMENT ON COLUMN withdrawal_requests.created_at IS 'Timestamp when the withdrawal request record was created (from BaseEntity)';

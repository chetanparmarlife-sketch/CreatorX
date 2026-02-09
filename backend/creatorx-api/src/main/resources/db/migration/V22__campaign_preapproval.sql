-- Add PENDING_REVIEW campaign status and review metadata
-- Note: PostgreSQL requires enum additions to be committed before they can be used
-- So we add the enum value but cannot create a partial index using it in the same transaction

ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'PENDING_REVIEW';

ALTER TABLE campaigns
    ADD COLUMN IF NOT EXISTS review_reason TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Index for pending review campaigns (without WHERE clause to avoid enum transaction issue)
-- The application will filter by status = 'PENDING_REVIEW' at query time
CREATE INDEX IF NOT EXISTS idx_campaigns_reviewed_by ON campaigns(reviewed_by) WHERE reviewed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaigns_reviewed_at ON campaigns(reviewed_at) WHERE reviewed_at IS NOT NULL;

INSERT INTO admin_permissions (admin_id, permission)
SELECT u.id, 'ADMIN_CAMPAIGN_REVIEW'
FROM users u
WHERE u.role = 'ADMIN'
ON CONFLICT (admin_id, permission) DO NOTHING;

-- Add PENDING_REVIEW campaign status and review metadata
ALTER TYPE campaign_status ADD VALUE IF NOT EXISTS 'PENDING_REVIEW';

ALTER TABLE campaigns
    ADD COLUMN IF NOT EXISTS review_reason TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_campaigns_pending_review
    ON campaigns(status)
    WHERE status = 'PENDING_REVIEW';

INSERT INTO admin_permissions (admin_id, permission)
SELECT u.id, 'ADMIN_CAMPAIGN_REVIEW'
FROM users u
WHERE u.role = 'ADMIN'
ON CONFLICT (admin_id, permission) DO NOTHING;

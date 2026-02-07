-- Migration V9: Additional indexes and constraints for performance optimization
-- Using CREATE INDEX IF NOT EXISTS to be idempotent

-- Composite indexes for common query patterns

-- User lookup by role and status
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users(role, status) WHERE status = 'ACTIVE';

-- Campaign search by status and dates
CREATE INDEX IF NOT EXISTS idx_campaigns_active_search ON campaigns(status, start_date, end_date, category) 
    WHERE status = 'ACTIVE';

-- Application lookup by creator and status
CREATE INDEX IF NOT EXISTS idx_applications_creator_status ON applications(creator_id, status, applied_at DESC);

-- Transaction history by user and date range
CREATE INDEX IF NOT EXISTS idx_transactions_user_date_range ON transactions(user_id, created_at DESC, type, status);

-- Unread notifications by user
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_recent ON notifications(user_id, created_at DESC) 
    WHERE read = FALSE;

-- Active conversations with unread messages
CREATE INDEX IF NOT EXISTS idx_conversations_active_unread ON conversations(creator_id, brand_id, last_message_at DESC) 
    WHERE creator_unread_count > 0 OR brand_unread_count > 0;

-- Campaign deliverables by due date (regular index, filtered at query time)
CREATE INDEX IF NOT EXISTS idx_campaign_deliverables_due_date_status ON campaign_deliverables(due_date, campaign_id);

-- Pending withdrawal requests
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_pending ON withdrawal_requests(status, requested_at) 
    WHERE status IN ('PENDING', 'PROCESSING');

-- KYC documents pending verification
CREATE INDEX IF NOT EXISTS idx_kyc_documents_pending ON kyc_documents(status, created_at) 
    WHERE status = 'PENDING';

-- Open disputes
CREATE INDEX IF NOT EXISTS idx_disputes_open_recent ON disputes(status, created_at DESC) 
    WHERE status IN ('OPEN', 'IN_REVIEW');

-- Referrals pending completion
CREATE INDEX IF NOT EXISTS idx_referrals_pending ON referrals(status, created_at) 
    WHERE status = 'PENDING';

-- Full-text search indexes
-- Create pg_trgm extension if not exists (for trigram similarity searches)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Campaign full-text search
CREATE INDEX IF NOT EXISTS idx_campaigns_title_trgm ON campaigns USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_campaigns_description_trgm ON campaigns USING gin(description gin_trgm_ops);

-- Application pitch search
CREATE INDEX IF NOT EXISTS idx_applications_pitch_search ON applications USING gin(to_tsvector('english', pitch_text));

-- Message content search
CREATE INDEX IF NOT EXISTS idx_messages_content_search ON messages USING gin(to_tsvector('english', content));

-- Partial indexes for better performance on filtered queries

-- Active campaigns only
CREATE INDEX IF NOT EXISTS idx_campaigns_active_only ON campaigns(id, title, budget, platform, category) 
    WHERE status = 'ACTIVE';

-- Verified creators only
CREATE INDEX IF NOT EXISTS idx_creator_profiles_verified ON creator_profiles(user_id, username, category, follower_count) 
    WHERE verified = TRUE;

-- Verified brands only
CREATE INDEX IF NOT EXISTS idx_brand_profiles_verified ON brand_profiles(user_id, company_name, industry) 
    WHERE verified = TRUE;

-- Completed transactions only
CREATE INDEX IF NOT EXISTS idx_transactions_completed ON transactions(user_id, amount, created_at DESC) 
    WHERE status = 'COMPLETED';

-- Default bank accounts
CREATE INDEX IF NOT EXISTS idx_bank_accounts_default ON bank_accounts(user_id, id) 
    WHERE is_default = TRUE AND verified = TRUE;

-- Constraints for data integrity
-- Note: Subquery constraints not supported in PostgreSQL CHECK, enforcing at application layer

-- Ensure campaign dates are logical (only add if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_application_deadline'
    ) THEN
        ALTER TABLE campaigns
        ADD CONSTRAINT chk_application_deadline 
        CHECK (
            application_deadline IS NULL OR 
            application_deadline <= end_date
        );
    END IF;
END $$;

-- Comments for complex relationships
COMMENT ON INDEX idx_campaigns_active_search IS 
    'Optimizes campaign discovery and search queries';
COMMENT ON INDEX idx_conversations_active_unread IS 
    'Optimizes queries for conversations with unread messages';

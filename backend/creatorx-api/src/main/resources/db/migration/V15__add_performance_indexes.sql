-- Performance optimization indexes
-- Created: 2024-01-XX
-- Purpose: Improve query performance for frequently accessed data

-- Index for campaign searches by status and dates
CREATE INDEX IF NOT EXISTS idx_campaigns_status_dates 
ON campaigns(status, start_date, end_date) 
WHERE status = 'ACTIVE';

-- Index for campaign category and platform filtering
CREATE INDEX IF NOT EXISTS idx_campaigns_category_platform 
ON campaigns(category, platform) 
WHERE status = 'ACTIVE';

-- Index for application queries by creator and status
CREATE INDEX IF NOT EXISTS idx_applications_creator_status 
ON applications(creator_id, status, applied_at DESC);

-- Index for application queries by campaign and status
CREATE INDEX IF NOT EXISTS idx_applications_campaign_status 
ON applications(campaign_id, status);

-- Index for transaction queries by user and date
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
ON transactions(user_id, created_at DESC);

-- Index for transaction queries by type
CREATE INDEX IF NOT EXISTS idx_transactions_type 
ON transactions(transaction_type, created_at DESC);

-- Index for message queries by conversation and date
CREATE INDEX IF NOT EXISTS idx_messages_conversation_date 
ON messages(conversation_id, created_at DESC);

-- Index for notification queries by user and read status
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON notifications(user_id, read, created_at DESC);

-- Index for saved campaigns queries
CREATE INDEX IF NOT EXISTS idx_saved_campaigns_creator 
ON saved_campaigns(creator_id, saved_at DESC);

-- Index for wallet queries by user
CREATE INDEX IF NOT EXISTS idx_wallets_user 
ON wallets(user_id);

-- Composite index for campaign full-text search performance
CREATE INDEX IF NOT EXISTS idx_campaigns_fts 
ON campaigns USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Index for user profile lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user 
ON user_profiles(user_id);

-- Index for creator profile lookups
CREATE INDEX IF NOT EXISTS idx_creator_profiles_user 
ON creator_profiles(user_id);

-- Index for brand profile lookups
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user 
ON brand_profiles(user_id);

-- Index for conversation lookups by participants
CREATE INDEX IF NOT EXISTS idx_conversations_participants 
ON conversations(creator_id, brand_id, campaign_id);

-- Index for deliverable queries
CREATE INDEX IF NOT EXISTS idx_deliverables_application 
ON deliverables(application_id, status, due_date);

-- Index for withdrawal requests
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_status 
ON withdrawal_requests(user_id, status, created_at DESC);

-- Index for bank accounts
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user 
ON bank_accounts(user_id, is_default DESC);

-- Comments
COMMENT ON INDEX idx_campaigns_status_dates IS 'Optimizes queries for active campaigns by date range';
COMMENT ON INDEX idx_campaigns_category_platform IS 'Optimizes filtering by category and platform';
COMMENT ON INDEX idx_applications_creator_status IS 'Optimizes creator application queries';
COMMENT ON INDEX idx_transactions_user_date IS 'Optimizes transaction history queries';
COMMENT ON INDEX idx_messages_conversation_date IS 'Optimizes message retrieval by conversation';
COMMENT ON INDEX idx_notifications_user_read IS 'Optimizes notification queries';
COMMENT ON INDEX idx_campaigns_fts IS 'Optimizes full-text search on campaigns';


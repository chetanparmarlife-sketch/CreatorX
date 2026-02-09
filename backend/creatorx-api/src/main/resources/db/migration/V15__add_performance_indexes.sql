-- Performance optimization indexes
-- Created: 2024-01-XX
-- Purpose: Improve query performance for frequently accessed data
-- Note: Using IF NOT EXISTS for idempotent migration

-- Index for campaign searches by status and dates
CREATE INDEX IF NOT EXISTS idx_campaigns_status_dates 
ON campaigns(status, start_date, end_date) 
WHERE status = 'ACTIVE';

-- Index for campaign category and platform filtering
CREATE INDEX IF NOT EXISTS idx_campaigns_category_platform 
ON campaigns(category, platform) 
WHERE status = 'ACTIVE';

-- Index for application queries by creator and status
CREATE INDEX IF NOT EXISTS idx_applications_creator_status_v15 
ON applications(creator_id, status, applied_at DESC);

-- Index for application queries by campaign and status
CREATE INDEX IF NOT EXISTS idx_applications_campaign_status 
ON applications(campaign_id, status);

-- Index for transaction queries by user and date
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
ON transactions(user_id, created_at DESC);

-- Index for transaction queries by type (column is named 'type', not 'transaction_type')
CREATE INDEX IF NOT EXISTS idx_transactions_type_v15 
ON transactions(type, created_at DESC);

-- Index for message queries by conversation and date
CREATE INDEX IF NOT EXISTS idx_messages_conversation_date 
ON messages(conversation_id, created_at DESC);

-- Index for notification queries by user and read status
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON notifications(user_id, read, created_at DESC);

-- Index for saved campaigns queries
CREATE INDEX IF NOT EXISTS idx_saved_campaigns_creator 
ON saved_campaigns(creator_id, saved_at DESC);

-- Composite index for campaign full-text search performance
CREATE INDEX IF NOT EXISTS idx_campaigns_fts 
ON campaigns USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Index for creator profile lookups
CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_v15 
ON creator_profiles(user_id);

-- Index for brand profile lookups
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_v15 
ON brand_profiles(user_id);

-- Index for conversation lookups by participants
CREATE INDEX IF NOT EXISTS idx_conversations_participants 
ON conversations(creator_id, brand_id, campaign_id);

-- Index for campaign deliverable queries
CREATE INDEX IF NOT EXISTS idx_campaign_deliverables_campaign 
ON campaign_deliverables(campaign_id, due_date);

-- Index for withdrawal requests (column is 'requested_at' not 'created_at')
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_status_v15 
ON withdrawal_requests(user_id, status, requested_at DESC);

-- Index for bank accounts
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user_v15 
ON bank_accounts(user_id, is_default DESC);

-- Comments
COMMENT ON INDEX idx_campaigns_status_dates IS 'Optimizes queries for active campaigns by date range';
COMMENT ON INDEX idx_campaigns_category_platform IS 'Optimizes filtering by category and platform';
COMMENT ON INDEX idx_transactions_user_date IS 'Optimizes transaction history queries';
COMMENT ON INDEX idx_messages_conversation_date IS 'Optimizes message retrieval by conversation';
COMMENT ON INDEX idx_notifications_user_read IS 'Optimizes notification queries';
COMMENT ON INDEX idx_campaigns_fts IS 'Optimizes full-text search on campaigns';

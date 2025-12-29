-- Migration V8: Create triggers for updated_at timestamps

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger function to automatically update updated_at timestamp';

-- Apply trigger to all tables with updated_at column

-- Users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- User Profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Creator Profiles
CREATE TRIGGER update_creator_profiles_updated_at
    BEFORE UPDATE ON creator_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Brand Profiles
CREATE TRIGGER update_brand_profiles_updated_at
    BEFORE UPDATE ON brand_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- KYC Documents
CREATE TRIGGER update_kyc_documents_updated_at
    BEFORE UPDATE ON kyc_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Campaigns
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Campaign Deliverables
CREATE TRIGGER update_campaign_deliverables_updated_at
    BEFORE UPDATE ON campaign_deliverables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Applications
CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Application Feedback
CREATE TRIGGER update_application_feedback_updated_at
    BEFORE UPDATE ON application_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Deliverable Submissions
CREATE TRIGGER update_deliverable_submissions_updated_at
    BEFORE UPDATE ON deliverable_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Deliverable Reviews
CREATE TRIGGER update_deliverable_reviews_updated_at
    BEFORE UPDATE ON deliverable_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Wallets
CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Transactions
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Withdrawal Requests
CREATE TRIGGER update_withdrawal_requests_updated_at
    BEFORE UPDATE ON withdrawal_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Bank Accounts
CREATE TRIGGER update_bank_accounts_updated_at
    BEFORE UPDATE ON bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Conversations
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Disputes
CREATE TRIGGER update_disputes_updated_at
    BEFORE UPDATE ON disputes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Referrals
CREATE TRIGGER update_referrals_updated_at
    BEFORE UPDATE ON referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Social Links
CREATE TRIGGER update_social_links_updated_at
    BEFORE UPDATE ON social_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Active Campaigns
CREATE TRIGGER update_active_campaigns_updated_at
    BEFORE UPDATE ON active_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Deliverables
CREATE TRIGGER update_deliverables_updated_at
    BEFORE UPDATE ON deliverables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update conversation last_message_at when message is created
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at,
        updated_at = CURRENT_TIMESTAMP,
        creator_unread_count = CASE 
            WHEN NEW.sender_id = creator_id THEN creator_unread_count
            ELSE creator_unread_count + 1
        END,
        brand_unread_count = CASE 
            WHEN NEW.sender_id = brand_id THEN brand_unread_count
            ELSE brand_unread_count + 1
        END
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

COMMENT ON FUNCTION update_conversation_last_message() IS 'Updates conversation last_message_at and unread counts when new message is created';

-- Trigger to reset unread count when message is read
CREATE OR REPLACE FUNCTION reset_conversation_unread_count()
RETURNS TRIGGER AS $$
DECLARE
    v_creator_id UUID;
    v_brand_id UUID;
BEGIN
    SELECT creator_id, brand_id INTO v_creator_id, v_brand_id
    FROM conversations
    WHERE id = NEW.conversation_id;
    
    IF NEW.read = TRUE AND OLD.read = FALSE THEN
        UPDATE conversations
        SET creator_unread_count = CASE 
                WHEN NEW.sender_id = creator_id THEN GREATEST(0, creator_unread_count - 1)
                ELSE creator_unread_count
            END,
            brand_unread_count = CASE 
                WHEN NEW.sender_id = brand_id THEN GREATEST(0, brand_unread_count - 1)
                ELSE brand_unread_count
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.conversation_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reset_unread_on_message_read
    AFTER UPDATE OF read ON messages
    FOR EACH ROW
    WHEN (NEW.read = TRUE AND OLD.read = FALSE)
    EXECUTE FUNCTION reset_conversation_unread_count();

COMMENT ON FUNCTION reset_conversation_unread_count() IS 'Resets conversation unread count when message is marked as read';


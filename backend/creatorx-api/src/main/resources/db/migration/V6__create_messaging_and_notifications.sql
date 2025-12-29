-- Migration V6: Create Messaging and Notification tables

-- Conversations (chat conversations between users)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE,
    creator_unread_count INTEGER DEFAULT 0,
    brand_unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_unique_conversation UNIQUE (campaign_id, creator_id, brand_id),
    CONSTRAINT chk_unread_counts CHECK (creator_unread_count >= 0 AND brand_unread_count >= 0),
    CONSTRAINT chk_creator_brand_different CHECK (creator_id != brand_id),
    CONSTRAINT chk_users_roles CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = creator_id AND role = 'CREATOR') AND
        EXISTS (SELECT 1 FROM users WHERE id = brand_id AND role = 'BRAND')
    )
);

COMMENT ON TABLE conversations IS 'Chat conversations between creators and brands';
COMMENT ON COLUMN conversations.campaign_id IS 'Optional: Conversation related to a specific campaign';
COMMENT ON COLUMN conversations.creator_unread_count IS 'Number of unread messages for creator';
COMMENT ON COLUMN conversations.brand_unread_count IS 'Number of unread messages for brand';

-- Messages (individual messages in conversations)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_sender_in_conversation CHECK (
        EXISTS (
            SELECT 1 FROM conversations c 
            WHERE c.id = conversation_id 
            AND (c.creator_id = sender_id OR c.brand_id = sender_id)
        )
    ),
    CONSTRAINT chk_read_timestamp CHECK (
        (read = TRUE AND read_at IS NOT NULL) OR
        (read = FALSE)
    )
);

COMMENT ON TABLE messages IS 'Individual messages in conversations';
COMMENT ON COLUMN messages.content IS 'Message text content';
COMMENT ON COLUMN messages.read IS 'Whether the message has been read by recipient';

-- Notifications (in-app notifications)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data_json JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_read_timestamp_notification CHECK (
        (read = TRUE AND read_at IS NOT NULL) OR
        (read = FALSE)
    )
);

COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON COLUMN notifications.type IS 'Type of notification for filtering and display';
COMMENT ON COLUMN notifications.data_json IS 'Additional data in JSON format (e.g., campaign_id, transaction_id)';
COMMENT ON COLUMN notifications.read IS 'Whether notification has been read';

-- Indexes for messaging and notification tables
CREATE INDEX idx_conversations_campaign_id ON conversations(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_conversations_creator_id ON conversations(creator_id);
CREATE INDEX idx_conversations_brand_id ON conversations(brand_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC) WHERE last_message_at IS NOT NULL;
CREATE INDEX idx_conversations_creator_unread ON conversations(creator_id) WHERE creator_unread_count > 0;
CREATE INDEX idx_conversations_brand_unread ON conversations(brand_id) WHERE brand_unread_count > 0;

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_read ON messages(conversation_id, read) WHERE read = FALSE;
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC) WHERE read = FALSE;





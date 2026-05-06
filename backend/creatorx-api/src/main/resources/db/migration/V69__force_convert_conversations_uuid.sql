-- ============================================================
-- V69: Force convert messaging and notifications UUID to VARCHAR
-- ============================================================

ALTER TABLE conversations DROP CONSTRAINT IF EXISTS chk_unique_conversation;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_campaign_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_creator_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_brand_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

ALTER TABLE conversations ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE conversations ALTER COLUMN campaign_id TYPE VARCHAR(36) USING campaign_id::VARCHAR;
ALTER TABLE conversations ALTER COLUMN creator_id TYPE VARCHAR(36) USING creator_id::VARCHAR;
ALTER TABLE conversations ALTER COLUMN brand_id TYPE VARCHAR(36) USING brand_id::VARCHAR;

ALTER TABLE messages ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE messages ALTER COLUMN conversation_id TYPE VARCHAR(36) USING conversation_id::VARCHAR;
ALTER TABLE messages ALTER COLUMN sender_id TYPE VARCHAR(36) USING sender_id::VARCHAR;

ALTER TABLE notifications ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
ALTER TABLE notifications ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;

ALTER TABLE conversations ADD CONSTRAINT chk_unique_conversation UNIQUE (campaign_id, creator_id, brand_id);
ALTER TABLE conversations ADD CONSTRAINT conversations_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES campaigns(id);
ALTER TABLE conversations ADD CONSTRAINT conversations_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES users(id);
ALTER TABLE conversations ADD CONSTRAINT conversations_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES users(id);

ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES users(id);
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

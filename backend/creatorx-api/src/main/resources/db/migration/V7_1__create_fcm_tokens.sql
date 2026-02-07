-- Migration V7: Create FCM Tokens table for push notifications

-- FCM Tokens (Firebase Cloud Messaging tokens for push notifications)
CREATE TABLE fcm_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    fcm_token TEXT NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('IOS', 'ANDROID')),
    last_used_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_unique_user_device UNIQUE (user_id, device_id)
);

COMMENT ON TABLE fcm_tokens IS 'FCM tokens for push notifications per user device';
COMMENT ON COLUMN fcm_tokens.fcm_token IS 'Firebase Cloud Messaging token';
COMMENT ON COLUMN fcm_tokens.device_id IS 'Unique device identifier';
COMMENT ON COLUMN fcm_tokens.platform IS 'Device platform: IOS or ANDROID';
COMMENT ON COLUMN fcm_tokens.active IS 'Whether token is active (false when user logs out or uninstalls)';

-- Indexes
CREATE INDEX idx_fcm_tokens_user_id ON fcm_tokens(user_id);
CREATE INDEX idx_fcm_tokens_device_id ON fcm_tokens(device_id);
CREATE INDEX idx_fcm_tokens_user_device ON fcm_tokens(user_id, device_id);
CREATE INDEX idx_fcm_tokens_active ON fcm_tokens(user_id, active) WHERE active = TRUE;


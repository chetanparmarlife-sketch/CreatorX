-- Migration V28: Create social_accounts for provider-linked metrics

CREATE TYPE social_provider AS ENUM ('INSTAGRAM', 'FACEBOOK', 'LINKEDIN');
CREATE TYPE social_sync_status AS ENUM ('DISCONNECTED', 'CONNECTED', 'NEEDS_REAUTH', 'ERROR', 'PENDING');

CREATE TABLE social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider social_provider NOT NULL,
    username VARCHAR(255),
    profile_url TEXT,
    follower_count INTEGER,
    engagement_rate DECIMAL(5, 2),
    avg_views INTEGER,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    connected BOOLEAN DEFAULT FALSE,
    sync_status social_sync_status NOT NULL DEFAULT 'DISCONNECTED',
    last_synced_at TIMESTAMP WITH TIME ZONE,
    last_manual_refresh_at TIMESTAMP WITH TIME ZONE,
    last_failure_at TIMESTAMP WITH TIME ZONE,
    last_failure_message TEXT,
    failure_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_social_followers CHECK (follower_count IS NULL OR follower_count >= 0),
    CONSTRAINT chk_social_engagement CHECK (engagement_rate IS NULL OR (engagement_rate >= 0 AND engagement_rate <= 100)),
    CONSTRAINT unique_social_account UNIQUE (user_id, provider)
);

CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_provider ON social_accounts(provider);
CREATE INDEX idx_social_accounts_status ON social_accounts(sync_status);

-- V64__create_brand_lists.sql
--
-- Creates shared brand creator shortlist tables.
-- This is V64 because V63 already exists for team invitation expiry.
-- Brand shortlists previously lived in browser localStorage, which meant
-- they disappeared when a brand changed browser/device and were not shared
-- with brand team members.

CREATE TABLE IF NOT EXISTS brand_lists (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    brand_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id VARCHAR(36) REFERENCES campaigns(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL DEFAULT 'Shortlist',
    created_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version BIGINT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS brand_list_creators (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::VARCHAR,
    list_id VARCHAR(36) NOT NULL REFERENCES brand_lists(id) ON DELETE CASCADE,
    creator_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    added_by VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    added_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version BIGINT DEFAULT 0,
    CONSTRAINT uq_brand_list_creator UNIQUE(list_id, creator_id)
);

CREATE INDEX IF NOT EXISTS idx_brand_lists_brand_id ON brand_lists(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_lists_campaign_id ON brand_lists(campaign_id);
CREATE INDEX IF NOT EXISTS idx_brand_list_creators_list_id ON brand_list_creators(list_id);
CREATE INDEX IF NOT EXISTS idx_brand_list_creators_creator_id ON brand_list_creators(creator_id);

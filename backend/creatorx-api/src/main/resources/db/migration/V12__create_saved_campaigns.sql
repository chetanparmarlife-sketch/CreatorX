-- Migration V12: Create saved campaigns table for creator favorites

CREATE TABLE saved_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_creator_campaign UNIQUE (creator_id, campaign_id)
);

CREATE INDEX idx_saved_campaigns_creator_id ON saved_campaigns(creator_id);
CREATE INDEX idx_saved_campaigns_campaign_id ON saved_campaigns(campaign_id);
CREATE INDEX idx_saved_campaigns_created_at ON saved_campaigns(created_at);

COMMENT ON TABLE saved_campaigns IS 'Creator saved/favorite campaigns';
COMMENT ON COLUMN saved_campaigns.creator_id IS 'Creator who saved the campaign';
COMMENT ON COLUMN saved_campaigns.campaign_id IS 'Campaign that was saved';


-- Migration V4.1: Create Active Campaigns and Deliverables tables
-- These tables are needed for tracking active campaigns and their deliverables

-- Active Campaigns (campaigns that have been accepted and are in progress)
CREATE TABLE active_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE RESTRICT,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    payment_status payment_status NOT NULL DEFAULT 'PENDING',
    payment_amount DECIMAL(12, 2) NOT NULL,
    deadline DATE NOT NULL,
    completed_at DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_payment_amount_positive CHECK (payment_amount > 0),
    CONSTRAINT chk_unique_active_campaign UNIQUE (campaign_id, creator_id)
);

COMMENT ON TABLE active_campaigns IS 'Active campaigns where creator has been selected and campaign is in progress';
COMMENT ON COLUMN active_campaigns.campaign_id IS 'Reference to the original campaign';
COMMENT ON COLUMN active_campaigns.creator_id IS 'Creator who is working on this campaign';
COMMENT ON COLUMN active_campaigns.payment_status IS 'Payment status: PENDING, PROCESSING, PAID, etc.';
COMMENT ON COLUMN active_campaigns.payment_amount IS 'Amount to be paid to creator for this campaign';

-- Deliverables (individual deliverables for active campaigns)
CREATE TABLE deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    active_campaign_id UUID NOT NULL REFERENCES active_campaigns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status deliverable_status NOT NULL DEFAULT 'PENDING',
    type VARCHAR(50) NOT NULL, -- Type: CONTENT_DRAFT, THUMBNAIL, CAPTION, RAW_FILE, POST_PROOF
    due_date DATE NOT NULL,
    submitted_file_url TEXT,
    submitted_file_name VARCHAR(255),
    submitted_file_type VARCHAR(50),
    submitted_at TIMESTAMP WITH TIME ZONE,
    feedback TEXT,
    post_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE deliverables IS 'Individual deliverables for active campaigns';
COMMENT ON COLUMN deliverables.active_campaign_id IS 'Reference to the active campaign';
COMMENT ON COLUMN deliverables.status IS 'Status of the deliverable: PENDING, SUBMITTED, APPROVED, etc.';
COMMENT ON COLUMN deliverables.type IS 'Type of deliverable: CONTENT_DRAFT, THUMBNAIL, CAPTION, etc.';
COMMENT ON COLUMN deliverables.submitted_file_url IS 'URL to submitted file in Supabase Storage';
COMMENT ON COLUMN deliverables.post_url IS 'URL where the content was posted (for verification)';

-- Indexes for active campaigns and deliverables
CREATE INDEX idx_active_campaigns_campaign_id ON active_campaigns(campaign_id);
CREATE INDEX idx_active_campaigns_creator_id ON active_campaigns(creator_id);
CREATE INDEX idx_active_campaigns_payment_status ON active_campaigns(payment_status);
CREATE INDEX idx_active_campaigns_deadline ON active_campaigns(deadline);

CREATE INDEX idx_deliverables_active_campaign_id ON deliverables(active_campaign_id);
CREATE INDEX idx_deliverables_status ON deliverables(status);
CREATE INDEX idx_deliverables_type ON deliverables(type);
CREATE INDEX idx_deliverables_due_date ON deliverables(due_date);


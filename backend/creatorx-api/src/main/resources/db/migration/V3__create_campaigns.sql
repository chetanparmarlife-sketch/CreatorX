-- Migration V3: Create Campaign tables

-- Campaigns table
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(12, 2) NOT NULL,
    platform campaign_platform NOT NULL,
    category VARCHAR(100) NOT NULL,
    requirements TEXT,
    deliverable_types TEXT[] NOT NULL DEFAULT '{}',
    status campaign_status NOT NULL DEFAULT 'DRAFT',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    application_deadline DATE,
    max_applicants INTEGER,
    selected_creators_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_budget_positive CHECK (budget > 0),
    CONSTRAINT chk_dates_valid CHECK (start_date <= end_date),
    CONSTRAINT chk_max_applicants CHECK (max_applicants IS NULL OR max_applicants > 0),
    CONSTRAINT chk_selected_count CHECK (selected_creators_count >= 0)
);

COMMENT ON TABLE campaigns IS 'Brand campaigns for creator collaborations';
COMMENT ON COLUMN campaigns.brand_id IS 'Brand user who created the campaign';
COMMENT ON COLUMN campaigns.budget IS 'Total campaign budget in INR';
COMMENT ON COLUMN campaigns.platform IS 'Primary social media platform';
COMMENT ON COLUMN campaigns.deliverable_types IS 'Array of deliverable types required (IMAGE, VIDEO, etc.)';
COMMENT ON COLUMN campaigns.application_deadline IS 'Deadline for applications (can be before start_date)';
COMMENT ON COLUMN campaigns.max_applicants IS 'Maximum number of creators to select (NULL = unlimited)';
COMMENT ON COLUMN campaigns.selected_creators_count IS 'Number of creators currently selected';

-- Campaign Deliverables (required deliverables for a campaign)
CREATE TABLE campaign_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type deliverable_type NOT NULL,
    due_date DATE NOT NULL,
    is_mandatory BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE campaign_deliverables IS 'Required deliverables for each campaign';
COMMENT ON COLUMN campaign_deliverables.type IS 'Type of deliverable (IMAGE, VIDEO, STORY, etc.)';
COMMENT ON COLUMN campaign_deliverables.due_date IS 'Due date for this specific deliverable';
COMMENT ON COLUMN campaign_deliverables.order_index IS 'Display order for deliverables';

-- Campaign Tags (for search and filtering)
CREATE TABLE campaign_tags (
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (campaign_id, tag)
);

COMMENT ON TABLE campaign_tags IS 'Tags for campaign categorization and search';

-- Campaign Requirements (detailed requirements)
CREATE TABLE campaign_requirements (
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    requirement_text TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    PRIMARY KEY (campaign_id, order_index)
);

COMMENT ON TABLE campaign_requirements IS 'Detailed requirements for the campaign';

-- Indexes for campaign tables
CREATE INDEX idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_platform ON campaigns(platform);
CREATE INDEX idx_campaigns_category ON campaigns(category);
CREATE INDEX idx_campaigns_start_date ON campaigns(start_date);
CREATE INDEX idx_campaigns_end_date ON campaigns(end_date);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX idx_campaigns_status_dates ON campaigns(status, start_date, end_date) WHERE status = 'ACTIVE';

-- Full-text search index on campaigns
CREATE INDEX idx_campaigns_search ON campaigns USING gin(to_tsvector('english', title || ' ' || description));

CREATE INDEX idx_campaign_deliverables_campaign_id ON campaign_deliverables(campaign_id);
CREATE INDEX idx_campaign_deliverables_due_date ON campaign_deliverables(due_date);
CREATE INDEX idx_campaign_deliverables_type ON campaign_deliverables(type);

CREATE INDEX idx_campaign_tags_tag ON campaign_tags(tag);
CREATE INDEX idx_campaign_tags_campaign ON campaign_tags(campaign_id);





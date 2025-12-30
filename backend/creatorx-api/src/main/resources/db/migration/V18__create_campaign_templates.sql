CREATE TABLE IF NOT EXISTS campaign_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget NUMERIC(12,2) NOT NULL,
    platform VARCHAR(30) NOT NULL,
    category VARCHAR(100) NOT NULL,
    requirements TEXT,
    start_date DATE,
    end_date DATE,
    application_deadline DATE,
    max_applicants INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version BIGINT
);

CREATE TABLE IF NOT EXISTS campaign_template_deliverable_types (
    template_id UUID NOT NULL REFERENCES campaign_templates(id) ON DELETE CASCADE,
    deliverable_type VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS campaign_template_tags (
    template_id UUID NOT NULL REFERENCES campaign_templates(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS campaign_template_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES campaign_templates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(30) NOT NULL,
    due_date DATE,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    order_index INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version BIGINT
);

CREATE INDEX IF NOT EXISTS idx_campaign_templates_brand_id ON campaign_templates(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_platform ON campaign_templates(platform);
CREATE INDEX IF NOT EXISTS idx_campaign_templates_category ON campaign_templates(category);

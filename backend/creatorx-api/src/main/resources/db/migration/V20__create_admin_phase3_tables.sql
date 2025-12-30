-- Migration V20: Phase 3 admin dashboard tables

-- Moderation rule enums
CREATE TYPE moderation_rule_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE moderation_rule_severity AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- Campaign flag status
CREATE TYPE campaign_flag_status AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED');

-- GDPR request enums
CREATE TYPE gdpr_request_type AS ENUM ('EXPORT', 'DELETE');
CREATE TYPE gdpr_request_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- Account appeal status
CREATE TYPE appeal_status AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED');

-- Platform setting type
CREATE TYPE platform_setting_type AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

-- Moderation rules
CREATE TABLE moderation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    description TEXT,
    pattern TEXT NOT NULL,
    action VARCHAR(40) NOT NULL DEFAULT 'FLAG',
    severity moderation_rule_severity NOT NULL DEFAULT 'MEDIUM',
    status moderation_rule_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE moderation_rules IS 'Configurable content moderation rules for campaigns';

-- Campaign flags
CREATE TABLE campaign_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES moderation_rules(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status campaign_flag_status NOT NULL DEFAULT 'OPEN',
    flagged_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT
);

COMMENT ON TABLE campaign_flags IS 'Flags for campaigns requiring moderation review';

-- Dispute evidence
CREATE TABLE dispute_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE dispute_evidence IS 'Evidence files submitted for dispute resolution';

-- Account appeals
CREATE TABLE account_appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status appeal_status NOT NULL DEFAULT 'OPEN',
    resolution TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE account_appeals IS 'Appeals from suspended/banned users';

-- GDPR requests
CREATE TABLE gdpr_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_type gdpr_request_type NOT NULL,
    status gdpr_request_status NOT NULL DEFAULT 'PENDING',
    details_json JSONB DEFAULT '{}'::jsonb,
    export_url TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE gdpr_requests IS 'GDPR export/delete requests submitted by users';

-- Platform settings
CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(120) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    data_type platform_setting_type NOT NULL DEFAULT 'STRING',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE platform_settings IS 'Admin-configurable platform settings and feature flags';

-- Admin permissions
CREATE TABLE admin_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(120) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_admin_permission UNIQUE (admin_id, permission)
);

COMMENT ON TABLE admin_permissions IS 'Fine-grained admin permissions for admin RBAC';

-- Indexes
CREATE INDEX idx_moderation_rules_status ON moderation_rules(status);
CREATE INDEX idx_moderation_rules_severity ON moderation_rules(severity);

CREATE INDEX idx_campaign_flags_campaign_id ON campaign_flags(campaign_id);
CREATE INDEX idx_campaign_flags_status ON campaign_flags(status);
CREATE INDEX idx_campaign_flags_created_at ON campaign_flags(created_at DESC);

CREATE INDEX idx_dispute_evidence_dispute_id ON dispute_evidence(dispute_id);

CREATE INDEX idx_account_appeals_user_id ON account_appeals(user_id);
CREATE INDEX idx_account_appeals_status ON account_appeals(status);
CREATE INDEX idx_account_appeals_created_at ON account_appeals(created_at DESC);

CREATE INDEX idx_gdpr_requests_user_id ON gdpr_requests(user_id);
CREATE INDEX idx_gdpr_requests_status ON gdpr_requests(status);
CREATE INDEX idx_gdpr_requests_type ON gdpr_requests(request_type);
CREATE INDEX idx_gdpr_requests_created_at ON gdpr_requests(created_at DESC);

CREATE INDEX idx_platform_settings_key ON platform_settings(setting_key);

CREATE INDEX idx_admin_permissions_admin_id ON admin_permissions(admin_id);
CREATE INDEX idx_admin_permissions_permission ON admin_permissions(permission);

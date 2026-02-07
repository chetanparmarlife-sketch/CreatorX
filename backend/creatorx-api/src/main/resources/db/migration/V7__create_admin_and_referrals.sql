-- Migration V7: Create Admin Actions, Disputes, and Referrals tables

-- Admin Actions (audit log for admin operations)
CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action_type admin_action_type NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details_json JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    -- Note: Admin role validation is enforced at application layer
);

COMMENT ON TABLE admin_actions IS 'Audit log of all admin actions for compliance and debugging';
COMMENT ON COLUMN admin_actions.action_type IS 'Type of admin action performed';
COMMENT ON COLUMN admin_actions.entity_type IS 'Type of entity affected (USER, CAMPAIGN, etc.)';
COMMENT ON COLUMN admin_actions.entity_id IS 'ID of the affected entity';
COMMENT ON COLUMN admin_actions.details_json IS 'Additional action details in JSON format';
COMMENT ON COLUMN admin_actions.ip_address IS 'IP address from which action was performed';

-- Disputes (disputes between creators and brands)
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    brand_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    type dispute_type NOT NULL,
    description TEXT NOT NULL,
    status dispute_status NOT NULL DEFAULT 'OPEN',
    resolution TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_resolution_status CHECK (
        (status = 'RESOLVED' AND resolution IS NOT NULL AND resolved_by IS NOT NULL AND resolved_at IS NOT NULL) OR
        (status != 'RESOLVED')
    )
    -- Note: Resolver admin role validation is enforced at application layer
);

COMMENT ON TABLE disputes IS 'Disputes between creators and brands requiring admin intervention';
COMMENT ON COLUMN disputes.type IS 'Type of dispute: PAYMENT, DELIVERABLE, CAMPAIGN, etc.';
COMMENT ON COLUMN disputes.resolution IS 'Admin resolution text';
COMMENT ON COLUMN disputes.resolved_by IS 'Admin who resolved the dispute';

-- Referrals (referral program tracking)
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    referee_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status referral_status NOT NULL DEFAULT 'PENDING',
    reward_amount DECIMAL(10, 2) DEFAULT 0.00,
    referrer_reward DECIMAL(10, 2) DEFAULT 0.00,
    referee_reward DECIMAL(10, 2) DEFAULT 0.00,
    completed_criteria JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_unique_referral UNIQUE (referrer_id, referee_id),
    CONSTRAINT chk_referrer_referee_different CHECK (referrer_id != referee_id),
    CONSTRAINT chk_rewards_non_negative CHECK (
        reward_amount >= 0 AND
        referrer_reward >= 0 AND
        referee_reward >= 0
    ),
    CONSTRAINT chk_completed_status CHECK (
        (status = 'COMPLETED' AND completed_at IS NOT NULL) OR
        (status != 'COMPLETED')
    )
);

COMMENT ON TABLE referrals IS 'Referral program tracking and rewards';
COMMENT ON COLUMN referrals.referrer_id IS 'User who made the referral';
COMMENT ON COLUMN referrals.referee_id IS 'User who was referred';
COMMENT ON COLUMN referrals.reward_amount IS 'Total reward amount for this referral';
COMMENT ON COLUMN referrals.completed_criteria IS 'JSON criteria that was met for completion (e.g., first campaign completed)';

-- Indexes for admin and referral tables
CREATE INDEX idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_action_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_entity ON admin_actions(entity_type, entity_id);
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at DESC);

CREATE INDEX idx_disputes_campaign_id ON disputes(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_disputes_creator_id ON disputes(creator_id);
CREATE INDEX idx_disputes_brand_id ON disputes(brand_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_type ON disputes(type);
CREATE INDEX idx_disputes_created_at ON disputes(created_at DESC);
CREATE INDEX idx_disputes_open ON disputes(status) WHERE status = 'OPEN';

CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referee_id ON referrals(referee_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_created_at ON referrals(created_at);





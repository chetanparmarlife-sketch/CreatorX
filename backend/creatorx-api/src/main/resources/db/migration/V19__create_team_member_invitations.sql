CREATE TABLE IF NOT EXISTS team_member_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL,
    invited_at TIMESTAMP NOT NULL DEFAULT NOW(),
    accepted_at TIMESTAMP,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    version BIGINT
);

CREATE INDEX IF NOT EXISTS idx_team_member_invites_brand_id ON team_member_invitations(brand_id);
CREATE INDEX IF NOT EXISTS idx_team_member_invites_email ON team_member_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_member_invites_token ON team_member_invitations(token);

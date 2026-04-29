-- Adds a 7-day expiry to team member invitations.
-- Old invitations had no expiry, so invite links could remain usable indefinitely.
ALTER TABLE team_member_invitations
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

UPDATE team_member_invitations
SET expires_at = invited_at + INTERVAL '7 days'
WHERE expires_at IS NULL;

ALTER TABLE team_member_invitations
    ALTER COLUMN expires_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_team_member_invites_expires_at
    ON team_member_invitations(expires_at);

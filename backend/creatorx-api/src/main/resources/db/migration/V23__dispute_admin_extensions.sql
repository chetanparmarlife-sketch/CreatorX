-- Extend disputes for admin workflow
ALTER TABLE disputes
    ADD COLUMN IF NOT EXISTS assigned_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS next_action TEXT,
    ADD COLUMN IF NOT EXISTS resolution_type VARCHAR(80),
    ADD COLUMN IF NOT EXISTS sla_first_response_due_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS sla_resolution_due_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_disputes_assigned_admin ON disputes(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_disputes_sla_resolution_due ON disputes(sla_resolution_due_at);

-- Internal admin notes for disputes
CREATE TABLE IF NOT EXISTS dispute_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dispute_notes_dispute_id ON dispute_notes(dispute_id);

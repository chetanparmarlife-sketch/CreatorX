-- Compliance reports table for regulatory/legal documentation
CREATE TABLE IF NOT EXISTS compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(50) NOT NULL,
    region VARCHAR(50) NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    file_url TEXT,
    details_json JSONB DEFAULT '{}'::jsonb,
    generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    generated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_compliance_reports_type ON compliance_reports (report_type);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_region ON compliance_reports (region);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_status ON compliance_reports (status);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_created_at ON compliance_reports (created_at);

COMMENT ON TABLE compliance_reports IS 'Regulatory and compliance reports for legal requirements';

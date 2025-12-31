CREATE TABLE IF NOT EXISTS compliance_reports (
    id VARCHAR(255) PRIMARY KEY,
    report_type VARCHAR(50) NOT NULL,
    region VARCHAR(50) NOT NULL,
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    file_url TEXT,
    details_json JSONB,
    generated_by VARCHAR(255),
    generated_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    version BIGINT
);

CREATE INDEX IF NOT EXISTS idx_compliance_reports_type ON compliance_reports (report_type);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_region ON compliance_reports (region);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_status ON compliance_reports (status);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_created_at ON compliance_reports (created_at);

ALTER TABLE compliance_reports
    ADD CONSTRAINT fk_compliance_reports_generated_by
    FOREIGN KEY (generated_by) REFERENCES users(id);

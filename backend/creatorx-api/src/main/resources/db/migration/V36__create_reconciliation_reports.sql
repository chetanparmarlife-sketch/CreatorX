-- Migration: Create reconciliation_reports table
-- Purpose: Store daily reconciliation results for audit trail
-- Phase: Phase 4.2 - Reconciliation Engine

CREATE TABLE IF NOT EXISTS reconciliation_reports (
    id VARCHAR(36) PRIMARY KEY,

    -- Report period
    report_date DATE NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- daily, weekly, monthly, adhoc

    -- Summary totals
    total_payments_captured DECIMAL(15, 2) DEFAULT 0,
    total_payouts_processed DECIMAL(15, 2) DEFAULT 0,
    total_refunds_processed DECIMAL(15, 2) DEFAULT 0,

    -- Expected vs Actual balances
    expected_platform_balance DECIMAL(15, 2),
    actual_platform_balance DECIMAL(15, 2),
    platform_delta DECIMAL(15, 2) DEFAULT 0,

    expected_escrow_balance DECIMAL(15, 2),
    actual_escrow_balance DECIMAL(15, 2),
    escrow_delta DECIMAL(15, 2) DEFAULT 0,

    -- Transaction counts
    payment_count INTEGER DEFAULT 0,
    payout_count INTEGER DEFAULT 0,
    refund_count INTEGER DEFAULT 0,

    -- Mismatches found
    mismatch_count INTEGER DEFAULT 0,
    mismatches JSONB, -- Array of mismatch details

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    -- Statuses: pending, running, completed, failed, needs_review

    -- Alert flags
    has_discrepancy BOOLEAN DEFAULT FALSE,
    alert_sent BOOLEAN DEFAULT FALSE,
    alert_sent_at TIMESTAMP,

    -- Execution details
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration_ms INTEGER,
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint per day per type
    CONSTRAINT uq_reconciliation_date_type UNIQUE (report_date, report_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reconciliation_reports_date ON reconciliation_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_reconciliation_reports_status ON reconciliation_reports(status);
CREATE INDEX IF NOT EXISTS idx_reconciliation_reports_has_discrepancy ON reconciliation_reports(has_discrepancy);

-- Comments
COMMENT ON TABLE reconciliation_reports IS 'Daily reconciliation reports for financial audit (Phase 4.2)';
COMMENT ON COLUMN reconciliation_reports.platform_delta IS 'Difference between expected and actual platform balance (should be 0)';

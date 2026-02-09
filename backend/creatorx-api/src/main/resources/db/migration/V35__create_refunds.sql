-- Migration: Create refunds table
-- Purpose: Track Razorpay refunds for payment orders
-- Phase: Phase 4.2 - Razorpay Refund Integration

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Razorpay identifiers
    razorpay_refund_id VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100) NOT NULL,

    -- Relationships (UUID to match payment_orders.id and users.id)
    payment_order_id UUID REFERENCES payment_orders(id) ON DELETE SET NULL,
    initiated_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin who initiated

    -- Amount details
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',

    -- Status tracking
    status VARCHAR(50) NOT NULL DEFAULT 'created',
    -- Statuses: created, pending, processed, failed

    -- Refund details
    refund_type VARCHAR(50) DEFAULT 'normal', -- normal, instant
    speed VARCHAR(50), -- normal, optimum (from Razorpay response)

    -- Reason tracking
    reason VARCHAR(255),
    notes TEXT,

    -- Failure tracking
    failure_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,

    -- Webhook tracking
    webhook_received_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_refunds_payment_order_id ON refunds(payment_order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_razorpay_payment_id ON refunds(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON refunds(created_at);

-- Comments
COMMENT ON TABLE refunds IS 'Razorpay refunds for payment orders (Phase 4.2)';
COMMENT ON COLUMN refunds.status IS 'Refund status: created, pending, processed, failed';

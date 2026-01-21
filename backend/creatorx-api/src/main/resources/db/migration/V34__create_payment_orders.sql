-- Migration: Create payment_orders table
-- Purpose: Track Razorpay payment orders for brand deposits
-- Phase: Phase 4.2 - Brand Payment Collection

CREATE TABLE IF NOT EXISTS payment_orders (
    id VARCHAR(36) PRIMARY KEY,

    -- Razorpay identifiers
    razorpay_order_id VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100),

    -- Relationships
    brand_id VARCHAR(36) NOT NULL REFERENCES users(id),
    campaign_id VARCHAR(36) REFERENCES campaigns(id),

    -- Amount details (stored in smallest unit - paise)
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',

    -- Status tracking
    status VARCHAR(50) NOT NULL DEFAULT 'created',
    -- Statuses: created, authorized, captured, failed, refunded

    -- Payment metadata
    payment_method VARCHAR(50),
    bank VARCHAR(100),
    wallet VARCHAR(50),
    vpa VARCHAR(100), -- UPI VPA

    -- Failure tracking
    failure_reason TEXT,
    error_code VARCHAR(50),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    authorized_at TIMESTAMP,
    captured_at TIMESTAMP,

    -- Webhook tracking
    webhook_received_at TIMESTAMP,

    -- Idempotency
    idempotency_key VARCHAR(100),

    -- Notes/metadata
    notes JSONB
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_payment_orders_brand_id ON payment_orders(brand_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_campaign_id ON payment_orders(campaign_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_razorpay_order_id ON payment_orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_razorpay_payment_id ON payment_orders(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_created_at ON payment_orders(created_at);

-- Comments
COMMENT ON TABLE payment_orders IS 'Razorpay payment orders for brand deposits (Phase 4.2)';
COMMENT ON COLUMN payment_orders.status IS 'Order status: created, authorized, captured, failed, refunded';
COMMENT ON COLUMN payment_orders.amount IS 'Amount in INR (not paise) - converted on API calls';

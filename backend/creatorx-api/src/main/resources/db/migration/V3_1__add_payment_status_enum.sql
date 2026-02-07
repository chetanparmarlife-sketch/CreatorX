-- Migration V3.1: Add missing payment_status enum
-- This enum is required by V4_1 for active_campaigns table

CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED');

COMMENT ON TYPE payment_status IS 'Payment status for active campaigns: PENDING, PROCESSING, PAID, FAILED, REFUNDED';

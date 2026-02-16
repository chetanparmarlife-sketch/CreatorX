-- Migration V58: Add unique index on payment_orders.idempotency_key
-- Purpose: Enforce idempotency at the database level and enable efficient lookups
-- Fixes: Payment idempotency check was using findAll().stream() which loads entire table

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_orders_idempotency_key_unique
ON payment_orders(idempotency_key)
WHERE idempotency_key IS NOT NULL;

COMMENT ON INDEX idx_payment_orders_idempotency_key_unique IS 'Ensures unique idempotency keys for payment orders and enables fast lookups';

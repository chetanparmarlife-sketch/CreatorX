-- Migration V54: Create brand wallet system for escrow management
-- Purpose: Centralized brand wallet for campaign funding
-- Phase: Payment System v2 - Brand Wallet

-- Brand wallets (one per brand, holds escrow balance)
CREATE TABLE IF NOT EXISTS brand_wallets (
    brand_id VARCHAR(255) PRIMARY KEY,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_deposited DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_allocated DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_released DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_brand_wallets_brand FOREIGN KEY (brand_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_brand_wallet_balance_non_negative CHECK (balance >= 0),
    CONSTRAINT chk_brand_wallet_totals_non_negative CHECK (
        total_deposited >= 0 AND
        total_allocated >= 0 AND
        total_released >= 0
    ),
    CONSTRAINT chk_brand_wallet_balance_equals CHECK (
        balance = total_deposited - total_allocated
    ),
    CONSTRAINT chk_brand_wallet_released_lte_allocated CHECK (
        total_released <= total_allocated
    )
);

CREATE INDEX IF NOT EXISTS idx_brand_wallets_brand_id ON brand_wallets(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_wallets_balance ON brand_wallets(balance) WHERE balance > 0;

COMMENT ON TABLE brand_wallets IS 'Brand escrow wallets for campaign funding';
COMMENT ON COLUMN brand_wallets.balance IS 'Available balance to allocate to campaigns';
COMMENT ON COLUMN brand_wallets.total_deposited IS 'Lifetime total deposited via Razorpay';
COMMENT ON COLUMN brand_wallets.total_allocated IS 'Total currently allocated to active campaigns';
COMMENT ON COLUMN brand_wallets.total_released IS 'Total released to creators (includes platform fees)';

-- Escrow transactions (audit trail for all wallet movements)
CREATE TABLE IF NOT EXISTS escrow_transactions (
    id VARCHAR(255) PRIMARY KEY,
    brand_id VARCHAR(255) NOT NULL,
    campaign_id VARCHAR(255),
    payment_order_id VARCHAR(255),
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    balance_before DECIMAL(15, 2),
    balance_after DECIMAL(15, 2),
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_escrow_tx_brand FOREIGN KEY (brand_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_escrow_tx_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL,
    CONSTRAINT fk_escrow_tx_payment_order FOREIGN KEY (payment_order_id) REFERENCES payment_orders(id) ON DELETE SET NULL,
    CONSTRAINT chk_escrow_tx_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_escrow_tx_type CHECK (type IN ('DEPOSIT', 'ALLOCATION', 'RELEASE', 'REFUND'))
);

CREATE INDEX IF NOT EXISTS idx_escrow_tx_brand ON escrow_transactions(brand_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_tx_campaign ON escrow_transactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_escrow_tx_payment_order ON escrow_transactions(payment_order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_tx_type ON escrow_transactions(type);
CREATE INDEX IF NOT EXISTS idx_escrow_tx_created_at ON escrow_transactions(created_at DESC);

COMMENT ON TABLE escrow_transactions IS 'Audit trail for all brand wallet and escrow movements';
COMMENT ON COLUMN escrow_transactions.type IS 'Transaction type: DEPOSIT (add funds), ALLOCATION (assign to campaign), RELEASE (pay creator), REFUND (return unused)';
COMMENT ON COLUMN escrow_transactions.balance_before IS 'Wallet balance before transaction (null for campaign-level transactions)';
COMMENT ON COLUMN escrow_transactions.balance_after IS 'Wallet balance after transaction (null for campaign-level transactions)';

-- Add escrow tracking columns to campaigns
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS escrow_allocated DECIMAL(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS escrow_released DECIMAL(15, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS escrow_status VARCHAR(20) DEFAULT 'UNFUNDED';

-- Add constraints to campaigns escrow columns
ALTER TABLE campaigns
DROP CONSTRAINT IF EXISTS chk_campaign_escrow_allocated,
DROP CONSTRAINT IF EXISTS chk_campaign_escrow_released,
DROP CONSTRAINT IF EXISTS chk_campaign_escrow_status;

ALTER TABLE campaigns
ADD CONSTRAINT chk_campaign_escrow_allocated CHECK (escrow_allocated >= 0 AND escrow_allocated <= budget),
ADD CONSTRAINT chk_campaign_escrow_released CHECK (escrow_released >= 0 AND escrow_released <= escrow_allocated),
ADD CONSTRAINT chk_campaign_escrow_status CHECK (escrow_status IN ('UNFUNDED', 'PARTIAL', 'FUNDED', 'RELEASED', 'REFUNDED'));

CREATE INDEX IF NOT EXISTS idx_campaigns_escrow_status ON campaigns(escrow_status);

COMMENT ON COLUMN campaigns.escrow_allocated IS 'Amount allocated from brand wallet to this campaign';
COMMENT ON COLUMN campaigns.escrow_released IS 'Amount released from campaign to creators';
COMMENT ON COLUMN campaigns.escrow_status IS 'Funding status: UNFUNDED, PARTIAL, FUNDED, RELEASED, REFUNDED';
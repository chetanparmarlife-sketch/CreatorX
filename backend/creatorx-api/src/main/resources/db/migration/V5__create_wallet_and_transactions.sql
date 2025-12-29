-- Migration V5: Create Wallet and Transaction tables

-- Wallets (user wallet balances)
CREATE TABLE wallets (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    pending_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_earned DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_withdrawn DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    currency currency_type NOT NULL DEFAULT 'INR',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_balance_non_negative CHECK (balance >= 0),
    CONSTRAINT chk_pending_non_negative CHECK (pending_balance >= 0),
    CONSTRAINT chk_totals_non_negative CHECK (
        total_earned >= 0 AND 
        total_withdrawn >= 0 AND
        total_withdrawn <= total_earned
    )
);

COMMENT ON TABLE wallets IS 'User wallet balances and earnings summary';
COMMENT ON COLUMN wallets.balance IS 'Available balance for withdrawal';
COMMENT ON COLUMN wallets.pending_balance IS 'Pending earnings from active campaigns';
COMMENT ON COLUMN wallets.total_earned IS 'Lifetime total earnings';
COMMENT ON COLUMN wallets.total_withdrawn IS 'Total amount withdrawn';

-- Transactions (all financial transactions)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    type transaction_type NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status transaction_status NOT NULL DEFAULT 'PENDING',
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    razorpay_payment_id VARCHAR(255),
    razorpay_order_id VARCHAR(255),
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_razorpay_ids CHECK (
        (type = 'WITHDRAWAL' AND razorpay_payment_id IS NOT NULL) OR
        (type != 'WITHDRAWAL')
    )
);

COMMENT ON TABLE transactions IS 'All financial transactions: earnings, withdrawals, refunds';
COMMENT ON COLUMN transactions.type IS 'Type of transaction: EARNING, WITHDRAWAL, REFUND, etc.';
COMMENT ON COLUMN transactions.razorpay_payment_id IS 'Razorpay payment ID for withdrawals';
COMMENT ON COLUMN transactions.metadata IS 'Additional transaction metadata in JSON format';

-- Bank Accounts (user bank account details) - Created before withdrawal_requests due to FK dependency
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_holder_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(11) NOT NULL,
    upi_id VARCHAR(255),
    bank_name VARCHAR(255),
    branch_name VARCHAR(255),
    verified BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_ifsc_format CHECK (ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$'),
    CONSTRAINT chk_account_number CHECK (account_number ~ '^[0-9]{9,18}$')
);

COMMENT ON TABLE bank_accounts IS 'User bank account details for withdrawals';
COMMENT ON COLUMN bank_accounts.ifsc_code IS 'IFSC code for bank transfers';
COMMENT ON COLUMN bank_accounts.upi_id IS 'Optional UPI ID for instant transfers';
COMMENT ON COLUMN bank_accounts.verified IS 'Account verification status';
COMMENT ON COLUMN bank_accounts.is_default IS 'Default account for withdrawals';

-- Indexes for wallet and transaction tables
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_balance ON wallets(balance) WHERE balance > 0;

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_campaign_id ON transactions(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_user_type_status ON transactions(user_id, type, status);
CREATE INDEX idx_transactions_razorpay_payment_id ON transactions(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;

CREATE INDEX idx_bank_accounts_user_id ON bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_verified ON bank_accounts(verified);
CREATE INDEX idx_bank_accounts_default ON bank_accounts(user_id, is_default) WHERE is_default = TRUE;

-- Withdrawal Requests (created after bank_accounts due to FK dependency)
CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL,
    bank_account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE RESTRICT,
    status withdrawal_status NOT NULL DEFAULT 'PENDING',
    razorpay_payout_id VARCHAR(255),
    failure_reason TEXT,
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_processed_status CHECK (
        (status IN ('PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED') AND processed_at IS NOT NULL) OR
        (status = 'PENDING')
    )
);

COMMENT ON TABLE withdrawal_requests IS 'User withdrawal requests to bank accounts';
COMMENT ON COLUMN withdrawal_requests.razorpay_payout_id IS 'Razorpay payout ID for tracking';
COMMENT ON COLUMN withdrawal_requests.processed_by IS 'Admin who processed the withdrawal';

-- Indexes for withdrawal_requests
CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_withdrawal_requests_requested_at ON withdrawal_requests(requested_at);
CREATE INDEX idx_withdrawal_requests_bank_account ON withdrawal_requests(bank_account_id);


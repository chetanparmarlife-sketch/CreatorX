-- Migration V48: Safely restore columns deleted by V46
-- V46 dropped enum types with CASCADE which deleted all enum columns
-- This migration only restores columns for tables that actually exist

-- Restore withdrawal_requests.status
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'withdrawal_requests')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'withdrawal_requests' AND column_name = 'status')
    THEN
        ALTER TABLE withdrawal_requests ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored withdrawal_requests.status';
    END IF;
END $$;

-- Restore users.role
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role')
    THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'CREATOR';
        RAISE NOTICE 'Restored users.role';
    END IF;
END $$;

-- Restore users.status
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status')
    THEN
        ALTER TABLE users ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';
        RAISE NOTICE 'Restored users.status';
    END IF;
END $$;

-- Restore social_accounts.platform
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'social_accounts')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_accounts' AND column_name = 'platform')
    THEN
        ALTER TABLE social_accounts ADD COLUMN platform VARCHAR(50) NOT NULL DEFAULT 'INSTAGRAM';
        RAISE NOTICE 'Restored social_accounts.platform';
    END IF;
END $$;

-- Restore campaigns.status
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaigns')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'status')
    THEN
        ALTER TABLE campaigns ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'DRAFT';
        RAISE NOTICE 'Restored campaigns.status';
    END IF;
END $$;

-- Restore applications.status
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'applications')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'status')
    THEN
        ALTER TABLE applications ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored applications.status';
    END IF;
END $$;

-- Restore deliverables.status
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deliverables')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deliverables' AND column_name = 'status')
    THEN
        ALTER TABLE deliverables ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored deliverables.status';
    END IF;
END $$;

-- Restore deliverables.type
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deliverables')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deliverables' AND column_name = 'type')
    THEN
        ALTER TABLE deliverables ADD COLUMN type VARCHAR(50);
        RAISE NOTICE 'Restored deliverables.type';
    END IF;
END $$;

-- Restore payment_orders.status
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_orders')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_orders' AND column_name = 'status')
    THEN
        ALTER TABLE payment_orders ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'CREATED';
        RAISE NOTICE 'Restored payment_orders.status';
    END IF;
END $$;

-- Restore transactions.type
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'type')
    THEN
        ALTER TABLE transactions ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'CREDIT';
        RAISE NOTICE 'Restored transactions.type';
    END IF;
END $$;

-- Restore disputes.status
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'disputes')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disputes' AND column_name = 'status')
    THEN
        ALTER TABLE disputes ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored disputes.status';
    END IF;
END $$;

-- Restore refunds.status
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'refunds')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'refunds' AND column_name = 'status')
    THEN
        ALTER TABLE refunds ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored refunds.status';
    END IF;
END $$;

-- Restore kyc_documents.status
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kyc_documents')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kyc_documents' AND column_name = 'status')
    THEN
        ALTER TABLE kyc_documents ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored kyc_documents.status';
    END IF;
END $$;

-- Restore notifications.type
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'type')
    THEN
        ALTER TABLE notifications ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'INFO';
        RAISE NOTICE 'Restored notifications.type';
    END IF;
END $$;

-- Restore account_appeals.status
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'account_appeals')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'account_appeals' AND column_name = 'status')
    THEN
        ALTER TABLE account_appeals ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored account_appeals.status';
    END IF;
END $$;

-- Restore campaign_flags.status
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_flags')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaign_flags' AND column_name = 'status')
    THEN
        ALTER TABLE campaign_flags ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored campaign_flags.status';
    END IF;
END $$;

-- Restore gdpr_requests.type
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gdpr_requests')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gdpr_requests' AND column_name = 'type')
    THEN
        ALTER TABLE gdpr_requests ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'ACCESS';
        RAISE NOTICE 'Restored gdpr_requests.type';
    END IF;
END $$;

-- Restore gdpr_requests.status
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gdpr_requests')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gdpr_requests' AND column_name = 'status')
    THEN
        ALTER TABLE gdpr_requests ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored gdpr_requests.status';
    END IF;
END $$;

-- Restore platform_settings.type
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_settings')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'platform_settings' AND column_name = 'type')
    THEN
        ALTER TABLE platform_settings ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'STRING';
        RAISE NOTICE 'Restored platform_settings.type';
    END IF;
END $$;

-- Restore admin_actions.action_type
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_actions')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_actions' AND column_name = 'action_type')
    THEN
        ALTER TABLE admin_actions ADD COLUMN action_type VARCHAR(50) NOT NULL DEFAULT 'OTHER';
        RAISE NOTICE 'Restored admin_actions.action_type';
    END IF;
END $$;

-- Restore fcm_tokens.platform
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fcm_tokens')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fcm_tokens' AND column_name = 'platform')
    THEN
        ALTER TABLE fcm_tokens ADD COLUMN platform VARCHAR(50) NOT NULL DEFAULT 'ANDROID';
        RAISE NOTICE 'Restored fcm_tokens.platform';
    END IF;
END $$;

-- Restore deliverable_reviews.status
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deliverable_reviews')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'deliverable_reviews' AND column_name = 'status')
    THEN
        ALTER TABLE deliverable_reviews ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored deliverable_reviews.status';
    END IF;
END $$;

-- Restore wallets columns if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wallets')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'wallets' AND column_name = 'status')
    THEN
        ALTER TABLE wallets ADD COLUMN status VARCHAR(50) DEFAULT 'ACTIVE';
        RAISE NOTICE 'Restored wallets.status';
    END IF;
END $$;

-- Restore referrals.status
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'referrals')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'referrals' AND column_name = 'status')
    THEN
        ALTER TABLE referrals ADD COLUMN status VARCHAR(50) DEFAULT 'PENDING';
        RAISE NOTICE 'Restored referrals.status';
    END IF;
END $$;

-- Final verification
DO $$
DECLARE
    users_has_role BOOLEAN;
    users_has_status BOOLEAN;
    withdrawals_has_status BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'role'
    ) INTO users_has_role;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'status'
    ) INTO users_has_status;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'withdrawal_requests' AND column_name = 'status'
    ) INTO withdrawals_has_status;

    IF users_has_role AND users_has_status AND withdrawals_has_status THEN
        RAISE NOTICE '✓ Critical columns restored successfully - users.role, users.status, withdrawal_requests.status';
    ELSE
        RAISE WARNING 'Missing critical columns - users.role: %, users.status: %, withdrawal_requests.status: %',
            users_has_role, users_has_status, withdrawals_has_status;
    END IF;
END $$;

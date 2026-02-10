-- Migration V47: Restore columns that were accidentally deleted by V46
-- V46 dropped enum types with CASCADE, which deleted all columns using those types
-- This migration recreates those columns as VARCHAR(50)

-- Restore withdrawal_requests.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'withdrawal_requests' AND column_name = 'status'
    ) THEN
        ALTER TABLE withdrawal_requests ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored withdrawal_requests.status';
    END IF;
END $$;

-- Restore users.role
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'CREATOR';
        RAISE NOTICE 'Restored users.role';
    END IF;
END $$;

-- Restore users.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'status'
    ) THEN
        ALTER TABLE users ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';
        RAISE NOTICE 'Restored users.status';
    END IF;
END $$;

-- Restore social_accounts.platform
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'social_accounts' AND column_name = 'platform'
    ) THEN
        ALTER TABLE social_accounts ADD COLUMN platform VARCHAR(50) NOT NULL DEFAULT 'INSTAGRAM';
        RAISE NOTICE 'Restored social_accounts.platform';
    END IF;
END $$;

-- Restore campaigns.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaigns' AND column_name = 'status'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'DRAFT';
        RAISE NOTICE 'Restored campaigns.status';
    END IF;
END $$;

-- Restore applications.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'applications' AND column_name = 'status'
    ) THEN
        ALTER TABLE applications ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored applications.status';
    END IF;
END $$;

-- Restore deliverables.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'deliverables' AND column_name = 'status'
    ) THEN
        ALTER TABLE deliverables ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored deliverables.status';
    END IF;
END $$;

-- Restore deliverables.type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'deliverables' AND column_name = 'type'
    ) THEN
        ALTER TABLE deliverables ADD COLUMN type VARCHAR(50);
        RAISE NOTICE 'Restored deliverables.type';
    END IF;
END $$;

-- Restore payment_orders.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payment_orders' AND column_name = 'status'
    ) THEN
        ALTER TABLE payment_orders ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'CREATED';
        RAISE NOTICE 'Restored payment_orders.status';
    END IF;
END $$;

-- Restore transactions.type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'transactions' AND column_name = 'type'
    ) THEN
        ALTER TABLE transactions ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'CREDIT';
        RAISE NOTICE 'Restored transactions.type';
    END IF;
END $$;

-- Restore disputes.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'disputes' AND column_name = 'status'
    ) THEN
        ALTER TABLE disputes ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored disputes.status';
    END IF;
END $$;

-- Restore refunds.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'refunds' AND column_name = 'status'
    ) THEN
        ALTER TABLE refunds ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored refunds.status';
    END IF;
END $$;

-- Restore kyc_documents.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'kyc_documents' AND column_name = 'status'
    ) THEN
        ALTER TABLE kyc_documents ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored kyc_documents.status';
    END IF;
END $$;

-- Restore notifications.type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'type'
    ) THEN
        ALTER TABLE notifications ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'INFO';
        RAISE NOTICE 'Restored notifications.type';
    END IF;
END $$;

-- Restore account_appeals.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'account_appeals' AND column_name = 'status'
    ) THEN
        ALTER TABLE account_appeals ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored account_appeals.status';
    END IF;
END $$;

-- Restore campaign_flags.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'campaign_flags' AND column_name = 'status'
    ) THEN
        ALTER TABLE campaign_flags ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored campaign_flags.status';
    END IF;
END $$;

-- Restore gdpr_requests.type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gdpr_requests' AND column_name = 'type'
    ) THEN
        ALTER TABLE gdpr_requests ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'ACCESS';
        RAISE NOTICE 'Restored gdpr_requests.type';
    END IF;
END $$;

-- Restore gdpr_requests.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'gdpr_requests' AND column_name = 'status'
    ) THEN
        ALTER TABLE gdpr_requests ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored gdpr_requests.status';
    END IF;
END $$;

-- Restore invoices.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'status'
    ) THEN
        ALTER TABLE invoices ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'DRAFT';
        RAISE NOTICE 'Restored invoices.status';
    END IF;
END $$;

-- Restore compliance_reports.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'compliance_reports' AND column_name = 'status'
    ) THEN
        ALTER TABLE compliance_reports ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored compliance_reports.status';
    END IF;
END $$;

-- Restore platform_settings.type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'platform_settings' AND column_name = 'type'
    ) THEN
        ALTER TABLE platform_settings ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'STRING';
        RAISE NOTICE 'Restored platform_settings.type';
    END IF;
END $$;

-- Restore admin_actions.action_type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'admin_actions' AND column_name = 'action_type'
    ) THEN
        ALTER TABLE admin_actions ADD COLUMN action_type VARCHAR(50) NOT NULL DEFAULT 'OTHER';
        RAISE NOTICE 'Restored admin_actions.action_type';
    END IF;
END $$;

-- Restore fcm_tokens.platform
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'fcm_tokens' AND column_name = 'platform'
    ) THEN
        ALTER TABLE fcm_tokens ADD COLUMN platform VARCHAR(50) NOT NULL DEFAULT 'ANDROID';
        RAISE NOTICE 'Restored fcm_tokens.platform';
    END IF;
END $$;

-- Restore deliverable_reviews.status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'deliverable_reviews' AND column_name = 'status'
    ) THEN
        ALTER TABLE deliverable_reviews ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
        RAISE NOTICE 'Restored deliverable_reviews.status';
    END IF;
END $$;

-- Restore campaign_applications.status (if different from applications)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_applications') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'campaign_applications' AND column_name = 'status'
        ) THEN
            ALTER TABLE campaign_applications ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
            RAISE NOTICE 'Restored campaign_applications.status';
        END IF;
    END IF;
END $$;

-- Restore deliverable_submissions.status (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deliverable_submissions') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'deliverable_submissions' AND column_name = 'status'
        ) THEN
            ALTER TABLE deliverable_submissions ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'PENDING';
            RAISE NOTICE 'Restored deliverable_submissions.status';
        END IF;
    END IF;
END $$;

-- Restore active_campaigns.status (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'active_campaigns') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'active_campaigns' AND column_name = 'status'
        ) THEN
            ALTER TABLE active_campaigns ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE';
            RAISE NOTICE 'Restored active_campaigns.status';
        END IF;
    END IF;
END $$;

-- Final verification
DO $$
DECLARE
    missing_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO missing_count
    FROM (
        SELECT 'withdrawal_requests' as tbl, 'status' as col
        UNION ALL SELECT 'users', 'role'
        UNION ALL SELECT 'users', 'status'
        UNION ALL SELECT 'campaigns', 'status'
        UNION ALL SELECT 'applications', 'status'
    ) expected
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.columns c
        WHERE c.table_name = expected.tbl AND c.column_name = expected.col
    );

    IF missing_count > 0 THEN
        RAISE WARNING 'Still have % critical columns missing!', missing_count;
    ELSE
        RAISE NOTICE 'All critical enum columns have been restored as VARCHAR(50)';
    END IF;
END $$;

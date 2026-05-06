-- Migration V1.1: Ensure base ENUM types exist after Flyway baseline.
--
-- Some managed databases are not empty because provider-owned objects already
-- exist, so Flyway's baseline-on-migrate can mark version 1 as applied without
-- executing V1__create_enums.sql. V2 depends on these enum types, so this
-- idempotently creates the V1 enums when they are missing.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('CREATOR', 'BRAND', 'ADMIN');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
        CREATE TYPE document_type AS ENUM ('AADHAAR', 'PAN', 'GST', 'PASSPORT', 'DRIVING_LICENSE');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
        CREATE TYPE document_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_platform') THEN
        CREATE TYPE campaign_platform AS ENUM ('INSTAGRAM', 'YOUTUBE', 'TWITTER', 'FACEBOOK', 'LINKEDIN', 'TIKTOK');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
        CREATE TYPE campaign_status AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deliverable_type') THEN
        CREATE TYPE deliverable_type AS ENUM ('IMAGE', 'VIDEO', 'STORY', 'REEL', 'POST', 'THUMBNAIL', 'CAPTION');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
        CREATE TYPE application_status AS ENUM ('APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'WITHDRAWN');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_status') THEN
        CREATE TYPE submission_status AS ENUM ('PENDING', 'APPROVED', 'REVISION_REQUESTED', 'REJECTED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deliverable_status') THEN
        CREATE TYPE deliverable_status AS ENUM (
            'PENDING',
            'SUBMITTED',
            'REVISION',
            'APPROVED',
            'REJECTED',
            'DRAFT_SUBMITTED',
            'BRAND_REVIEWING',
            'CHANGES_REQUESTED',
            'POSTED'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        CREATE TYPE transaction_type AS ENUM ('EARNING', 'WITHDRAWAL', 'REFUND', 'BONUS', 'PENALTY');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
        CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'withdrawal_status') THEN
        CREATE TYPE withdrawal_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        CREATE TYPE notification_type AS ENUM (
            'CAMPAIGN_APPLICATION',
            'CAMPAIGN_SELECTED',
            'CAMPAIGN_REJECTED',
            'DELIVERABLE_SUBMITTED',
            'DELIVERABLE_APPROVED',
            'DELIVERABLE_REVISION',
            'PAYMENT_RECEIVED',
            'WITHDRAWAL_PROCESSED',
            'KYC_APPROVED',
            'KYC_REJECTED',
            'MESSAGE_RECEIVED',
            'SYSTEM_ANNOUNCEMENT'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispute_status') THEN
        CREATE TYPE dispute_status AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dispute_type') THEN
        CREATE TYPE dispute_type AS ENUM ('PAYMENT', 'DELIVERABLE', 'CAMPAIGN', 'OTHER');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_action_type') THEN
        CREATE TYPE admin_action_type AS ENUM (
            'USER_SUSPENDED',
            'USER_ACTIVATED',
            'CAMPAIGN_APPROVED',
            'CAMPAIGN_REJECTED',
            'KYC_APPROVED',
            'KYC_REJECTED',
            'DISPUTE_RESOLVED',
            'PAYMENT_PROCESSED',
            'SYSTEM_UPDATE'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'referral_status') THEN
        CREATE TYPE referral_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'currency_type') THEN
        CREATE TYPE currency_type AS ENUM ('INR', 'USD', 'EUR');
    END IF;
END $$;

COMMENT ON TYPE user_role IS 'User role in the platform: CREATOR, BRAND, or ADMIN';
COMMENT ON TYPE user_status IS 'Account status: ACTIVE, INACTIVE, SUSPENDED, or DELETED';
COMMENT ON TYPE campaign_status IS 'Campaign lifecycle status';
COMMENT ON TYPE application_status IS 'Application workflow status';
COMMENT ON TYPE transaction_type IS 'Type of financial transaction';

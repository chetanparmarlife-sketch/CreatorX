-- CreatorX Database Schema
-- Migration V1: Create ENUM types

-- User roles
CREATE TYPE user_role AS ENUM ('CREATOR', 'BRAND', 'ADMIN');

-- User status
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED');

-- Document types for KYC
CREATE TYPE document_type AS ENUM ('AADHAAR', 'PAN', 'GST', 'PASSPORT', 'DRIVING_LICENSE');

-- Document verification status
CREATE TYPE document_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- Campaign platforms
CREATE TYPE campaign_platform AS ENUM ('INSTAGRAM', 'YOUTUBE', 'TWITTER', 'FACEBOOK', 'LINKEDIN', 'TIKTOK');

-- Campaign status
CREATE TYPE campaign_status AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- Deliverable types
CREATE TYPE deliverable_type AS ENUM ('IMAGE', 'VIDEO', 'STORY', 'REEL', 'POST', 'THUMBNAIL', 'CAPTION');

-- Application status
CREATE TYPE application_status AS ENUM ('APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'WITHDRAWN');

-- Submission status
CREATE TYPE submission_status AS ENUM ('PENDING', 'APPROVED', 'REVISION_REQUESTED', 'REJECTED');

-- Deliverable status
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

-- Transaction types
CREATE TYPE transaction_type AS ENUM ('EARNING', 'WITHDRAWAL', 'REFUND', 'BONUS', 'PENALTY');

-- Transaction status
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- Withdrawal request status
CREATE TYPE withdrawal_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED');

-- Notification types
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

-- Dispute status
CREATE TYPE dispute_status AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED');

-- Dispute type
CREATE TYPE dispute_type AS ENUM ('PAYMENT', 'DELIVERABLE', 'CAMPAIGN', 'OTHER');

-- Admin action types
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

-- Referral status
CREATE TYPE referral_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- Currency
CREATE TYPE currency_type AS ENUM ('INR', 'USD', 'EUR');

COMMENT ON TYPE user_role IS 'User role in the platform: CREATOR, BRAND, or ADMIN';
COMMENT ON TYPE user_status IS 'Account status: ACTIVE, INACTIVE, SUSPENDED, or DELETED';
COMMENT ON TYPE campaign_status IS 'Campaign lifecycle status';
COMMENT ON TYPE application_status IS 'Application workflow status';
COMMENT ON TYPE transaction_type IS 'Type of financial transaction';


-- Migration V59: Add onboarding_status to brand_profiles
-- Tracks brand onboarding lifecycle: DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED/REJECTED

ALTER TABLE brand_profiles
ADD COLUMN IF NOT EXISTS onboarding_status VARCHAR(20) NOT NULL DEFAULT 'DRAFT';

-- Backfill: verified brands are already approved, unverified stay DRAFT
UPDATE brand_profiles SET onboarding_status = 'APPROVED' WHERE verified = true;
UPDATE brand_profiles SET onboarding_status = 'DRAFT' WHERE verified = false;

CREATE INDEX IF NOT EXISTS idx_brand_profiles_onboarding_status ON brand_profiles(onboarding_status);

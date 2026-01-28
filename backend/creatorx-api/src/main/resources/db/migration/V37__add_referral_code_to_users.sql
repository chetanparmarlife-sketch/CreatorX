-- Add referral_code column to users table for efficient referral lookups
-- This avoids the O(n) lookup that was loading all users to find a referral code

-- Add the column
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20);

-- Create unique index for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code) WHERE referral_code IS NOT NULL;

-- Populate existing users with their referral codes
-- The code is generated as: 'CX' + first 8 chars of Base64(user_id)
-- Note: PostgreSQL's encode() returns lowercase, so we uppercase it
UPDATE users
SET referral_code = 'CX' || UPPER(SUBSTRING(encode(id::bytea, 'base64'), 1, 8))
WHERE referral_code IS NULL;

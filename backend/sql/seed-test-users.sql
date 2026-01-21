-- ============================================================
-- CreatorX Test Users Seed Script
-- ============================================================
-- 
-- This script creates test user accounts for development/testing:
--   - brand@test.com    (BRAND role)    - For Brand Dashboard
--   - admin@test.com    (ADMIN role)    - For Admin Dashboard  
--   - creator@test.com  (CREATOR role)  - For Mobile App
--
-- Password for all users: password123
-- BCrypt hash (strength 10): $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
--
-- Run with: psql -h <host> -d <database> -U <user> -f seed-test-users.sql
-- Or paste into Supabase SQL Editor
-- ============================================================

-- Start transaction for atomic execution
BEGIN;

-- ============================================================
-- 1. DEFINE TEST USER UUIDs (fixed for consistency)
-- ============================================================
DO $$
DECLARE
    creator_user_id UUID := 'a1b2c3d4-e5f6-4789-abcd-111111111111';
    brand_user_id   UUID := 'a1b2c3d4-e5f6-4789-abcd-222222222222';
    admin_user_id   UUID := 'a1b2c3d4-e5f6-4789-abcd-333333333333';
    bcrypt_password VARCHAR := '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    now_ts TIMESTAMP WITH TIME ZONE := NOW();
BEGIN

-- ============================================================
-- 2. INSERT TEST USERS
-- ============================================================

-- Delete existing test users (if re-running script)
DELETE FROM users WHERE email IN ('creator@test.com', 'brand@test.com', 'admin@test.com');

-- Creator User
INSERT INTO users (id, email, password_hash, role, status, email_verified, created_at, updated_at)
VALUES (
    creator_user_id,
    'creator@test.com',
    bcrypt_password,
    'CREATOR',
    'ACTIVE',
    true,
    now_ts,
    now_ts
);

-- Brand User
INSERT INTO users (id, email, password_hash, role, status, email_verified, created_at, updated_at)
VALUES (
    brand_user_id,
    'brand@test.com',
    bcrypt_password,
    'BRAND',
    'ACTIVE',
    true,
    now_ts,
    now_ts
);

-- Admin User
INSERT INTO users (id, email, password_hash, role, status, email_verified, created_at, updated_at)
VALUES (
    admin_user_id,
    'admin@test.com',
    bcrypt_password,
    'ADMIN',
    'ACTIVE',
    true,
    now_ts,
    now_ts
);

-- ============================================================
-- 3. INSERT USER PROFILES
-- ============================================================

-- Delete existing profiles (if re-running)
DELETE FROM user_profiles WHERE user_id IN (creator_user_id, brand_user_id, admin_user_id);

-- Creator Profile
INSERT INTO user_profiles (id, user_id, full_name, bio, location, avatar_url, phone, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    creator_user_id,
    'Test Creator',
    'A test creator account for development and testing purposes.',
    'Mumbai, India',
    NULL,
    '+91 9876543210',
    now_ts,
    now_ts
);

-- Brand Profile
INSERT INTO user_profiles (id, user_id, full_name, bio, location, avatar_url, phone, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    brand_user_id,
    'Test Brand Manager',
    'Brand manager account for testing the brand dashboard.',
    'Bangalore, India',
    NULL,
    '+91 9876543211',
    now_ts,
    now_ts
);

-- Admin Profile
INSERT INTO user_profiles (id, user_id, full_name, bio, location, avatar_url, phone, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    admin_user_id,
    'Test Admin',
    'Administrator account for platform management.',
    'Delhi, India',
    NULL,
    '+91 9876543212',
    now_ts,
    now_ts
);

-- ============================================================
-- 4. INSERT CREATOR PROFILE (for creator user)
-- ============================================================

-- Delete existing creator profile
DELETE FROM creator_profiles WHERE user_id = creator_user_id;

INSERT INTO creator_profiles (
    id, 
    user_id, 
    username,
    category, 
    follower_count, 
    engagement_rate,
    instagram_url,
    youtube_url,
    bio,
    created_at, 
    updated_at
)
VALUES (
    gen_random_uuid(),
    creator_user_id,
    'testcreator',
    'Lifestyle',
    50000,
    4.5,
    'https://instagram.com/testcreator',
    'https://youtube.com/@testcreator',
    'Lifestyle content creator focused on travel and tech.',
    now_ts,
    now_ts
);

-- ============================================================
-- 5. INSERT BRAND PROFILE (for brand user)
-- ============================================================

-- Delete existing brand profile
DELETE FROM brand_profiles WHERE user_id = brand_user_id;

INSERT INTO brand_profiles (
    id,
    user_id,
    company_name,
    industry,
    website_url,
    description,
    logo_url,
    verified,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    brand_user_id,
    'Test Brand Inc.',
    'Technology',
    'https://testbrand.example.com',
    'A test brand for development and testing of the CreatorX platform.',
    NULL,
    true,
    now_ts,
    now_ts
);

-- ============================================================
-- 6. INSERT WALLET FOR CREATOR (for wallet testing)
-- ============================================================

-- Delete existing wallet
DELETE FROM wallets WHERE user_id = creator_user_id;

INSERT INTO wallets (id, user_id, balance, available_balance, pending_balance, currency, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    creator_user_id,
    50000.00,
    45000.00,
    5000.00,
    'INR',
    now_ts,
    now_ts
);

-- ============================================================
-- 7. INSERT BANK ACCOUNT FOR CREATOR (for withdrawal testing)
-- ============================================================

-- Delete existing bank accounts
DELETE FROM bank_accounts WHERE user_id = creator_user_id;

INSERT INTO bank_accounts (
    id,
    user_id,
    account_number,
    account_holder_name,
    bank_name,
    ifsc_code,
    verified,
    is_primary,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    creator_user_id,
    'XXXX1234',
    'Test Creator',
    'HDFC Bank',
    'HDFC0001234',
    true,
    true,
    now_ts,
    now_ts
);

END $$;

-- Commit transaction
COMMIT;

-- ============================================================
-- 8. VERIFICATION QUERIES
-- ============================================================

-- Verify users created
SELECT 
    id,
    email,
    role,
    status,
    email_verified,
    created_at
FROM users 
WHERE email IN ('creator@test.com', 'brand@test.com', 'admin@test.com')
ORDER BY role;

-- Verify profiles created
SELECT 
    up.full_name,
    u.email,
    u.role
FROM user_profiles up
JOIN users u ON up.user_id = u.id
WHERE u.email IN ('creator@test.com', 'brand@test.com', 'admin@test.com');

-- Verify creator profile
SELECT 
    cp.username,
    cp.category,
    cp.follower_count,
    u.email
FROM creator_profiles cp
JOIN users u ON cp.user_id = u.id
WHERE u.email = 'creator@test.com';

-- Verify brand profile
SELECT 
    bp.company_name,
    bp.industry,
    bp.verified,
    u.email
FROM brand_profiles bp
JOIN users u ON bp.user_id = u.id
WHERE u.email = 'brand@test.com';

-- Verify wallet
SELECT 
    w.balance,
    w.available_balance,
    w.currency,
    u.email
FROM wallets w
JOIN users u ON w.user_id = u.id
WHERE u.email = 'creator@test.com';

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
SELECT '✅ Test users created successfully!' AS status;

-- ============================================================
-- Fix Admin User for Direct Login
-- ============================================================
--
-- This script updates an existing user to enable direct login
-- for the admin dashboard with password authentication.
--
-- Email: chetanparmarlife@gmail.com
-- Password: password123
-- BCrypt hash (strength 10): $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
--
-- Run this in Supabase SQL Editor
-- ============================================================

BEGIN;

-- Update the user to have:
-- 1. ADMIN role
-- 2. BCrypt password hash for direct login
-- 3. ACTIVE status
-- 4. Email verified
UPDATE users
SET
    role = 'ADMIN',
    password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    status = 'ACTIVE',
    email_verified = true,
    updated_at = NOW()
WHERE email = 'chetanparmarlife@gmail.com';

-- Verify the update
SELECT
    id,
    email,
    role,
    status,
    CASE
        WHEN password_hash = 'supabase_managed' THEN 'supabase_managed (OAuth only)'
        WHEN password_hash IS NULL THEN 'NULL (no password set)'
        WHEN password_hash LIKE '$2a$%' THEN 'BCrypt hash (direct login enabled)'
        ELSE 'Unknown format'
    END as password_status,
    email_verified,
    created_at
FROM users
WHERE email = 'chetanparmarlife@gmail.com';

COMMIT;

-- ============================================================
-- Instructions:
-- ============================================================
-- After running this script, you can login to the admin dashboard with:
-- Email: chetanparmarlife@gmail.com
-- Password: password123
--
-- IMPORTANT: Change your password after first login!
-- ============================================================

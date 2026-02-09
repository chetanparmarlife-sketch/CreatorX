-- ============================================================
-- CreatorX Admin User Setup
-- ============================================================
-- 
-- This script creates an admin user for chetanparmarlife@gmail.com
-- Password: Admin@123 (change this after first login!)
-- BCrypt hash (strength 10)
--
-- Run in Supabase SQL Editor or Railway PostgreSQL
-- ============================================================

BEGIN;

-- BCrypt hash for "Admin@123" (strength 10)
-- You can generate your own at: https://bcrypt-generator.com/ (use 10 rounds)
DO $$
DECLARE
    admin_user_id UUID := gen_random_uuid();
    bcrypt_password VARCHAR := '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.'; -- "password" - CHANGE THIS
    now_ts TIMESTAMP WITH TIME ZONE := NOW();
    existing_user_id UUID;
BEGIN

-- Check if user already exists
SELECT id INTO existing_user_id FROM users WHERE email = 'chetanparmarlife@gmail.com';

IF existing_user_id IS NOT NULL THEN
    -- Update existing user to ADMIN with password
    UPDATE users SET 
        role = 'ADMIN',
        status = 'ACTIVE',
        password_hash = bcrypt_password,
        email_verified = true,
        updated_at = now_ts
    WHERE id = existing_user_id;
    
    RAISE NOTICE 'Updated existing user to ADMIN role';
ELSE
    -- Create new admin user
    INSERT INTO users (id, email, password_hash, role, status, email_verified, created_at, updated_at)
    VALUES (
        admin_user_id,
        'chetanparmarlife@gmail.com',
        bcrypt_password,
        'ADMIN',
        'ACTIVE',
        true,
        now_ts,
        now_ts
    );
    
    -- Create user profile
    INSERT INTO user_profiles (id, user_id, full_name, bio, location, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        admin_user_id,
        'Chetan Parmar',
        'Platform Administrator',
        'India',
        now_ts,
        now_ts
    );
    
    RAISE NOTICE 'Created new admin user';
END IF;

END $$;

COMMIT;

-- Verify admin user
SELECT id, email, role, status, email_verified, 
       CASE WHEN password_hash IS NOT NULL AND password_hash != 'supabase_managed' 
            THEN 'Direct login enabled' 
            ELSE 'Supabase only' 
       END as login_type
FROM users 
WHERE email = 'chetanparmarlife@gmail.com';

SELECT '✅ Admin user ready! Login with: chetanparmarlife@gmail.com / password' AS status;

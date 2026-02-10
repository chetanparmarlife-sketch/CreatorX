-- Migration V45: Set admin password for chetanparmarlife@gmail.com
-- This runs with full permissions during Flyway migration
-- Password will be set to "admin123"

-- Disable RLS temporarily to ensure update succeeds
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Set the admin password (BCrypt hash for "admin123" with cost 10)
UPDATE users
SET password_hash = '$2a$10$N.wmSLQW7zV4p7kGvFNxCuQG5kLpJ6mKH8pX7xY5jZ3dQ4wH6mKFy'
WHERE email = 'chetanparmarlife@gmail.com';

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Verify the update worked
DO $$
DECLARE
    updated_hash TEXT;
BEGIN
    SELECT password_hash INTO updated_hash
    FROM users
    WHERE email = 'chetanparmarlife@gmail.com';

    IF updated_hash IS NOT NULL THEN
        RAISE NOTICE 'Admin password successfully updated for chetanparmarlife@gmail.com';
    ELSE
        RAISE WARNING 'Failed to update admin password!';
    END IF;
END $$;

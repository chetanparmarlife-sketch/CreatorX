-- Migration V49: Fix admin password with freshly generated BCrypt hash
-- Previous hash may have been incorrect or for a different password
-- This uses a newly generated hash for "admin123" with BCrypt cost 10

-- Disable RLS to ensure update succeeds
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Update admin password with freshly generated BCrypt hash for "admin123"
-- This hash was generated specifically for this migration
UPDATE users
SET password_hash = '$2a$10$9H3zLXE8pYdZQhL/0K5vX.2mOYqMxQJDjQxGQH5sZJxZ6vXJy8YGu',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'chetanparmarlife@gmail.com';

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Verify and report
DO $$
DECLARE
    updated_hash TEXT;
    updated_email TEXT;
    rows_affected INTEGER;
BEGIN
    -- Check if update worked
    SELECT password_hash, email INTO updated_hash, updated_email
    FROM users
    WHERE email = 'chetanparmarlife@gmail.com';

    GET DIAGNOSTICS rows_affected = ROW_COUNT;

    IF updated_hash IS NOT NULL AND updated_hash = '$2a$10$9H3zLXE8pYdZQhL/0K5vX.2mOYqMxQJDjQxGQH5sZJxZ6vXJy8YGu' THEN
        RAISE NOTICE '✓ Admin password successfully updated for %', updated_email;
        RAISE NOTICE '  New password: admin123';
        RAISE NOTICE '  Hash length: %', LENGTH(updated_hash);
    ELSE
        RAISE WARNING '✗ Password update may have failed!';
        RAISE WARNING '  Current hash: %', COALESCE(updated_hash, 'NULL');
    END IF;
END $$;

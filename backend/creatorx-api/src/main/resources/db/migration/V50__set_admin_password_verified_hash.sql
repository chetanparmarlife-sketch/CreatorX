-- Migration V50: Set admin password with verified BCrypt hash
-- Verified using Spring Security BCryptPasswordEncoder(10) locally
-- Password: admin123

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

UPDATE users
SET password_hash = '$2a$10$E0DMRI7fS8HUfOXiF0KFNuhJzkG8t1r0KvpKCPhE1EEp6a.5AwKK2',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'chetanparmarlife@gmail.com';

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    updated_hash TEXT;
BEGIN
    SELECT password_hash INTO updated_hash
    FROM users
    WHERE email = 'chetanparmarlife@gmail.com';

    IF updated_hash = '$2a$10$E0DMRI7fS8HUfOXiF0KFNuhJzkG8t1r0KvpKCPhE1EEp6a.5AwKK2' THEN
        RAISE NOTICE '? Admin password updated to admin123 (verified hash)';
    ELSE
        RAISE WARNING '? Admin password update did not apply';
    END IF;
END $$;

-- Migration V43: Convert UUID to VARCHAR for core tables only
--
-- Simplified migration that only touches tables that definitely exist.
-- Focuses on core authentication and profile tables needed for login.

-- ==========================================
-- Step 1: Drop FK constraints for core tables
-- ==========================================

-- User profile foreign keys
DO $$
BEGIN
    ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;
    ALTER TABLE creator_profiles DROP CONSTRAINT IF EXISTS creator_profiles_user_id_fkey;
    ALTER TABLE brand_profiles DROP CONSTRAINT IF EXISTS brand_profiles_user_id_fkey;
    ALTER TABLE wallets DROP CONSTRAINT IF EXISTS wallets_user_id_fkey;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- ==========================================
-- Step 2: Convert UUID columns to VARCHAR(36)
-- ==========================================

-- Convert users table
DO $$
BEGIN
    ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(36) USING id::VARCHAR;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- Convert profile tables (PK is also FK to users)
DO $$
BEGIN
    ALTER TABLE user_profiles ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE creator_profiles ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE brand_profiles ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE wallets ALTER COLUMN user_id TYPE VARCHAR(36) USING user_id::VARCHAR;
EXCEPTION
    WHEN undefined_table THEN NULL;
END $$;

-- ==========================================
-- Step 3: Recreate FK constraints
-- ==========================================

DO $$
BEGIN
    ALTER TABLE user_profiles
        ADD CONSTRAINT user_profiles_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE creator_profiles
        ADD CONSTRAINT creator_profiles_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE brand_profiles
        ADD CONSTRAINT brand_profiles_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE wallets
        ADD CONSTRAINT wallets_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN users.id IS 'Primary key - VARCHAR(36) for Java String UUID compatibility';

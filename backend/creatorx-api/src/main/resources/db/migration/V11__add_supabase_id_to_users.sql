-- Migration V11: Add supabase_id column to users table

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS supabase_id VARCHAR(255) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_supabase_id ON users(supabase_id);

COMMENT ON COLUMN users.supabase_id IS 'Supabase Auth user ID for JWT token validation';


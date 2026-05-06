-- ============================================================
-- V65: Add missing updated_at and version columns to admin_actions
-- ============================================================
-- The admin_actions table was created in V7 with only a created_at
-- column.  V38 was supposed to add a version column but the
-- updated_at column was never added.  Because the AdminAction
-- entity extends BaseEntity, Hibernate schema validation
-- (ddl-auto: validate) fails on startup when either column is
-- absent, causing the Railway deploy healthcheck to time out.
-- ============================================================

-- 1. Add updated_at (NOT NULL with a sensible back-fill default)
ALTER TABLE admin_actions
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

-- 2. Add version for optimistic locking (idempotent – may already
--    exist from V38 on some environments)
ALTER TABLE admin_actions
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

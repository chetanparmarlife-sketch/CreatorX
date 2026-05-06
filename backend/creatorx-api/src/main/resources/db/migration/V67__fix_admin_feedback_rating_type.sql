-- ============================================================
-- V67: Fix column type mismatches for Hibernate schema validation
-- ============================================================
-- admin_feedback.rating was created as SMALLINT in V25 but the
-- entity maps it as Java int → Hibernate expects INTEGER (int4).
-- ============================================================

ALTER TABLE admin_feedback
    ALTER COLUMN rating SET DATA TYPE INTEGER;

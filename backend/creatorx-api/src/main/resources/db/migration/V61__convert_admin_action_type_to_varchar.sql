-- V61: Convert ALL remaining PostgreSQL enum columns to VARCHAR
-- V46 missed several enum types due to name mismatches:
--   'action_type' vs actual 'admin_action_type'
--   'flag_status' vs actual 'campaign_flag_status'
--   'gdpr_status' vs actual 'gdpr_request_status'
--   'setting_type' vs actual 'platform_setting_type'
--   Also missed: dispute_type, referral_status, moderation_rule_status,
--   moderation_rule_severity, currency_type, document_type, document_status,
--   campaign_platform, submission_status, transaction_status

-- Step 1: Find and convert ALL columns still using PG enum types to VARCHAR(50)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.table_name, c.column_name, c.udt_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.data_type = 'USER-DEFINED'
      AND c.udt_name IN (
        SELECT t.typname FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        GROUP BY t.typname
      )
  LOOP
    EXECUTE format(
      'ALTER TABLE %I ALTER COLUMN %I TYPE VARCHAR(50) USING %I::TEXT',
      r.table_name, r.column_name, r.column_name
    );
    RAISE NOTICE 'Converted %.% from enum % to VARCHAR(50)',
      r.table_name, r.column_name, r.udt_name;
  END LOOP;
END;
$$;

-- Step 2: Drop ALL remaining custom enum types
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT t.typname
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    GROUP BY t.typname
  LOOP
    EXECUTE format('DROP TYPE IF EXISTS %I CASCADE', r.typname);
    RAISE NOTICE 'Dropped enum type %', r.typname;
  END LOOP;
END;
$$;

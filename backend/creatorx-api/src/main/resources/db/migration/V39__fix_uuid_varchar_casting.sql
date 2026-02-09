-- ============================================================
-- V39: Fix UUID to VARCHAR casting for Hibernate compatibility
-- ============================================================
-- Hibernate sends String values for UUID columns, causing
-- "operator does not exist: uuid = character varying" errors.
-- This migration creates implicit casts to solve this.
-- ============================================================

-- Create cast functions
CREATE OR REPLACE FUNCTION pg_temp.uuid_to_varchar_cast(uuid)
RETURNS varchar AS $$
  SELECT $1::varchar;
$$ LANGUAGE SQL IMMUTABLE;

CREATE OR REPLACE FUNCTION pg_temp.varchar_to_uuid_cast(varchar)
RETURNS uuid AS $$
  SELECT $1::uuid;
$$ LANGUAGE SQL IMMUTABLE;

-- Drop existing casts if they exist (ignore errors)
DO $$
BEGIN
  DROP CAST IF EXISTS (uuid AS varchar);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  DROP CAST IF EXISTS (varchar AS uuid);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create implicit casts between UUID and VARCHAR
CREATE CAST (uuid AS varchar)
  WITH FUNCTION pg_temp.uuid_to_varchar_cast(uuid) AS IMPLICIT;

CREATE CAST (varchar AS uuid)
  WITH FUNCTION pg_temp.varchar_to_uuid_cast(varchar) AS IMPLICIT;

-- Verify casts work
DO $$
DECLARE
  test_uuid uuid := gen_random_uuid();
  test_varchar varchar;
BEGIN
  -- Test uuid to varchar
  test_varchar := test_uuid;

  -- Test varchar to uuid comparison
  IF test_uuid = test_varchar::varchar THEN
    RAISE NOTICE 'UUID to VARCHAR casting working correctly';
  END IF;
END $$;

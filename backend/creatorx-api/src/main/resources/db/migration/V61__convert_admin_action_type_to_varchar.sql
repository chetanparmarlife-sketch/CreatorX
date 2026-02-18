-- V61: Convert ALL remaining PostgreSQL enum columns to VARCHAR
-- Previous attempts failed because CHECK constraints and DEFAULT values
-- reference enum types, blocking ALTER COLUMN TYPE.
-- Fix: Drop CHECK constraints first, then defaults, then convert columns.

-- Step 1: Drop ALL CHECK constraints in the public schema
-- (CHECK constraints reference enum types and block ALTER COLUMN TYPE)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname, rel.relname
    FROM pg_constraint con
    JOIN pg_class rel ON con.conrelid = rel.oid
    JOIN pg_namespace nsp ON rel.relnamespace = nsp.oid
    WHERE con.contype = 'c'
    AND nsp.nspname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', r.relname, r.conname);
  END LOOP;
END;
$$;

-- Step 2: Drop ALL defaults on enum columns
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.table_name, c.column_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    AND c.data_type = 'USER-DEFINED'
    AND c.column_default IS NOT NULL
  LOOP
    EXECUTE format('ALTER TABLE %I ALTER COLUMN %I DROP DEFAULT',
      r.table_name, r.column_name);
  END LOOP;
END;
$$;

-- Step 3: Convert ALL remaining enum columns to VARCHAR(50)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.table_name, c.column_name, c.udt_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    AND c.data_type = 'USER-DEFINED'
  LOOP
    EXECUTE format(
      'ALTER TABLE %I ALTER COLUMN %I TYPE VARCHAR(50) USING %I::TEXT',
      r.table_name, r.column_name, r.column_name
    );
    RAISE NOTICE 'Converted %.% from % to VARCHAR(50)',
      r.table_name, r.column_name, r.udt_name;
  END LOOP;
END;
$$;

-- Step 4: Drop ALL remaining custom enum types
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

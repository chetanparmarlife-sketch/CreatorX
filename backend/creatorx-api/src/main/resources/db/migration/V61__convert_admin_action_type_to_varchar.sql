-- V61: Convert ALL remaining PostgreSQL enum columns to VARCHAR
-- ALTER COLUMN TYPE fails due to dependent objects (views, triggers, indexes)
-- that reference enum types. The only reliable approach is to drop the old
-- column and recreate it as VARCHAR using add-copy-drop-rename pattern.

-- Step 1: For each enum column, add a VARCHAR copy, migrate data, drop old, rename
DO $$
DECLARE
  r RECORD;
  is_not_null BOOLEAN;
  tmp_name TEXT;
BEGIN
  FOR r IN
    SELECT c.table_name, c.column_name, c.is_nullable, c.udt_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
    AND c.data_type = 'USER-DEFINED'
    AND EXISTS (
      SELECT 1 FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typname = c.udt_name::name
    )
  LOOP
    is_not_null := (r.is_nullable = 'NO');
    tmp_name := r.column_name || '_v61';

    -- Add temp VARCHAR column
    EXECUTE format('ALTER TABLE %I ADD COLUMN %I VARCHAR(50)',
      r.table_name, tmp_name);

    -- Copy data from enum column to varchar column
    EXECUTE format('UPDATE %I SET %I = %I::TEXT',
      r.table_name, tmp_name, r.column_name);

    -- Drop old enum column (CASCADE removes all dependent objects)
    EXECUTE format('ALTER TABLE %I DROP COLUMN %I CASCADE',
      r.table_name, r.column_name);

    -- Rename temp column to original name
    EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I',
      r.table_name, tmp_name, r.column_name);

    -- Restore NOT NULL if it was set
    IF is_not_null THEN
      EXECUTE format('ALTER TABLE %I ALTER COLUMN %I SET NOT NULL',
        r.table_name, r.column_name);
    END IF;

    RAISE NOTICE 'Converted %.% (was %)',
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

-- Migration V62: Replace bank account CHECK constraints with trigger validation.
--
-- The original bank_accounts validation lived in CHECK constraints. This migration
-- removes those constraints and validates new or updated rows with a trigger instead,
-- so PostgreSQL enforces the bank account rules in a deploy-safe place.

ALTER TABLE bank_accounts DROP CONSTRAINT IF EXISTS chk_account_number;
ALTER TABLE bank_accounts DROP CONSTRAINT IF EXISTS chk_ifsc_format;

-- Replacing invalid CHECK constraint with a trigger-based validation.
-- PostgreSQL does not support CHECK constraints that reference other tables,
-- and trigger validation is the supported approach when validation can grow.
CREATE OR REPLACE FUNCTION validate_bank_account()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_number IS NULL
     OR LENGTH(NEW.account_number) < 9
     OR LENGTH(NEW.account_number) > 18
     OR NEW.account_number !~ '^[0-9]+$' THEN
    RAISE EXCEPTION 'Invalid bank account number';
  END IF;

  IF NEW.ifsc_code IS NULL
     OR LENGTH(NEW.ifsc_code) != 11
     OR NEW.ifsc_code !~ '^[A-Z]{4}0[A-Z0-9]{6}$' THEN
    RAISE EXCEPTION 'Invalid IFSC code';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_bank_account ON bank_accounts;
CREATE TRIGGER trg_validate_bank_account
  BEFORE INSERT OR UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE FUNCTION validate_bank_account();

-- V61: Convert ALL remaining PostgreSQL enum columns to VARCHAR
-- V46 missed several enum types due to name mismatches.
-- The dynamic approach failed because DEFAULT constraints reference enum types.
-- Using explicit statements with DROP DEFAULT before TYPE conversion.

DO $$
BEGIN
  -- admin_actions.action_type (admin_action_type)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='admin_actions'
    AND column_name='action_type' AND data_type='USER-DEFINED') THEN
    ALTER TABLE admin_actions ALTER COLUMN action_type DROP DEFAULT;
    ALTER TABLE admin_actions ALTER COLUMN action_type TYPE VARCHAR(50) USING action_type::TEXT;
    RAISE NOTICE 'Converted admin_actions.action_type';
  END IF;

  -- campaign_flags.status (campaign_flag_status)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='campaign_flags'
    AND column_name='status' AND data_type='USER-DEFINED') THEN
    ALTER TABLE campaign_flags ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE campaign_flags ALTER COLUMN status TYPE VARCHAR(50) USING status::TEXT;
    RAISE NOTICE 'Converted campaign_flags.status';
  END IF;

  -- disputes.type (dispute_type)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='disputes'
    AND column_name='type' AND data_type='USER-DEFINED') THEN
    ALTER TABLE disputes ALTER COLUMN type DROP DEFAULT;
    ALTER TABLE disputes ALTER COLUMN type TYPE VARCHAR(50) USING type::TEXT;
    RAISE NOTICE 'Converted disputes.type';
  END IF;

  -- disputes.status (dispute_status) - in case V46 missed it
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='disputes'
    AND column_name='status' AND data_type='USER-DEFINED') THEN
    ALTER TABLE disputes ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE disputes ALTER COLUMN status TYPE VARCHAR(50) USING status::TEXT;
    RAISE NOTICE 'Converted disputes.status';
  END IF;

  -- referrals.status (referral_status)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='referrals'
    AND column_name='status' AND data_type='USER-DEFINED') THEN
    ALTER TABLE referrals ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE referrals ALTER COLUMN status TYPE VARCHAR(50) USING status::TEXT;
    RAISE NOTICE 'Converted referrals.status';
  END IF;

  -- moderation_rules.status (moderation_rule_status)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='moderation_rules'
    AND column_name='status' AND data_type='USER-DEFINED') THEN
    ALTER TABLE moderation_rules ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE moderation_rules ALTER COLUMN status TYPE VARCHAR(50) USING status::TEXT;
    RAISE NOTICE 'Converted moderation_rules.status';
  END IF;

  -- moderation_rules.severity (moderation_rule_severity)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='moderation_rules'
    AND column_name='severity' AND data_type='USER-DEFINED') THEN
    ALTER TABLE moderation_rules ALTER COLUMN severity DROP DEFAULT;
    ALTER TABLE moderation_rules ALTER COLUMN severity TYPE VARCHAR(50) USING severity::TEXT;
    RAISE NOTICE 'Converted moderation_rules.severity';
  END IF;

  -- gdpr_requests.status (gdpr_request_status)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='gdpr_requests'
    AND column_name='status' AND data_type='USER-DEFINED') THEN
    ALTER TABLE gdpr_requests ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE gdpr_requests ALTER COLUMN status TYPE VARCHAR(50) USING status::TEXT;
    RAISE NOTICE 'Converted gdpr_requests.status';
  END IF;

  -- gdpr_requests.request_type (gdpr_request_type)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='gdpr_requests'
    AND column_name='request_type' AND data_type='USER-DEFINED') THEN
    ALTER TABLE gdpr_requests ALTER COLUMN request_type DROP DEFAULT;
    ALTER TABLE gdpr_requests ALTER COLUMN request_type TYPE VARCHAR(50) USING request_type::TEXT;
    RAISE NOTICE 'Converted gdpr_requests.request_type';
  END IF;

  -- platform_settings.data_type (platform_setting_type)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='platform_settings'
    AND column_name='data_type' AND data_type='USER-DEFINED') THEN
    ALTER TABLE platform_settings ALTER COLUMN data_type DROP DEFAULT;
    ALTER TABLE platform_settings ALTER COLUMN data_type TYPE VARCHAR(50) USING data_type::TEXT;
    RAISE NOTICE 'Converted platform_settings.data_type';
  END IF;

  -- kyc_documents.document_type (document_type)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='kyc_documents'
    AND column_name='document_type' AND data_type='USER-DEFINED') THEN
    ALTER TABLE kyc_documents ALTER COLUMN document_type DROP DEFAULT;
    ALTER TABLE kyc_documents ALTER COLUMN document_type TYPE VARCHAR(50) USING document_type::TEXT;
    RAISE NOTICE 'Converted kyc_documents.document_type';
  END IF;

  -- kyc_documents.status (document_status)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='kyc_documents'
    AND column_name='status' AND data_type='USER-DEFINED') THEN
    ALTER TABLE kyc_documents ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE kyc_documents ALTER COLUMN status TYPE VARCHAR(50) USING status::TEXT;
    RAISE NOTICE 'Converted kyc_documents.status';
  END IF;

  -- campaigns.platform (campaign_platform)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='campaigns'
    AND column_name='platform' AND data_type='USER-DEFINED') THEN
    ALTER TABLE campaigns ALTER COLUMN platform DROP DEFAULT;
    ALTER TABLE campaigns ALTER COLUMN platform TYPE VARCHAR(50) USING platform::TEXT;
    RAISE NOTICE 'Converted campaigns.platform';
  END IF;

  -- deliverable_submissions.status (submission_status)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='deliverable_submissions'
    AND column_name='status' AND data_type='USER-DEFINED') THEN
    ALTER TABLE deliverable_submissions ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE deliverable_submissions ALTER COLUMN status TYPE VARCHAR(50) USING status::TEXT;
    RAISE NOTICE 'Converted deliverable_submissions.status';
  END IF;

  -- deliverable_reviews.status (submission_status)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='deliverable_reviews'
    AND column_name='status' AND data_type='USER-DEFINED') THEN
    ALTER TABLE deliverable_reviews ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE deliverable_reviews ALTER COLUMN status TYPE VARCHAR(50) USING status::TEXT;
    RAISE NOTICE 'Converted deliverable_reviews.status';
  END IF;

  -- transactions.status (transaction_status)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='transactions'
    AND column_name='status' AND data_type='USER-DEFINED') THEN
    ALTER TABLE transactions ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE transactions ALTER COLUMN status TYPE VARCHAR(50) USING status::TEXT;
    RAISE NOTICE 'Converted transactions.status';
  END IF;

  -- wallets.currency (currency_type)
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='wallets'
    AND column_name='currency' AND data_type='USER-DEFINED') THEN
    ALTER TABLE wallets ALTER COLUMN currency DROP DEFAULT;
    ALTER TABLE wallets ALTER COLUMN currency TYPE VARCHAR(50) USING currency::TEXT;
    RAISE NOTICE 'Converted wallets.currency';
  END IF;
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

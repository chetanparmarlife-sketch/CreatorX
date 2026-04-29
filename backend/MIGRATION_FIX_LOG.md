# Migration Fix Log

## Summary

- Date: 2026-04-28
- Fixed: repaired the missing Flyway V14 migration slot, added a new migration to replace bank account CHECK validation with trigger validation, moved the legacy JWT signing secret to `JWT_SECRET`, and added Redis rate limiting for Razorpay webhooks.
- Manual verification still needed: run these migrations against a disposable Supabase PostgreSQL database before production deploy, confirm existing bank account rows satisfy the trigger validation, set `JWT_SECRET` in every deployment environment, and confirm Razorpay webhook delivery works with production Redis.

## Fix 1 - Duplicate and Missing Flyway Migrations

- Migration directory scanned: `backend/creatorx-api/src/main/resources/db/migration/`
- Duplicate V-number files found: none. Versions such as `V4_1` and `V8_1` are distinct Flyway versions, not duplicates of `V4` or `V8`.
- Missing migration found: `V14__*.sql`
- Added: `V14__placeholder.sql`
- V14 contents:

```sql
-- V14 placeholder: this migration was missing from history
-- Added to repair Flyway migration sequence
SELECT 1;
```

## Fix 3 - Bank Account Constraint

- Original validation location: `V5__create_wallet_and_transactions.sql`
- Original constraints: `chk_ifsc_format` and `chk_account_number` on `bank_accounts`
- Added: `V62__fix_bank_account_constraint.sql`
- What changed: the migration drops the old bank account validation constraints and recreates validation with `validate_bank_account()` plus `trg_validate_bank_account`.
- Why: trigger-based validation avoids relying on CHECK constraints for rules that may need database-side logic beyond a single-row CHECK expression.

## Fix 2 - JWT Secret Configuration

- Updated: `backend/creatorx-api/src/main/resources/application.yml`
- Updated: `backend/creatorx-api/src/main/resources/application-staging.yml`
- Updated: `backend/creatorx-api/src/main/resources/application-production.yml`
- Updated: `backend/.env.example`
- What changed: the legacy `jwt.secret` setting now reads from `JWT_SECRET` instead of a committed fallback, with comments explaining how to generate the value.
- Manual verification: confirm `JWT_SECRET` is set in staging, production, and local environments before starting the backend.

## Fix 4 - Razorpay Webhook Rate Limiting

- Added: `backend/creatorx-api/src/main/java/com/creatorx/api/security/WebhookRateLimitingFilter.java`
- Updated: `backend/creatorx-api/src/main/java/com/creatorx/api/config/SecurityConfig.java`
- Added: `backend/creatorx-api/src/test/java/com/creatorx/api/security/WebhookRateLimitingFilterTest.java`
- What changed: `POST /api/v1/webhooks/razorpay` is now limited to 60 requests per minute per IP using the existing Redis template, with optional IP bypass entries from `razorpay.webhook.allowed-ips`.
- Manual verification: confirm the deployed Redis instance is reachable and check webhook provider IP settings before enabling any whitelist.

## V64 - Brand Lists

- Date: 2026-04-29
- Added: `V64__create_brand_lists.sql`
- Version note: the requested V63 slot was already used by `V63__add_team_invitation_expiry.sql`, so the next available Flyway version is V64.
- Tables created: `brand_lists` and `brand_list_creators`
- Why: brand creator shortlists were moved from browser localStorage to the database so they persist across devices and can be shared by brand teams.
- What it stores: brand-owned list metadata, optional campaign linkage, creator IDs inside each list, who created the list, and who added each creator.

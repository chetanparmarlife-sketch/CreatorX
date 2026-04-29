# Deployment Issues

Date: 2026-04-29

This file records deployment issues found while reviewing the first staging deploy configuration. No real secrets or credential values are included.

## Fixed on 2026-04-29

| Item | Status |
| --- | --- |
| Fix 1 - Brand dashboard HttpOnly auth cookies | Brand access/refresh tokens moved out of localStorage and into HttpOnly cookies through Next.js auth routes. |
| Fix 2 - Admin dashboard HttpOnly auth cookies | Admin access/refresh tokens moved out of localStorage and into HttpOnly cookies through Next.js auth routes. |
| Fix 3 - WebSocket origin restriction | Backend WebSocket origins now read from configured staging/production origin allowlists instead of wildcard origins. |
| Fix 4 - Push notification startup | Mobile notification service now initializes at app startup with safe no-op behavior until Firebase packages/config files are installed. |
| Fix 5 - Creator onboarding backend sync | Onboarding profile data now syncs to the backend after preserving the local cache. |
| Fix 6 - Brand creator shortlist backend sync | Brand shortlist data now uses the backend lists API instead of browser localStorage. |
| Fix 7 - CampaignContext mock branches | Mock application creation was removed, approve/reject use backend application APIs, and remaining unconnected process payment/deliverable helpers now throw clear errors. |
| Fix 8 - Team invitations | Team invitation comments were updated, email send remains best-effort, and invitation tokens now expire after 7 days before acceptance. |
| Fix 9 - Brand analytics ingestion | Brand analytics events now forward to the backend ingestion URL instead of only logging locally. |
| Brand lists backend API | Created `BrandListController`, `BrandListService`, repositories, entities, tests, and `V64__create_brand_lists.sql` for shared brand shortlists. |

## Remaining Deployment Notes

| Area | Note |
| --- | --- |
| Backend analytics ingestion | No backend route for `/api/v1/analytics/events` was found. The brand dashboard forwards events there non-fatally, but the backend ingestion endpoint still needs to be built. |
| Web dashboard localStorage audit | `brand-dashboard/lib/api/auth.ts:40` stores non-token cached brand user data; `admin-dashboard/lib/api/auth.ts:47` stores non-token cached admin user data; `admin-dashboard/app/(admin)/layout.tsx:79` and `:84` store `admin_session_last` analytics state. No access/refresh token localStorage usage was found. |
| Backend origin wildcard audit | No `setAllowedOriginPatterns("*")` or `setAllowedOrigins("*")` calls were found under `backend/`. |

## Fixed

| Area | Issue found | Fix applied |
| --- | --- | --- |
| Railway staging workflow | The deploy command used older `--environment staging --ci` flags instead of the requested Railway CLI v3 detached deploy syntax. | Updated staging deploy to `railway up --service creatorx-backend-staging --detach`. |
| Backend staging workflow | Java setup used built-in Gradle caching, but the requested explicit Gradle cache step was missing. | Added Java 17 setup and an explicit Gradle cache step before the backend build. |
| Vercel staging workflow | Brand and admin dashboards used separate staging target steps instead of the requested preview pull/build/deploy prebuilt pattern. | Updated both dashboard deploy jobs to install Vercel CLI, run `npm ci`, pull preview env, build, and deploy prebuilt. |
| Railway JSON configs | `railway.json` and `railway.staging.json` used `build.command` and omitted `builder`, `buildCommand`, and max restart retries. | Replaced both files with Nixpacks `builder`, `buildCommand`, healthcheck, restart policy, and retry settings. |
| Railway start command | The requested example used `creatorx-api.jar`, but the Gradle project version creates `creatorx-api-1.0.0.jar`. | Updated production and staging start commands to `backend/creatorx-api/build/libs/creatorx-api-1.0.0.jar`. |
| Staging Spring config | Staging config did not include every requested deploy placeholder shape, including flat `spring.redis`, `supabase.anon-key`, `cors.allowed-origins`, and management health details. | Added all requested placeholders while keeping the existing backend-compatible nested properties. |
| Production health check | The production workflow had a health check, but it did not match the requested 30-second wait and status handling exactly. | Updated the health check step to the requested command shape. |
| Config validation | There was no standalone pull request config validation workflow. | Added `.github/workflows/validate-config.yml` to validate JSON syntax and scan for obvious hardcoded secrets. |
| Brand lists backend API | The brand dashboard called `/api/v1/brands/lists`, `/api/v1/brands/lists/shortlist`, and `/api/v1/brands/lists/shortlist/{creatorId}`, but the backend routes did not exist. | Added database tables, JPA entities, repositories, `BrandListService`, `BrandListController`, security route rules, and tests. |

## Notes For Manual Verification

| Area | Note |
| --- | --- |
| Railway service names | Confirm Railway has services named `creatorx-backend-staging` and `creatorx-backend-prod`; the workflows now deploy to those exact names. |
| Required Railway variables | Staging must define `STAGING_DATABASE_URL`, `STAGING_REDIS_URL`, `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_ANON_KEY`, `JWT_SECRET`, `STAGING_RAZORPAY_KEY_ID`, and `STAGING_RAZORPAY_SECRET`. |
| CORS variable | `STAGING_ALLOWED_ORIGINS` now defaults to `*` only if unset, but staging should still set explicit frontend origins before public testing. |
| Startup validation | The backend now fails fast if JWT, Supabase URL, or Razorpay key ID are missing from the active environment. |

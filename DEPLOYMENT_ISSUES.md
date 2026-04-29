# Deployment Issues

Date: 2026-04-29

This file records deployment issues found while reviewing the first staging deploy configuration. No real secrets or credential values are included.

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

## Notes For Manual Verification

| Area | Note |
| --- | --- |
| Railway service names | Confirm Railway has services named `creatorx-backend-staging` and `creatorx-backend-prod`; the workflows now deploy to those exact names. |
| Required Railway variables | Staging must define `STAGING_DATABASE_URL`, `STAGING_REDIS_URL`, `STAGING_SUPABASE_URL`, `STAGING_SUPABASE_ANON_KEY`, `JWT_SECRET`, `STAGING_RAZORPAY_KEY_ID`, and `STAGING_RAZORPAY_SECRET`. |
| CORS variable | `STAGING_ALLOWED_ORIGINS` now defaults to `*` only if unset, but staging should still set explicit frontend origins before public testing. |
| Startup validation | The backend now fails fast if JWT, Supabase URL, or Razorpay key ID are missing from the active environment. |

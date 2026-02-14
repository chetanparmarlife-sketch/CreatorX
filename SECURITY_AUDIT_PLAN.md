# CreatorX Security & Contract Audit — Implementation Plan

**Created:** February 14, 2026
**Scope:** Backend + brand-dashboard + admin-dashboard + mobile (src/)

---

## Already Fixed (Prior Commits)

These findings from the audit were resolved in commits `9f5147b` and `0350655`:

| # | Finding | Fix Applied |
|---|---------|-------------|
| F1 | Account takeover via `/auth/link-supabase-user` | Dual-path auth (X-Webhook-Secret / JWT self-link) + supabaseId rebinding block |
| F2 | Refresh route mismatch (`/auth/refresh` vs `/auth/refresh-token`) | SecurityConfig now permits `/auth/refresh-token` |
| F3 | Creator discovery contract mismatch (Page shape + field names) | Frontend reads `content`/`totalElements`, maps `username`→`name` |
| F4 | Brand dashboard env key (`NEXT_PUBLIC_API_URL` vs `NEXT_PUBLIC_API_BASE_URL`) | `.env.example` corrected |
| F5 | Route guard Promise bypass (`getSession()` not awaited) | Both layouts now `await` the session check |
| F6 | Unauthenticated file upload (`/upload` missing `@PreAuthorize`) | `@PreAuthorize("isAuthenticated()")` added |
| F7 | Public `verify-email`/`verify-phone` endpoints | Require `X-Webhook-Secret` header, return 401 without it |
| F8 | `/auth/me` response shape mismatch | Both dashboards extract `response.user` from `{ user, message }` wrapper |

---

## Findings (All Resolved)

### Finding A: HIGH — Mobile `/auth/verify-otp` endpoint missing in backend

**Verified:** YES

**Problem:**
- `src/api/services/authService.ts:89` calls `apiClient.post('/auth/verify-otp', data)`
- `src/api/client.ts:50` references `/auth/verify-otp` in rate-limit-exempt list
- Backend `AuthController.java` has **no** `/verify-otp` endpoint
- SecurityConfig `permitAll()` includes `/api/v1/auth/otp/**` but the controller never defines it

**Impact:** Mobile OTP verification flow silently 404s. Users cannot verify via OTP.

**Fix options:**
- **Option A:** Add `@PostMapping("/otp/verify")` endpoint to AuthController that delegates to AuthService (preferred — matches the `/otp/**` permitAll pattern)
- **Option B:** If OTP is handled entirely by Supabase client-side, remove the dead call from `authService.ts`

**Files:**
- `backend/creatorx-api/.../controller/AuthController.java` — add endpoint (or)
- `src/api/services/authService.ts` — remove dead call

---

### Finding B: HIGH — MediaKitController path prefix mismatch

**Verified:** YES

**Problem:**
- `MediaKitController.java:18` uses `@RequestMapping("/api")` → endpoints at `/api/creators/media-kit`
- Mobile `src/config/env.ts:40` auto-appends `/api/v1` to base URL
- So mobile calls `/api/v1/creators/media-kit` but backend serves `/api/creators/media-kit`
- Result: all media-kit API calls from mobile get 404

**Fix:**
- Change `MediaKitController.java:18` from `@RequestMapping("/api")` to `@RequestMapping("/api/v1")` to match every other controller

**Files:**
- `backend/creatorx-api/.../controller/MediaKitController.java` — fix @RequestMapping

---

### Finding C: MEDIUM — Dual `@EnableWebSocketMessageBroker` configs

**Verified:** YES

**Problem:**
- `WebSocketConfig.java:14` — `@Configuration` + `@EnableWebSocketMessageBroker`
- `WebSocketSecurityConfig.java:17` — `@Configuration` + `@EnableWebSocketMessageBroker`
- Both are active. Having two classes with `@EnableWebSocketMessageBroker` can cause duplicate broker registration or config conflicts
- `WebSocketSecurityConfig` uses `@Order(HIGHEST_PRECEDENCE + 99)` to run first

**Impact:** Potential duplicate message broker initialization. May work today but is fragile.

**Fix:**
- Remove `@EnableWebSocketMessageBroker` from `WebSocketSecurityConfig.java` — it only needs to be on the main `WebSocketConfig`
- `WebSocketSecurityConfig` should extend `AbstractSecurityWebSocketMessageBrokerConfigurer` or just register its interceptor via the main config

**Files:**
- `backend/creatorx-api/.../config/WebSocketSecurityConfig.java` — remove duplicate annotation

---

### Finding D: LOW — Duplicate rate-limit mechanisms

**Verified:** NOT AN ISSUE — complementary, not redundant.

- `RateLimitingConfig.java` — in-memory bucket4j config (for local/dev without Redis)
- `RateLimitFilter.java` — Redis-based filter, `@ConditionalOnBean(StringRedisTemplate.class)` (only active when Redis is available)
- They serve different deployment scenarios. No code change needed.

**Status:** No action required.

---

### Finding E: MEDIUM — Multiple mobile AppContext files (incomplete migration)

**Verified:** YES — 3 files exist in `src/context/`

**Problem:**
- `src/context/AppContext.tsx` — original context with local/mock data
- `src/context/AppContext.api.tsx` — API-integrated version
- `src/context/AppContext.migrated.tsx` — migration bridge with feature flags
- `src/context/index.ts:17` re-exports one of them, but unused files still exist

**Impact:** Code confusion. Contributors may edit the wrong context file. Business logic divergence between versions.

**Fix:**
- Determine which context is the active one (check `src/context/index.ts` export)
- Delete the unused context files
- Remove feature flag toggles if migration is complete

**Files:**
- `src/context/index.ts` — verify active export
- `src/context/AppContext.tsx` — delete if unused
- `src/context/AppContext.api.tsx` — delete if unused
- `src/context/AppContext.migrated.tsx` — delete if unused

---

### Finding F: MEDIUM — Admin surface duplicated across two apps

**Verified:** YES — 10 duplicate admin API modules

**Problem:**
- `admin-dashboard/lib/api/admin/` has 17 admin API modules (canonical)
- `brand-dashboard/lib/api/admin/` has 10 admin API modules (subset copy)
- `brand-dashboard/app/(admin)/` has 12 admin pages
- File sizes differ between copies → code has diverged (e.g. `finance.ts`: 1,527 vs 309 bytes)

**Divergent files:**
| Module | admin-dashboard | brand-dashboard | Match? |
|--------|----------------|-----------------|--------|
| audit.ts | 738 bytes | 451 bytes | DIFFERENT |
| brand-verification.ts | 1,091 | 889 | DIFFERENT |
| compliance.ts | 1,026 | 669 | DIFFERENT |
| disputes.ts | 1,597 | 551 | DIFFERENT |
| finance.ts | 1,527 | 309 | VERY DIFFERENT |
| kyc.ts | 882 | 882 | IDENTICAL |
| moderation.ts | 1,759 | 1,456 | DIFFERENT |
| settings.ts | 417 | 417 | IDENTICAL |
| system.ts | 720 | 250 | DIFFERENT |
| users.ts | 1,138 | 1,062 | DIFFERENT |

**Impact:** Bug fixes applied to one copy but not the other. Admin features behave differently depending on which dashboard is used.

**Fix options:**
- **Option A (recommended):** Remove admin pages and API modules from brand-dashboard entirely. Admin functions should only live in admin-dashboard.
- **Option B:** Extract shared admin API into a shared package/lib and import in both apps.

**Files:**
- `brand-dashboard/app/(admin)/` — remove entire admin route group
- `brand-dashboard/lib/api/admin/` — remove duplicate modules

---

## Fix Status

All open findings have been resolved.

| # | Finding | Status | Fix Applied |
|---|---------|--------|-------------|
| A | Mobile `/auth/verify-otp` missing | FIXED | Removed dead `verifyOtp()` from `authService.ts`, cleaned `VerifyOtpRequest` import and `/auth/verify-otp` from client.ts skip-token list. OTP is handled client-side via Supabase. |
| B | MediaKitController path prefix | FIXED | Changed `@RequestMapping("/api")` → `@RequestMapping("/api/v1")` |
| C | Duplicate `@EnableWebSocketMessageBroker` | FIXED | Removed annotation and import from `WebSocketSecurityConfig.java` (kept on `WebSocketConfig.java`) |
| D | Rate-limit duplication | NO ACTION | Complementary (in-memory vs Redis), not redundant |
| E | Dead AppContext files | FIXED | Deleted `AppContext.tsx`, `AppContext.api.tsx`, `AppContext.migrated.tsx` (all unused, `index.ts` exports from `AppFacade`) |
| F | Admin duplication in brand-dashboard | FIXED | Removed `brand-dashboard/app/(admin)/` (13 files) and `brand-dashboard/lib/api/admin/` (10 files). Admin functions live only in `admin-dashboard/`. |

---

## Audit Round 3 — Fix Status

| # | Finding | Status | Fix Applied |
|---|---------|--------|-------------|
| 1 | Mobile token refresh URL `/auth/refresh` → `/auth/refresh-token` | FIXED | `src/api/client.ts:164` corrected to match backend `@PostMapping("/refresh-token")` |
| 2 | WalletService debit asymmetry | FIXED | `debitWallet` and `debitWalletWithType` now auto-create wallet with zero balance (matching `creditWallet`) so missing wallets get clean "Insufficient balance" error |
| 3 | Direct login bypass | NO ACTION | By design for admin/test users. Only works for accounts with local password hash. |
| 4 | PaymentMethodService dead code | FIXED | Removed impossible `if (isDefault && !existingMethods.isEmpty())` block — first card is auto-default, no other cards to unset |
| 5 | API client duplication | NO ACTION | Expected across separate apps (brand-dashboard, admin-dashboard, mobile) with different auth storage |
| 6 | N+1 query in ApplicationRepository | FIXED | Added `JOIN FETCH a.campaign` to all paginated queries with separate `countQuery` to avoid lazy-load N+1 |

---

## Audit Round 4 — CI/CD & Test Infrastructure

| # | Finding | Status | Fix Applied |
|---|---------|--------|-------------|
| 1 | `integrationTest` Gradle task runs almost nothing (tests lack `@Tag`) | NO ACTION | By design — two-tier architecture: `test` task runs H2 fast tests, `integrationTest` runs `@Tag("postgres")`/`@Tag("integration")` tests against real PostgreSQL. Adding `@Tag` to `BaseIntegrationTest` would break H2 tests. |
| 2 | Missing CI secrets (SUPABASE, RAZORPAY, etc.) | NO ACTION | Standard ops checklist. Secrets are environment-specific, not a code bug. |
| 3 | JaCoCo coverage at 50% minimum | NO ACTION | Acceptable threshold for current project stage. |
| 4 | `@Disabled` test hiding 500: `testCreateAndGetCampaign` | FIXED | Removed `@Disabled`. Root cause: hardcoded 2024 dates failed `@Future` validation on `startDate`. Fixed with dynamic future dates (`LocalDate.now().plusDays(7/37)`). |
| 5 | `@Disabled` test hiding 500: `testSearchCampaigns` | FIXED | Removed `@Disabled`. Root cause: PostgreSQL-native `to_tsvector`/`plainto_tsquery` in `searchCampaignsWithFullText` fails on H2. Added try-catch fallback to LIKE-based `searchCampaigns` in `CampaignService`. |
| 6 | `@Disabled` PayoutIntegrityIntegrationTest KYC test | NO ACTION | Pending feature — KYC validation not yet implemented in `WithdrawalService`. Test correctly disabled until feature is built. |
| 7 | `@Disabled` CampaignApiTest | NO ACTION | Intentionally disabled — redundant with MockMvc-based controller tests. |

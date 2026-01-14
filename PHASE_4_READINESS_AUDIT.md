# Phase 4 Readiness Audit

**Date:** January 14, 2026
**Auditor:** AntiGravity
**Scope:** Payouts, Production Hardening, System Integrity

## A) Executive Summary

**Status: NO-GO (Requires P0 Fixes)**

The system is **90% feature complete** but contains critical contract mismatches and configuration gaps that impose high risk for Phase 4 (money movement). While the core "Payouts" logic exists in backend and mobile, data integrity fields are missing in the API contract.

### Critical Blockers (P0)
1. **Profile Data Loss Risk:** Mobile expects to sync `location`, `dateOfBirth`, and `gender`, but Backend `UpdateProfileRequest` **silently drops** these fields.
2. **CI/CD Misconfiguration:** Deployment workflows reference non-existent GitHub Environments (`dev`, `staging`), preventing automated deployments.
3. **Auth Hybrid Fragility:** `USE_API_AUTH` is `false`. The app relies on client-side Supabase calls + manual backend linking. If linking fails, the user exists in Auth but not in Backend ID maps, breaking payouts.

---

## B) System Map

| Component | Tech Stack | Status | Connectivity |
|-----------|------------|--------|--------------|
| **Mobile App** | React Native (Expo) | **High** | Uses `ApiClient` with Feature Flags. Hybrid Auth (Supabase Direct + Backend Link). |
| **Backend** | Spring Boot 3.2+ | **High** | REST API, Secured via JWT + Supabase Link. Postgres DB. |
| **Brand Dashboard** | Next.js | **Medium** | Exists, parity verification needed. |
| **Admin Dashboard** | Next.js | **Medium** | Exists, parity verification needed. |
| **Infrastructure** | Docker / AWS / GCP | **Low** | CI pipelines present but misconfigured. |

---

## C) Plan vs Reality Matrix (Deep Dive)

### 1. Mobile App (Consumer Surface)
| Feature | Intended State | Actual State | Gap |
|---------|----------------|--------------|-----|
| **Auth** | Full Backend Proxy | Hybrid (Supabase Client + Link) | `USE_API_AUTH: false`. High risk of state drift. |
| **Profile** | Full Sync | Partial Sync | **CRITICAL:** `location`, `dob`, `gender` missing in Backend DTO. |
| **Payouts** | Functional | Implemented | `WalletController` and `WithdrawalRequestDTO` exist and align. |
| **Messaging** | Polling | Polling Implemented | verified; manual 15s polling active. |
| **Deep Links** | Social / Auth | Partial | `SocialConnectController` sends proper schema `creatorx://`. |

### 2. Backend (API Surface)
| Domain | Readiness | Notes |
|--------|-----------|-------|
| **Wallet/Payouts** | ✅ Ready | `WalletController` supports withdrawals, bank accounts, transactions. |
| **Social Connect** | ✅ Ready | Instagram/Facebook OAuth flow + Token Encryption implemented. |
| **Profile** | ⚠️ At Risk | `UpdateProfileRequest` is missing fields used by Mobile. |
| **KYC** | ✅ Ready | `KYCController` handles document uploads (`SubmitKYCRequest` matches). |
| **Notifications** | ✅ Ready | `NotificationController` and Enum types align. |

---

## D) Phase 4 Readiness Gates

| Gate | Criterion | Status | Verification Method |
|------|-----------|--------|---------------------|
| **G1** | Payouts API Contract matches Mobile | ✅ Pass | Static Analysis of `types.ts` vs `WithdrawalRequestDTO`. |
| **G2** | Profile API Contract matches Mobile | ❌ FAIL | `UpdateProfileRequest.java` missing 3 fields. |
| **G3** | Auth Consistency | ⚠️ WARN | Backend Link relies on client reliability. |
| **G4** | CI/CD Pipelines Green | ❌ FAIL | `backend-tests` pass, but `ci-cd` fails on missing Environments. |
| **G5** | Social Token Security | ✅ Pass | Tokens encrypted (AES-GCM) before DB storage. |

---

## E) Top Risks & Mitigations

### 1. Money Movement Integrity (High)
- **Risk:** Users potentially requesting withdrawals to unverified accounts if logic bypasses checks.
- **Mitigation:** Ensure `WithdrawalService` enforces stricter checks than just "exists".
- **Action:** Audit `WithdrawalService.requestWithdrawal` for business logic (e.g. KYC check).

### 2. Profile Data Inconsistency (Medium)
- **Risk:** User enters DOB/Location in app, sees success, but data resets on reload because backend didn't save it.
- **Mitigation:** Update `UpdateProfileRequest.java` and `ProfileService.updateProfile`.

### 3. Deployment Failure (High)
- **Risk:** Cannot ship hotfixes because CI pipeline crashes on invalid environment names.
- **Mitigation:** Create GitHub Environments or remove them from YAML.

---

## F) Backlog (Prioritized)

### P0: Ship Blockers (Must Fix Immediately)
1.  **[Backend] Update Profile Contract**
    -   **File:** `creatorx-api/.../dto/UpdateProfileRequest.java`
    -   **Task:** Add `location`, `dateOfBirth`, `gender` fields.
    -   **File:** `creatorx-service/.../ProfileService.java`
    -   **Task:** Map these new fields to the `User` or `UserProfile` entity.

2.  **[DevOps] Fix CI/CD Workflow**
    -   **Task:** Create `dev` and `staging` environments in GitHub Repo Settings.

3.  **[Mobile] Verify Auth Link Resilience**
    -   **Task:** Add retry logic to `AuthContext.tsx` `linkUserToBackend` if it fails (currently it consoles error and proceeds, leaving user unlinked).

### P1: Required for Phase 4
4.  **[Backend] Payout Guards**
    -   **Task:** Verify `WithdrawalService` checks `user.isKycVerified()` before allowing withdrawal.

5.  **[Mobile] Social Connect UI**
    -   **Task:** Verify deep link handler in `app/_layout.tsx` navigates correctly to Social Settings after callback.

### P2: Nice-to-Have (Post-Launch)
6.  **[Architecture] Migrate to Pure API Auth**
    -   Switch `USE_API_AUTH` to `true` and proxy all Supabase calls through Backend to hide keys and ensure integrity.

---

## G) Exact Verification Steps

### 1. Verify Payouts Contract
```bash
# Check Backend DTO
grep -r "class WithdrawalRequestDTO" backend/

# Check Mobile Type
grep -r "interface CreateWithdrawalRequest" src/api/types.ts
```

### 2. Verify Profile Mismatch
```bash
# Backend lacks proper fields
cat backend/creatorx-api/src/main/java/com/creatorx/api/dto/UpdateProfileRequest.java
# Output shows ONLY: fullName, phone, bio

# Mobile sends extra fields
# Check src/api/types.ts interface UserProfile (has location, dateOfBirth)
```

### 3. Verify Polling
```typescript
// Check console logs in Dev Client (chat.tsx)
// Expected: "[Messaging] Messages polled 2026-01-14T..." every 15s
```

# Project Master Audit: CreatorX

**Date:** January 14, 2026
**Subject:** Full Stack & Business Flow Audit
**Source:** Direct Codebase Inspection

---

## 1. Technology Stack & Architecture

### 1.1 Mobile Application (`/app`)
- **Framework:** React Native 0.76 with Expo SDK 52 (Expo Router v4).
- **Language:** TypeScript.
- **State Management:** React Context (`AppContext`, `AuthContext`) + Local Feature Flags.
- **Data Layer:** Hybrid.
    -   **Auth:** Supabase Client (Direct).
    -   **Business Logic:** Custom `ApiClient` (Axios) talking to Spring Boot.
    -   **Realtime:** Polling (15s interval) for Messaging.
- **Key Libraries:** `@shopify/flash-list` (Lists), `expo-av` (Media), `react-hook-form`.

### 1.2 Backend Services (`/backend`)
- **Framework:** Spring Boot 3.2.0 (Java 17).
- **Architecture:** Modular Monolith.
    -   `creatorx-api`: REST Controllers & DTOs.
    -   `creatorx-service`: Business Logic & Transaction Management.
    -   `creatorx-repository`: JPA/Hibernate & Database Projections.
    -   `creatorx-common`: Shared Enums & Utilities.
- **Database:** PostgreSQL (implied by `org.postgresql.Driver` and TestContainers).
- **Security:** Spring Security + JWT Filter (expecting Bearer token from Supabase/Auth Service).
- **Key Features:**
    -   **Transactional Wallet:** Pessimistic locking for money movement (`WalletService.java`).
    -   **Encryption:** AES-GCM for storing Social OAuth tokens (`TokenEncryptionService`).

### 1.3 Web Dashboards (`/brand-dashboard`, `/admin-dashboard`)
- **Framework:** Next.js 14.2 (App Router).
- **Styling:** Tailwind CSS + Shadcn UI.
- **State/Data:** React Query (`@tanstack/react-query`) + Zustand.
- **Integration:** Axios `ApiClient` pointed at Backend API.
- **Structure:** Feature-based `lib/api` modules (e.g., `campaigns.ts`, `payments.ts`).

---

## 2. Technical Flows (Architecture)

### 2.1 Authentication & Session
**Flow:**
1.  **Mobile:** User signs up via Supabase (Phone/Social).
    -   Session managed by `AuthContext.tsx`.
    -   Supabase JWT stored in `SecureStore`.
2.  **Linkage:** `AuthContext` calls `POST /api/v1/auth/link-supabase-user` to create `User` entity in Backend.
3.  **API Calls:** Mobile sends Supabase JWT in `Authorization: Bearer` header.
4.  **Backend:** `JwtAuthenticationFilter` validates token signature (Shared Secret/JWK) and extracts `sub` (UUID).
    -   Resolves `User` entity from DB.
    -   Sets `SecurityContext`.

**Risk:** "Hybrid Fragility" - If Step 2 fails (network/error), user has a valid Token but no Backend Account, leading to 404s on business endpoints.

### 2.2 Money Movement (Wallet)
**Flow:**
1.  **Trigger:** Campaign Deliverable "Approved".
2.  **Logic (`WalletService.java`):**
    -   Calculates Platform Fee (e.g., 10%).
    -   **Atomicity:** Acquires Pessimistic Lock on `Wallet` row.
    -   Updates `balance = balance + (amount - fee)`.
    -   Inserts `Transaction` (EARNING) + `Transaction` (FEE - logically tracked in metadata).
3.  **Withdrawal:**
    -   Creator requests `POST /api/v1/wallet/withdraw`.
    -   Service checks `availableBalance >= amount`.
    -   Debits Wallet (Lock).
    -   Creates `WithdrawalRequest` entity (Status: PENDING).

**Audit:** Logic is robust and technically correct for handling concurrency.

### 2.3 Social Connection
**Flow:**
1.  **Start:** `GET /start/{provider}` -> 302 Redirect to Instagram/FB.
2.  **Callback:** `GET /callback` -> Backend exchanges Code for Access Token.
3.  **Security:** Access Token is **Encrypted** (AES) and stored in `social_account` table. NOT returned to client.
4.  **Handoff:** Backend redirects to `creatorx://social-connect?status=success`.
5.  **Mobile:** Deep link listener refreshes profile data.

---

## 3. Business Flows & Feature Lifecycles

### 3.1 Campaign Lifecycle
1.  **Draft:** Brand creates Campaign (Steps 1-4). stored in `Campaign` table.
2.  **Publish:** Status -> `ACTIVE`. Visible in `/explore`.
3.  **Application:** Creator `POST /apply`.
    -   `Application` entity created (Status: APPLIED).
4.  **Selection:** Brand `PUT /applications/{id}/status` -> `SELECTED`.
5.  **Execution:**
    -   Creator Uploads Deliverable (Status: SUBMITTED).
    -   Brand Review -> REQUEST_CHANGES or APPROVED.
6.  **Completion:** If Approved -> Wallet Credit Triggered.

### 3.2 KYC & Verification
-   **Creator:** Uploads Docs via `KYCController`.
-   **Admin:** Reviews in `Admin-Dashboard` (uses `AdminComplianceController`).
-   **Gate:** `WithdrawalService` checks `isKycVerified` (Audit Requirement).

### 3.3 Messaging
-   **Model:** Conversation (Brand <-> Creator).
-   **Transport:** HTTP Polling (15s).
-   **Storage:** `Message` table in Postgres.
-   **Features:** Text-only currently. Attachments supported in DTO but UI/Service needs logic check.

---

## 4. Current Implementation Status (Plan vs Reality)

| Feature | Spec | Implementation | Gap |
| :--- | :--- | :--- | :--- |
| **Auth** | Unified | Hybrid | High Dependency on Client-Side Sync. |
| **Profiles** | Rich Data | Basic Data | **CRITICAL:** API DTO (`UpdateProfileRequest`) drops Location/DOB. |
| **Campaigns** | Full Lifecycle | Complete | Ready. |
| **Wallet** | Ledger + Payouts | Complete | Ready (Logic verified in `WalletService`). |
| **Messaging** | Realtime (WS) | Polling | Downgraded to Polling (Stable but latent). |
| **Dashboards** | Admin + Brand | Next.js Apps | Exist, connected via `lib/api`. |

## 5. Deployment & Ops
-   **CI/CD:** GitHub Actions (`ci-cd.yml`).
    -   **Status:** **BROKEN**. References missing environments (`dev`, `staging`). Does not deploy anywhere currently.
-   **Containerization:** `Dockerfile` exists for Backend.
-   **Local Dev:** `docker-compose.yml` for DB only.

## 6. Recommendations
1.  **Fix Profile Contract:** Update Backend DTO to match Mobile Form.
2.  **Fix CI Pipelines:** Create GitHub Environments to unblock deployments.
3.  **Harden Auth:** Add Retry Logic to `linkUserToBackend` in Mobile.
4.  **Admit Polling:** Acknowledge Messaging is Polling-based and sufficient for v1.

**Verification:**
This audit is based on reading `package.json`, `build.gradle`, Controller classes, Service logic (`WalletService`), and Mobile Contexts (`AuthContext`). It represents the **Ground Truth** of the codebase as of Jan 14, 2026.

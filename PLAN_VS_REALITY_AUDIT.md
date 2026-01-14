# CreatorX Plan vs Reality Audit

## Executive Summary
- Biggest gaps: mobile auth is still mocked, pagination response shape mismatches break list screens, messaging is off by default, KYC is UI-only, social connect OAuth start is missing, withdrawals are hard-disabled in mobile UI.
- Default feature flags (mobile): ON = `USE_API_CAMPAIGNS`, `USE_API_APPLICATIONS`, `USE_API_DELIVERABLES`, `USE_API_WALLET`, `USE_API_NOTIFICATIONS`; OFF = `USE_API_AUTH`, `USE_API_MESSAGING`, `USE_WS_MESSAGING`, `USE_WS_MESSAGES`, `USE_API_PROFILE` in `src/config/featureFlags.ts`.
- Dashboard message flags: `USE_POLLING_MESSAGES=true`, `USE_WS_MESSAGES=false` in `brand-dashboard/lib/config/featureFlags.ts` and `admin-dashboard/lib/config/featureFlags.ts`.
- Backend platform defaults: `FEATURE_CAMPAIGN_PREAPPROVAL=true`, `FEATURE_WITHDRAWALS_ENABLED=true`, `FEATURE_CATEGORY_ENFORCEMENT=false` in `backend/creatorx-service/src/main/java/com/creatorx/service/PlatformSettingsResolver.java`.
- Screens ignoring flags: `app/(auth)/login-otp.tsx` (OTP mock), `app/(auth)/onboarding-social.tsx`, `app/(app)/(tabs)/profile.tsx`, `app/(app)/media-kit.tsx` (social connect without a flag), `app/(app)/withdraw.tsx` and `app/(app)/(tabs)/wallet.tsx` (withdrawals disabled regardless of backend settings).
- UI-only screens are NOT DONE by definition.

## Inventory

### Expo routes (app/)
REAL
- `app/(app)/(tabs)/explore.tsx`
- `app/(app)/campaign-details.tsx`
- `app/(app)/apply-to-campaign.tsx`
- `app/(app)/saved.tsx`
- `app/(app)/notifications.tsx`
- `app/(app)/transaction-detail.tsx`

PARTIAL
- `app/(auth)/onboarding-social.tsx`
- `app/(app)/media-kit.tsx`
- `app/(app)/withdraw.tsx`
- `app/(app)/(tabs)/wallet.tsx`
- `app/(app)/(tabs)/chat.tsx`
- `app/(app)/conversation.tsx`
- `app/(app)/new-message.tsx`
- `app/(app)/(tabs)/profile.tsx`
- `app/(app)/edit-profile.tsx`
- `app/(app)/(tabs)/active-campaigns.tsx`

UI-ONLY (NOT DONE)
- `app/index.tsx`
- `app/_layout.tsx`
- `app/_dev/reset-onboarding.tsx`
- `app/(auth)/welcome.tsx`
- `app/(auth)/login-otp.tsx`
- `app/(auth)/onboarding-form.tsx`
- `app/(auth)/onboarding-commercial.tsx`
- `app/(auth)/_layout.tsx`
- `app/(app)/analytics.tsx`
- `app/(app)/event-details.tsx`
- `app/(app)/documents.tsx`
- `app/(app)/refer-earn.tsx`
- `app/(app)/my-docs.tsx`
- `app/(app)/help.tsx`
- `app/(app)/privacy.tsx`
- `app/(app)/kyc.tsx`
- `app/(app)/_layout.tsx`
- `app/(app)/(tabs)/more.tsx`
- `app/(app)/(tabs)/index.tsx`
- `app/(app)/(tabs)/_layout.tsx`
- `app/_layout.supabase.tsx.example`

### Backend controllers/endpoints
Campaigns
- `backend/creatorx-api/src/main/java/com/creatorx/api/controller/CampaignController.java`
  - `getCampaigns` GET `/api/v1/campaigns`
  - `getCampaignById` GET `/api/v1/campaigns/{id}`
  - `createCampaign` POST `/api/v1/campaigns`
  - `updateCampaign` PUT `/api/v1/campaigns/{id}`
  - `deleteCampaign` DELETE `/api/v1/campaigns/{id}`
  - `saveCampaign` POST `/api/v1/campaigns/{id}/save`
  - `unsaveCampaign` DELETE `/api/v1/campaigns/{id}/save`
  - `getSavedCampaigns` GET `/api/v1/campaigns/saved`
  - `searchCampaigns` GET `/api/v1/campaigns/search`
  - `getActiveCampaigns` GET `/api/v1/campaigns/active`
  - `inviteCreator` POST `/api/v1/campaigns/{id}/invite`
  - `getCampaignDeliverables` GET `/api/v1/campaigns/{id}/deliverables`
  - `getCampaignApplications` GET `/api/v1/campaigns/{id}/applications`
- `backend/creatorx-api/src/main/java/com/creatorx/api/controller/CampaignAnalyticsController.java` GET `/api/v1/campaigns/{id}/analytics`
- `backend/creatorx-api/src/main/java/com/creatorx/api/controller/CampaignTemplateController.java` CRUD `/api/v1/campaign-templates`
- `backend/creatorx-api/src/main/java/com/creatorx/api/controller/AdminCampaignManagementController.java` (admin)
  - Campaign CRUD `/api/v1/admin/campaign-management`
  - Applications list/update `/api/v1/admin/campaign-management/applications*`
  - Deliverables list/review `/api/v1/admin/campaign-management/deliverables*`
  - Templates `/api/v1/admin/campaign-management/templates*`

Applications
- `backend/creatorx-api/src/main/java/com/creatorx/api/controller/ApplicationController.java`
  - `submitApplication` POST `/api/v1/applications`
  - `getApplications` GET `/api/v1/applications`
  - `getApplicationById` GET `/api/v1/applications/{id}`
  - `withdrawApplication` DELETE `/api/v1/applications/{id}`
  - `shortlistApplication` POST `/api/v1/applications/{id}/shortlist`
  - `selectApplication` POST `/api/v1/applications/{id}/select`
  - `rejectApplication` POST `/api/v1/applications/{id}/reject`
  - `updateApplicationStatus` PUT `/api/v1/applications/{id}/status`
  - `bulkUpdateStatus` POST `/api/v1/applications/bulk-status`
- `backend/creatorx-api/src/main/java/com/creatorx/api/controller/AdminCampaignManagementController.java` (admin list/status via `/api/v1/admin/campaign-management/applications*`)

Deliverables
- `backend/creatorx-api/src/main/java/com/creatorx/api/controller/DeliverableController.java`
  - `getDeliverables` GET `/api/v1/deliverables`
  - `submitDeliverable` POST `/api/v1/deliverables` (multipart)
  - `resubmitDeliverable` PUT `/api/v1/deliverables/{id}` (multipart)
  - `getDeliverableHistory` GET `/api/v1/deliverables/{id}/history`
  - `reviewDeliverable` POST `/api/v1/deliverables/{id}/review`
- `backend/creatorx-api/src/main/java/com/creatorx/api/controller/AdminCampaignManagementController.java` (admin list/review)

Notifications
- `backend/creatorx-api/src/main/java/com/creatorx/api/controller/NotificationController.java`
  - GET `/api/v1/notifications`
  - PUT `/api/v1/notifications/{id}/read`
  - PUT `/api/v1/notifications/read-all`
  - GET `/api/v1/notifications/unread-count`
  - POST `/api/v1/notifications/register-device`
  - DELETE `/api/v1/notifications/unregister-device/{deviceId}`

Wallet
- `backend/creatorx-api/src/main/java/com/creatorx/api/controller/WalletController.java`
  - GET `/api/v1/wallet`
  - GET `/api/v1/wallet/transactions`
  - POST `/api/v1/wallet/withdraw`
  - GET `/api/v1/wallet/withdrawals`
  - DELETE `/api/v1/wallet/withdrawals/{id}`
  - GET/POST/DELETE/PUT `/api/v1/wallet/bank-accounts*`

Messaging
- `backend/creatorx-api/src/main/java/com/creatorx/api/controller/ConversationController.java`
  - GET `/api/v1/conversations`
  - GET `/api/v1/conversations/{id}/messages`
  - POST `/api/v1/conversations/{id}/messages`
  - PUT `/api/v1/conversations/{id}/mark-read`
  - GET `/api/v1/conversations/application/{applicationId}`
  - GET `/api/v1/conversations/unread-count`
- `backend/creatorx-api/src/main/java/com/creatorx/api/controller/MessageController.java`
  - REST `/api/v1/messages/*` + WS `/app/chat.send`
- `backend/creatorx-api/src/main/java/com/creatorx/api/controller/AdminMessageController.java` (admin)
  - GET `/api/v1/admin/messages/conversations`
  - GET `/api/v1/admin/messages/conversations/{conversationId}/messages`
  - POST `/api/v1/admin/messages/conversations/{conversationId}/messages`

KYC
- `backend/creatorx-api/src/main/java/com/creatorx/api/controller/KYCController.java`
  - POST `/api/v1/kyc/submit` (multipart)
  - GET `/api/v1/kyc/status`
  - GET `/api/v1/kyc/documents`
  - GET `/api/v1/kyc/pending` (admin)
  - POST `/api/v1/kyc/documents/bulk-review` (admin)
  - PUT `/api/v1/kyc/documents/{id}/approve|reject` (admin)

Social accounts
- `backend/creatorx-api/src/main/java/com/creatorx/api/controller/SocialAccountController.java`
  - GET `/api/v1/creator/social-accounts`
  - POST `/api/v1/creator/social-accounts/{provider}/refresh`
  - POST `/api/v1/creator/social-accounts/{provider}/disconnect`
- Missing: OAuth start/callback for `/api/v1/social/connect/{provider}/start`

### Dashboard pages + API services
Brand dashboard
- Auth: `brand-dashboard/app/(auth)/login/page.tsx`, `brand-dashboard/app/(auth)/register/page.tsx` -> `brand-dashboard/lib/services/auth-service.ts` (wraps `brand-dashboard/lib/api/auth.ts`).
- Dashboard: `brand-dashboard/app/(dashboard)/dashboard/page.tsx` -> `useCampaigns` (`brand-dashboard/lib/api/campaigns.ts`), `useCreators` (`brand-dashboard/lib/api/creators.ts`), `useTransactions` (`brand-dashboard/lib/api/payments.ts`), `deliverableService` (`brand-dashboard/lib/api/deliverables.ts`).
- Campaigns: `brand-dashboard/app/(dashboard)/campaigns/page.tsx` -> `useCampaigns`; `brand-dashboard/app/(dashboard)/campaigns/new/page.tsx` -> `useCreateCampaign` + `useTemplates` (`brand-dashboard/lib/api/templates.ts`); `brand-dashboard/app/(dashboard)/campaigns/templates/page.tsx` -> `useTemplates`.
- Campaign detail: `brand-dashboard/app/(dashboard)/campaigns/[id]/applications/page.tsx` -> `applicationService` + `messageService`; `brand-dashboard/app/(dashboard)/campaigns/[id]/deliverables/page.tsx` -> `deliverableService`; `brand-dashboard/app/(dashboard)/campaigns/[id]/analytics/page.tsx` -> `analyticsService` (`brand-dashboard/lib/api/analytics.ts`).
- Applications: `brand-dashboard/app/(dashboard)/applications/page.tsx` -> `applicationService`.
- Deliverables: `brand-dashboard/app/(dashboard)/deliverables/page.tsx` -> `deliverableService`.
- Messaging: `brand-dashboard/app/(dashboard)/messages/page.tsx` -> `messageService` (`brand-dashboard/lib/api/messages.ts`).
- Creators: `brand-dashboard/app/(dashboard)/creators/page.tsx`, `brand-dashboard/app/(dashboard)/creators/[id]/page.tsx` -> `useCreators`/`useInviteCreator` (`brand-dashboard/lib/api/creators.ts`).
- Profile/Settings: `brand-dashboard/app/(dashboard)/profile/page.tsx` -> `useProfile` (`brand-dashboard/lib/api/profile.ts`); `brand-dashboard/app/(dashboard)/settings/page.tsx` -> `useTeamMembers`, `useBrandVerification` (`brand-dashboard/lib/api/brand-verification.ts`).
- Payments: `brand-dashboard/app/(dashboard)/payments/page.tsx` -> `paymentService` (`brand-dashboard/lib/api/payments.ts` -> wallet endpoints).
- UI-only: `brand-dashboard/app/(dashboard)/lists/page.tsx`, `brand-dashboard/app/(dashboard)/help/page.tsx`, `brand-dashboard/app/(dashboard)/youtube/page.tsx`, `brand-dashboard/app/(dashboard)/facebook/page.tsx`, `brand-dashboard/app/(dashboard)/instagram/page.tsx`.
- Admin pages (brand dashboard): `brand-dashboard/app/(admin)/admin/*.tsx` -> `brand-dashboard/lib/api/admin/*` (settings/audit/finance/compliance/disputes/moderation/campaigns/appeals/users/brands/kyc/system).

Admin dashboard
- Auth: `admin-dashboard/app/(auth)/login/page.tsx`, `admin-dashboard/app/(auth)/register/page.tsx` -> `admin-dashboard/lib/services/auth-service.ts` (wraps `admin-dashboard/lib/api/auth.ts`).
- Dashboard: `admin-dashboard/app/(dashboard)/dashboard/page.tsx` -> `useCampaigns`, `useTemplates`, `usePayments` (`admin-dashboard/lib/api/campaigns.ts`, `admin-dashboard/lib/api/templates.ts`, `admin-dashboard/lib/api/payments.ts`).
- Campaigns: `admin-dashboard/app/(dashboard)/campaigns/page.tsx`, `admin-dashboard/app/(dashboard)/campaigns/new/page.tsx`, `admin-dashboard/app/(dashboard)/campaigns/templates/page.tsx` -> campaigns/templates APIs.
- Campaign detail: `admin-dashboard/app/(dashboard)/campaigns/[id]/applications/page.tsx` -> `applicationService` + `messageService`; `admin-dashboard/app/(dashboard)/campaigns/[id]/deliverables/page.tsx` -> `deliverableService`; `admin-dashboard/app/(dashboard)/campaigns/[id]/analytics/page.tsx` -> `analyticsService`.
- Deliverables/Messages: `admin-dashboard/app/(dashboard)/deliverables/page.tsx` -> `deliverableService`; `admin-dashboard/app/(dashboard)/messages/page.tsx` -> `messageService`.
- Creators/Profile/Settings/Payments: `admin-dashboard/app/(dashboard)/creators/page.tsx`, `admin-dashboard/app/(dashboard)/creators/[id]/page.tsx` -> creators API; `admin-dashboard/app/(dashboard)/profile/page.tsx` -> profile API; `admin-dashboard/app/(dashboard)/settings/page.tsx` -> team members API; `admin-dashboard/app/(dashboard)/payments/page.tsx` -> payments API.
- UI-only: `admin-dashboard/app/(dashboard)/lists/page.tsx`, `admin-dashboard/app/(dashboard)/help/page.tsx`, `admin-dashboard/app/(dashboard)/youtube/page.tsx`, `admin-dashboard/app/(dashboard)/facebook/page.tsx`, `admin-dashboard/app/(dashboard)/instagram/page.tsx`.
- Admin ops: `admin-dashboard/app/(admin)/admin/*.tsx` -> `admin-dashboard/lib/api/admin/*` (messages, campaigns, campaign-management, campaign-reviews, users, profiles, brands, kyc, disputes, appeals, moderation, compliance, compliance-reports, permissions, settings, audit, finance, system, health).

## Contract Alignment
- Messaging: Mobile + dashboards call `/api/v1/conversations/*` via `src/api/services/messagingService.ts`, `brand-dashboard/lib/api/messages.ts`, `admin-dashboard/lib/api/messages.ts`. Backend supports `/api/v1/conversations/*` plus a parallel `/api/v1/messages/*` in `backend/creatorx-api/src/main/java/com/creatorx/api/controller/MessageController.java`. Canonical for clients is `/conversations`; keep `/messages` as optional compatibility or deprecate. Admin uses `/api/v1/admin/messages/*` in `admin-dashboard/lib/api/admin/messages.ts`.
- Notifications: HTTP methods align (PUT `/read`, PUT `/read-all`). Unread count refresh is called on app resume and after mark read in `src/context/AppContext.api.tsx`. Response shape mismatch: clients expect `{ items, page, size, total }` (see `src/context/AppContext.api.tsx:fetchNotifications`) while backend returns Spring `Page` (`content`, `totalElements`).
- Deliverables: Multipart fields match (`file`, `applicationId`, `campaignDeliverableId`, `description`) in `src/api/services/deliverableService.ts` vs `backend/creatorx-api/src/main/java/com/creatorx/api/controller/DeliverableController.java`. List shape mismatch: mobile expects `PaginatedResponse` but backend returns `List<DeliverableDTO>`; app never calls `deliverableService.getDeliverables` (no fetch in `src/context/AppContext.api.tsx`).
- Wallet: Mobile/dashboards expect `items/total` in `src/context/AppContext.api.tsx` and `brand-dashboard/lib/api/payments.ts` while backend returns Spring `Page`. `hasMore` logic assumes `items` length + `total`. Withdrawals are hard-disabled in `app/(app)/withdraw.tsx` and `app/(app)/(tabs)/wallet.tsx` even though backend defaults `FEATURE_WITHDRAWALS_ENABLED=true`.

## Plan vs Reality Matrix

| Module | Plan requirement | Mobile status | Backend status | Brand status | Admin status | E2E verified? | Blockers + exact missing work |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Auth | Supabase auth, JWT, no mock login | Partial - OTP mock + `devLogin` in `app/(auth)/login-otp.tsx`, `USE_API_AUTH` off | Partial - `AuthController` supports link/me but `/auth/login` throws | Partial - demo mode via `brand-dashboard/lib/api/auth.ts` | Partial - same as brand | N | Replace OTP mock, rely on Supabase session + `/auth/link-supabase-user`, enable `USE_API_AUTH` |
| Campaign discovery + apply | Browse/search/save/apply; brand create/manage; admin manage | Partial - APIs on but pagination mismatch and auth mock | Done - controllers exist | Partial - dashboards expect `items` not `content` | Partial - same mismatch on admin lists | N | Normalize pagination response or add client adapters; unblock auth |
| Deliverables | Submit/resubmit, brand review, creator mark posted | Partial - submit only, list/review/posted are local | Partial - submit/resubmit/review done, no posted endpoint | Partial - review/list wired via `lib/api/deliverables.ts` | Partial - admin list/review wired | N | Add deliverables list fetch + posted endpoint; update client state |
| Notifications | Paginated list + read/unread | Partial - methods correct but response shape mismatch | Done - controller complete | Missing - no notification UI | Missing | N | Fix response shape or client parsing; add dashboard UI if required |
| Wallet | Balance + transactions + withdrawals with gating | Partial - pagination mismatch + withdrawals disabled in UI | Partial - endpoints exist, gating only in backend | Partial - `lib/api/payments.ts` maps to wallet | Partial - admin finance only | N | Expose/consume withdrawals flag and fix pagination parsing |
| Messaging | Conversations + messages + unread count (polling/WS) | Partial - `USE_API_MESSAGING` off by default | Done - conversations/messages + WS | Partial - API wired | Partial - admin messaging wired | N | Enable messaging flag + ensure conversation polling/WS flows |
| Profile + MediaKit | Profile CRUD + media kit data | Partial - AsyncStorage only, `USE_API_PROFILE` off | Done - profile endpoints exist | Partial - profile/team endpoints used | Partial - admin profile endpoints used | N | Wire profile endpoints in mobile and remove local-only persistence |
| KYC | Document upload + status + admin review | UI-only - `app/(app)/kyc.tsx` local | Done - `/api/v1/kyc/*` | N/A | Partial - admin KYC page wired | N | Wire mobile KYC submit/status/documents to API |
| Social Connect | OAuth connect + refresh/disconnect + metrics | Partial - metadata/refresh ok, connect URL missing | Partial - no `/social/connect/*` controller | N/A | N/A | N | Add OAuth start/callback endpoints or change connect URL |

## Top 10 Next Tasks

1) Normalize pagination responses to `{ items, page, size, total }` or add client adapters.
- What to change: Introduce a shared `PageResponse` DTO in backend or update client adapters to map Spring `Page` to `items`.
- Exact files: `backend/creatorx-api/src/main/java/com/creatorx/api/controller/CampaignController.java`, `backend/creatorx-api/src/main/java/com/creatorx/api/controller/ApplicationController.java`, `backend/creatorx-api/src/main/java/com/creatorx/api/controller/NotificationController.java`, `backend/creatorx-api/src/main/java/com/creatorx/api/controller/WalletController.java`, `src/context/AppContext.api.tsx`, `src/api/adapters/index.ts`, `brand-dashboard/lib/api/client.ts`, `admin-dashboard/lib/api/client.ts`.
- Endpoints: `/api/v1/campaigns`, `/api/v1/applications`, `/api/v1/notifications`, `/api/v1/wallet/transactions`, `/api/v1/wallet/withdrawals`.
- Acceptance test steps: call each endpoint and verify `{ items, page, size, total }`; mobile Explore/Wallet + dashboards list views render and paginate without errors.

2) Replace OTP mock login with Supabase sign-in and enable `USE_API_AUTH`.
- What to change: Remove `otpMock` + `devLogin`, use Supabase session + `/auth/link-supabase-user`, then `/auth/me`.
- Exact files: `app/(auth)/login-otp.tsx`, `src/context/AuthContext.tsx`, `src/services/otpMock.ts`, `src/config/featureFlags.ts`.
- Endpoints: `/api/v1/auth/link-supabase-user`, `/api/v1/auth/me`.
- Acceptance test steps: login via Supabase, token stored, open Explore and saved campaigns load without auth errors.

3) Enable messaging API by default and validate conversation polling.
- What to change: flip `USE_API_MESSAGING` default to true, ensure `fetchConversations` and `fetchMessages` run on Chat tab.
- Exact files: `src/config/featureFlags.ts`, `src/context/AppContext.api.tsx`, `app/(app)/(tabs)/chat.tsx`.
- Endpoints: `/api/v1/conversations`, `/api/v1/conversations/{id}/messages`, `/api/v1/conversations/{id}/mark-read`.
- Acceptance test steps: chat list loads, open conversation, send message, unread count clears.

4) Add social connect OAuth start/callback endpoints (or update mobile URL).
- What to change: implement `/api/v1/social/connect/{provider}/start` + callback to store tokens; ensure `socialConnectService.getConnectUrl` matches.
- Exact files: `backend/creatorx-api/src/main/java/com/creatorx/api/controller/SocialConnectController.java` (new), `backend/creatorx-service/src/main/java/com/creatorx/service/SocialAccountService.java`, `src/api/services/socialConnectService.ts`.
- Endpoints: `/api/v1/social/connect/{provider}/start`, `/api/v1/social/connect/{provider}/callback`.
- Acceptance test steps: tap Connect in `app/(auth)/onboarding-social.tsx`, complete OAuth, social accounts show CONNECTED.

5) Wire KYC screen to backend.
- What to change: submit KYC via multipart; render backend status and documents.
- Exact files: `app/(app)/kyc.tsx`, `src/api/services/kycService.ts`, `src/context/AppContext.api.tsx`.
- Endpoints: `/api/v1/kyc/submit`, `/api/v1/kyc/status`, `/api/v1/kyc/documents`.
- Acceptance test steps: upload document -> status PENDING; admin approves -> status APPROVED in mobile.

6) Add deliverables list fetch + posted endpoint.
- What to change: call `deliverableService.getDeliverables` in AppContext, add backend `/deliverables/{id}/posted` or equivalent, wire `markDeliverablePosted` to API.
- Exact files: `src/context/AppContext.api.tsx`, `src/api/services/deliverableService.ts`, `backend/creatorx-api/src/main/java/com/creatorx/api/controller/DeliverableController.java`, `backend/creatorx-service/src/main/java/com/creatorx/service/DeliverableService.java`.
- Endpoints: `/api/v1/deliverables`, `/api/v1/deliverables/{id}/review`, new `/api/v1/deliverables/{id}/posted`.
- Acceptance test steps: creator sees deliverables list, submits file, brand reviews, creator marks posted and status updates.

7) Align wallet withdrawals gating with platform settings.
- What to change: expose withdrawal eligibility (flag + payout window) to clients; remove hardcoded disable in mobile UI.
- Exact files: `app/(app)/(tabs)/wallet.tsx`, `app/(app)/withdraw.tsx`, `backend/creatorx-service/src/main/java/com/creatorx/service/PlatformSettingsResolver.java`, `backend/creatorx-api/src/main/java/com/creatorx/api/controller/AdminSettingsController.java`.
- Endpoints: `/api/v1/admin/settings`, `/api/v1/wallet/withdraw`.
- Acceptance test steps: toggle `FEATURE_WITHDRAWALS_ENABLED`; verify Withdraw button enabled/disabled and request creates a withdrawal.

8) Fix notifications list parsing.
- What to change: adjust client to handle Spring `Page` (`content`) or update backend to return `{ items }`.
- Exact files: `src/context/AppContext.api.tsx`, `src/api/services/notificationService.ts`, `backend/creatorx-api/src/main/java/com/creatorx/api/controller/NotificationController.java`.
- Endpoints: `/api/v1/notifications`.
- Acceptance test steps: notifications list loads, mark read updates unread count, no runtime errors.

9) Formalize canonical messaging routes.
- What to change: decide `/api/v1/conversations/*` vs `/api/v1/messages/*`, update docs and clients; keep compatibility controller if needed.
- Exact files: `backend/creatorx-api/src/main/java/com/creatorx/api/controller/ConversationController.java`, `backend/creatorx-api/src/main/java/com/creatorx/api/controller/MessageController.java`, `src/api/services/messagingService.ts`, `brand-dashboard/lib/api/messages.ts`, `admin-dashboard/lib/api/messages.ts`.
- Endpoints: `/api/v1/conversations/*`, `/api/v1/messages/*`.
- Acceptance test steps: all messaging clients use the same route set and work without 404s.

10) Sync profile/media kit with backend profile endpoints.
- What to change: replace AsyncStorage-only profile state with API-backed profile and media kit data.
- Exact files: `app/(app)/(tabs)/profile.tsx`, `app/(app)/edit-profile.tsx`, `app/(app)/media-kit.tsx`, `src/api/services/profileService.ts`, `src/context/AppContext.api.tsx`.
- Endpoints: `/api/v1/profile`, `/api/v1/profile/creator`, `/api/v1/profile/avatar`.
- Acceptance test steps: update profile, restart app, data reloads from API.

## CI Diagnosis
- Workflows checked: `.github/workflows/backend-tests.yml`, `.github/workflows/ci-cd.yml`.
- No CI test logs or `build/test-results` XMLs are present in repo; unable to identify specific failing tests from artifacts.
- Minimal patch plan to make CI green: run `./backend/gradlew test` and `./backend/gradlew build` locally to surface exact failures; then fix failing tests based on the output and re-run. Current repo contains no obvious compile-time blockers in CI configs.

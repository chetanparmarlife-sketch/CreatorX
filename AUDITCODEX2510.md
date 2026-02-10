# CreatorX Audit Report (AUDITCODEX2510)

Date: 2026-01-25

This report summarizes the current code audit focusing on runtime source files
(Java, TS/TSX, JS). Markdown files and binaries/generated assets were excluded.

Scope includes:
- Mobile app: app/** and src/**
- Backend: backend/creatorx-api/**, backend/creatorx-service/**, backend/creatorx-repository/**, backend/creatorx-common/**
- Dashboards: admin-dashboard/**, brand-dashboard/**
- Infra/scripts: infra/**, scripts/** (not yet reviewed in depth)

Excluded:
- *.md (per request)
- Binaries/generated: backend/gradle-8.5/**, dist_web/**, attached_assets/**, *.jar, *.class, images, etc.


## 1) Critical Findings (Blocking / Auth / Data Integrity)

1. Authentication principal mismatch breaks user resolution across many controllers.
   - SupabaseJwtAuthenticationFilter sets principal to User object, but several
     controllers use authentication.getName() as if it were a userId.
   - This results in lookups using User.toString() and likely "User not found"
     or permission failures for notifications, deliverables, KYC, conversations, etc.
   - Files:
     - backend/creatorx-api/src/main/java/com/creatorx/api/security/SupabaseJwtAuthenticationFilter.java
     - backend/creatorx-api/src/main/java/com/creatorx/api/controller/DeliverableController.java
     - backend/creatorx-api/src/main/java/com/creatorx/api/controller/NotificationController.java
     - backend/creatorx-api/src/main/java/com/creatorx/api/controller/KYCController.java
     - backend/creatorx-api/src/main/java/com/creatorx/api/controller/ConversationController.java

2. Backend auth endpoints do not match frontend/admin expectations.
   - /auth/login throws unconditionally. /auth/refresh-token, /auth/logout,
     /auth/forgot-password, /auth/verify-otp do not exist.
   - Admin and Brand dashboards expect backend JWT auth but backend is Supabase-only.
   - Files:
     - backend/creatorx-api/src/main/java/com/creatorx/api/controller/AuthController.java
     - src/api/services/authService.ts
     - admin-dashboard/lib/api/auth.ts
     - admin-dashboard/lib/api/client.ts

3. Auth response shape mismatch between backend and frontend.
   - Frontend expects { accessToken, refreshToken, user } but backend returns
     flat fields { userId, email, role, ... } with optional tokens.
   - This breaks user linking in AuthContext and any API-auth usage.
   - Files:
     - backend/creatorx-api/src/main/java/com/creatorx/api/dto/AuthResponse.java
     - src/api/types.ts
     - src/context/AuthContext.tsx

4. KYC API contract mismatch (payload + endpoints).
   - Mobile submits /kyc/submit with "file" only and calls
     /kyc/documents/{id} + /kyc/documents/{id}/resubmit.
   - Backend expects frontImage/backImage parts and has no
     /kyc/documents/{id} or /resubmit endpoints.
   - Files:
     - src/api/services/kycService.ts
     - backend/creatorx-api/src/main/java/com/creatorx/api/controller/KYCController.java

5. Profile upload contract mismatch.
   - /profile/avatar returns raw string in backend but frontend expects { avatarUrl }.
   - Portfolio upload expects "media" in backend but frontend sends "file".
   - Files:
     - backend/creatorx-api/src/main/java/com/creatorx/api/controller/ProfileController.java
     - src/api/services/profileService.ts


## 2) High / Medium Findings

1. Campaign search parameter mismatch.
   - Frontend uses /campaigns?query=... but backend uses /campaigns?search=...
     and also supports /campaigns/search?query=...
   - Files:
     - src/api/services/campaignService.ts
     - backend/creatorx-api/src/main/java/com/creatorx/api/controller/CampaignController.java

2. Wallet/transaction DTO mismatch.
   - Frontend expects WalletDTO with balance/availableBalance/pendingBalance
     and TransactionDTO type CREDIT/DEBIT. Backend returns different shapes/types.
   - This breaks wallet UI filters and summaries.
   - Files:
     - src/api/services/walletService.ts
     - backend/creatorx-service/src/main/java/com/creatorx/service/dto/WalletDTO.java
     - backend/creatorx-service/src/main/java/com/creatorx/service/dto/TransactionDTO.java
     - backend/creatorx-service/src/main/java/com/creatorx/service/dto/WithdrawalDTO.java

3. Pagination mismatch.
   - Frontend Page<T> expects totalPages; backend PageResponse returns hasMore only.
   - Files:
     - src/api/types.ts
     - backend/creatorx-api/src/main/java/com/creatorx/api/dto/PageResponse.java

4. Referral feature has no backend endpoints.
   - Mobile calls /referrals/* but backend exposes none.
   - Files:
     - src/api/services/referralService.ts

5. TODOs indicate incomplete flows (escrow crediting, creator discovery stats,
   notification on KYC submit, etc).
   - Files:
     - backend/creatorx-service/src/main/java/com/creatorx/service/PaymentCollectionService.java
     - backend/creatorx-service/src/main/java/com/creatorx/service/CreatorDiscoveryService.java
     - backend/creatorx-service/src/main/java/com/creatorx/service/KYCService.java


## 3) Backend-to-Frontend API Mapping (Observed)

Auth
- Mobile: src/api/services/authService.ts
  - /auth/register, /auth/login, /auth/refresh-token, /auth/logout, /auth/forgot-password, /auth/verify-otp
  - /auth/link-supabase-user
- Backend: backend/creatorx-api/.../AuthController.java
  - /auth/register, /auth/link-supabase-user, /auth/login (throws), /auth/me, /auth/verify-email, /auth/verify-phone
  - Missing /refresh-token, /logout, /forgot-password, /verify-otp

Campaigns
- Mobile: src/api/services/campaignService.ts
  - GET /campaigns, /campaigns/{id}, /campaigns/saved, /campaigns/active
  - POST /campaigns/{id}/save, DELETE /campaigns/{id}/save
  - Search uses /campaigns?query=...
- Backend: backend/creatorx-api/.../CampaignController.java
  - GET /campaigns (filters: search), GET /campaigns/search?query=...
  - POST/PUT/DELETE /campaigns (brand)
  - GET /campaigns/{id}/applications, /deliverables (brand)

Applications
- Mobile: src/api/services/applicationService.ts
  - POST /applications, GET /applications, GET /applications/{id}, DELETE /applications/{id}
- Backend: backend/creatorx-api/.../ApplicationController.java
  - Matching endpoints plus brand status actions:
    /applications/{id}/shortlist, /select, /reject, /bulk-status, /status

Deliverables
- Mobile: src/api/services/deliverableService.ts
  - GET /deliverables
  - POST /deliverables (multipart file)
  - PUT /deliverables/{id} (resubmit)
  - GET /deliverables/{id}/history
- Backend: backend/creatorx-api/.../DeliverableController.java
  - Matching endpoints. Role-sensitive. Uses authentication.getName() for id.

Messaging
- Mobile: src/api/services/messagingService.ts
  - GET /conversations
  - GET /conversations/{id}/messages
  - POST /conversations/{id}/messages
  - PUT /conversations/{id}/mark-read
- Backend: backend/creatorx-api/.../ConversationController.java
  - Compatibility layer for conversations that proxies to message service.

Notifications
- Mobile: src/api/services/notificationService.ts
  - GET /notifications, PUT /notifications/{id}/read, PUT /notifications/read-all,
    GET /notifications/unread-count
- Backend: backend/creatorx-api/.../NotificationController.java
  - Matching endpoints.

Profile
- Mobile: src/api/services/profileService.ts
  - GET/PUT /profile, POST /profile/avatar, GET/POST /profile/portfolio
- Backend: backend/creatorx-api/.../ProfileController.java
  - Matching endpoints but response shapes and multipart field names differ.

Storage
- Mobile: src/api/services/storageService.ts
  - POST /storage/upload/{type}, DELETE /storage/delete, GET /storage/signed-url
- Backend: backend/creatorx-api/.../StorageController.java
  - Matching endpoints. Note delete has no ownership checks.

Social Connect
- Mobile: src/api/services/socialConnectService.ts
  - GET /creator/social-accounts
  - POST /creator/social-accounts/{provider}/refresh
  - POST /creator/social-accounts/{provider}/disconnect
  - GET /social/connect/{provider}/start (browser)
- Backend:
  - SocialAccountController + SocialConnectController (endpoints exist).

KYC
- Mobile: src/api/services/kycService.ts
  - POST /kyc/submit (file), GET /kyc/status, GET /kyc/documents/{id}, POST /kyc/documents/{id}/resubmit
- Backend: backend/creatorx-api/.../KYCController.java
  - POST /kyc/submit expects frontImage/backImage
  - GET /kyc/status, GET /kyc/documents
  - No per-document GET or resubmit

Referrals
- Mobile: src/api/services/referralService.ts -> /referrals/*
- Backend: no matching controller


## 4) Business Logic + Lifecycle Overview

User Auth (Mobile)
1) Supabase sign up/sign in (client-side).
2) App links Supabase user to backend with /auth/link-supabase-user.
3) Backend creates/links User and BrandProfile for brands.
4) Mobile stores backend user ID (expected, but response shape mismatch blocks).
Files:
- src/context/AuthContext.tsx
- backend/creatorx-service/src/main/java/com/creatorx/service/AuthService.java

Campaign Lifecycle (Brand -> Admin -> Creator)
1) Brand creates campaign (PENDING_REVIEW).
2) Admin approves -> ACTIVE, or rejects.
3) Creators discover campaigns and apply.
4) Brand shortlists/selects creators; selection creates conversation.
Files:
- backend/creatorx-api/src/main/java/com/creatorx/api/controller/CampaignController.java
- backend/creatorx-service/src/main/java/com/creatorx/service/CampaignService.java
- backend/creatorx-service/src/main/java/com/creatorx/service/ApplicationService.java

Application Lifecycle
- APPLIED -> SHORTLISTED -> SELECTED -> (conversation created)
- REJECTED or WITHDRAWN
Rules:
- Creator must be KYC-verified to apply.
- Max 50 active applications.
Files:
- backend/creatorx-service/src/main/java/com/creatorx/service/ApplicationService.java

Deliverables Lifecycle
- Creator submits deliverable for selected application.
- Brand reviews: APPROVED / REVISION_REQUESTED / REJECTED.
- Resubmission allowed after revision.
Files:
- backend/creatorx-service/src/main/java/com/creatorx/service/DeliverableService.java
- backend/creatorx-common/src/main/java/com/creatorx/common/enums/SubmissionStatus.java

Wallet + Payout Lifecycle
- Wallet has available/pending balances.
- Withdrawals enforce:
  - min 100.00 INR
  - max 50,000.00 per transaction
  - max 200,000.00 per month
  - verified bank account required
Files:
- backend/creatorx-service/src/main/java/com/creatorx/service/WithdrawalService.java
- backend/creatorx-service/src/main/java/com/creatorx/service/WalletService.java

KYC Lifecycle
- User submits KYC doc.
- Admin reviews; status APPROVED/REJECTED.
- ApplicationService requires at least one APPROVED KYC doc to apply.
Files:
- backend/creatorx-service/src/main/java/com/creatorx/service/KYCService.java
- backend/creatorx-service/src/main/java/com/creatorx/service/ApplicationService.java

Messaging Lifecycle
- Conversations created on application selection.
- Messages stored; read markers via REST or WebSocket.
Files:
- backend/creatorx-service/src/main/java/com/creatorx/service/ConversationService.java
- backend/creatorx-service/src/main/java/com/creatorx/service/MessageService.java
- backend/creatorx-api/src/main/java/com/creatorx/api/controller/ConversationController.java


## 5) Data Model Snapshot (Backend Entities)

Major entities (non-exhaustive):
- User, UserProfile, CreatorProfile, BrandProfile
- Campaign, CampaignApplication, CampaignDeliverable, CampaignTemplate
- Application, ApplicationFeedback
- Deliverable, DeliverableSubmission, DeliverableReview
- Conversation, Message
- Wallet, Transaction, WithdrawalRequest, BankAccount
- KYCDocument, BrandVerificationDocument
- Notification, FCMToken
- Dispute, DisputeEvidence, DisputeNote
- AdminPermission, AdminAction, AdminSessionEvent, AdminFeedback

Files:
- backend/creatorx-repository/src/main/java/com/creatorx/repository/entity/*.java


## 6) Dashboard Notes (Initial)

Admin and Brand dashboards both rely on backend JWT auth flows and expect /auth/login,
/auth/refresh-token, /auth/me. Backend does not provide these today.
Files:
- admin-dashboard/lib/api/auth.ts
- admin-dashboard/lib/api/client.ts
- brand-dashboard/lib/api/auth.ts (similar pattern)

Dashboard API wiring not fully audited yet.


## 7) Recommended Next Steps (Priority Order)

1) Fix authentication principal usage across controllers.
   - Use (User) authentication.getPrincipal() consistently to read id/role.
   - Standardize authentication.getName() to userId if needed.

2) Align auth contract:
   - Either implement backend JWT auth endpoints, or remove dashboard expectations
     and enforce Supabase-only auth everywhere.
   - Make AuthResponse shape consistent with frontend types.

3) Align KYC and Profile multipart contracts:
   - Standardize field names (frontImage vs file, media vs file).
   - Add missing KYC endpoints or update frontend to match backend.

4) Normalize DTOs:
   - Wallet, Transaction, Withdrawal, PageResponse fields should match frontend types.

5) Fill missing backend endpoints:
   - Referrals endpoints or remove feature from mobile UI.


## 8) Audit Status

Completed so far:
- Backend API surface + core services deep dive (auth, campaigns, applications, deliverables, wallet, KYC, messaging, notifications, storage, moderation, compliance, disputes).
- Mobile API client + service layer (auth, campaigns, applications, deliverables, wallet, profile, storage, messaging, notifications, KYC).
- Mobile screen audit for wallet and edit-profile.
- Mobile screen audit for all remaining app/(app) and app/(auth) routes.
- Admin dashboard route-level audit and API mapping.
- Brand dashboard route-level audit and API mapping.
- Endpoint usage matrix generated (CSV/JSON).
- Infra/scripts review (deployment scripts, GitHub Actions, Terraform).
- Auth strategy decision + fix-plan outline (Supabase-only).

Pending:
- Backend test coverage and integration-test alignment review.

## 9) Admin Dashboard Audit (API Mapping + UI Flows)

Overview:
- Next.js app with route groups: app/(admin) and app/(dashboard).
- Data access uses React Query + lib/api/* services.
- Auth assumes backend JWT endpoints (login/refresh/me), which are not implemented in the backend.

Primary admin flows (app/(admin)/admin/*):
- Campaign review: /admin/campaign-reviews, /admin/campaign-reviews/[id]
  - adminCampaignReviewService.listPending, approve, reject
- Campaign management: /admin/campaign-management, /admin/campaign-management/[id], /admin/campaign-management/new
  - adminCampaignManagementService list/create/update/delete, inviteCreator,
    list applications/deliverables, review deliverables, bulk status, templates
- Moderation rules + flags: /admin/moderation, /admin/campaigns
  - adminModerationService listRules/testRule/create/delete, listFlags/resolveFlag
- Compliance + GDPR: /admin/compliance, /admin/compliance/reports
  - adminComplianceService list/update/export/anonymize
  - adminComplianceReportService list/generate reports
- Finance + reporting: /admin/finance
  - adminFinanceService summary + reports + export
- Disputes: /admin/disputes, /admin/disputes/[id]
  - adminDisputeService list/assign/resolve + evidence/notes
- KYC: /admin/kyc
  - adminKycService listPending/approve/reject/bulk
- Brand verification: /admin/brands
  - adminBrandVerificationService listPending/review/bulk + detail
- Users/permissions/appeals: /admin/users, /admin/users/[id], /admin/permissions, /admin/appeals
  - adminUserService list/update/resolve
  - adminProfileService update user/brand/creator profiles
  - adminPermissionService list/grant/revoke/replace
- Messages: /admin/messages
  - adminMessageService listConversations/getMessages/sendMessage
- System: /admin, /admin/health
  - adminSystemService getSummary/getHealth/submitFeedback
- Audit logs: /admin/audit
  - adminAuditService list/export

Findings:
- app/(dashboard) routes in admin-dashboard use brand campaign APIs (useCampaigns hooks)
  but the admin auth layer enforces ADMIN-only access. These routes are either
  dead/unreachable or will 403 against backend brand-only endpoints.
- Several admin pages expect data.totalPages or data.content as fallbacks; backend
  PageResponse uses { items, page, size, total, hasMore }. Inconsistent pagination
  handling may break table paging.
- Admin auth assumes /auth/login and /auth/refresh-token exist; backend provides neither.


## 10) Brand Dashboard Audit (API Mapping + UI Flows)

Overview:
- Next.js app with route groups: app/(dashboard) and app/(admin).
- Data access uses React Query + lib/api/* services.
- Auth assumes backend JWT endpoints (login/refresh/me), which are not implemented.

Primary brand flows (app/(dashboard)/*):
- Campaigns: list/create/update/delete
  - campaignService.getCampaigns/getCampaignById/create/update/delete
- Applications: list + status updates
  - applicationService.listApplications/updateStatus/reject/bulk
- Deliverables: review submissions + history
  - deliverableService.list/review/getHistory
- Analytics: /campaigns/[id]/analytics
  - analyticsService.getCampaignAnalytics
- Messages: brand messaging views
  - messagesService list/send
- Payments: paymentsService (collection/reporting)
- Profile: profileService get/update
- Templates: templatesService list/create/update/delete
- Creators: creatorsService discovery/list

Admin-only routes exist inside brand-dashboard (app/(admin)/*):
- audit, compliance, disputes, finance, kyc, moderation, settings, system, users, brands
  - These call admin-style services and should be gated or removed for brand users.

Findings:
- The presence of admin routes inside brand-dashboard is a privilege risk unless
  gated by role at the routing or auth layer.
- Same pagination shape mismatch as admin-dashboard (totalPages/content vs items/hasMore).
- Brand auth relies on backend JWT endpoints that are not implemented.


## 11) Backend Services Deep Dive (Business Logic & Security)

Key observations:
- Authentication principal mismatch (User stored as principal; controllers use authentication.getName())
  breaks permission checks and user lookups across several controllers.
- Storage deletion/signed URL generation accept any fileUrl with the Supabase path
  pattern; there is no ownership validation or domain allowlist check. Combined with
  /storage/delete and /storage/signed-url this allows access/deletion if a user can
  guess or obtain another user's file URL.
  - Files: backend/creatorx-api/src/main/java/com/creatorx/api/controller/StorageController.java
          backend/creatorx-service/src/main/java/com/creatorx/service/storage/SupabaseStorageService.java
- Deliverable history is returned without verifying that the requesting user is a
  participant (creator/brand) for that submission.
  - Files: backend/creatorx-api/src/main/java/com/creatorx/api/controller/DeliverableController.java
          backend/creatorx-service/src/main/java/com/creatorx/service/DeliverableService.java
- Withdrawal approval methods exist in WithdrawalService but no admin API endpoint
  invokes them; payout approvals are effectively unreachable. If later exposed, the
  service does not enforce admin role explicitly (relies on controller to do so).
- ApplicationService enforces KYC verification and max active applications; good.
  However, frontend ApplicationRequest includes fields (expectedTimeline/proposedBudget)
  that are ignored by backend, so data is silently dropped.
- WalletService uses pessimistic locking for credit/debit and records fee metadata; good.


## 12) Mobile Screen Audit (Open Tabs)

app/(app)/(tabs)/wallet.tsx:
- Uses mock invoices and local KYC step state; no API integration for invoices or KYC.
- Uses useApp wallet state; if API is enabled, data shape mismatches with backend
  Transaction/Wallet DTOs will break filters and totals.
- Several actions are stubs: settings button, invoice view/download buttons.
- Mock currency strings contain corrupted INR symbol sequences, indicating
  encoding issues in seed data.

app/(app)/edit-profile.tsx:
- Uses local updateUser without awaiting the async call; UI shows success before
  persistence finishes and errors are not surfaced.
- Avatar change uses ImagePicker but never calls uploadAvatar; updates local uri only.
- Alert.prompt is iOS-only; editing social links is broken on Android.

.vscode/extensions.json:
- Only recommends openai.chatgpt; no runtime impact.


## 13) Endpoint-to-Frontend Usage Matrix (CSV/JSON)

CSV (full matrix):
```csv
"method","path","controller","methodName","mobile","admin_dashboard","brand_dashboard"
"GET","/api/v1/admin/audit","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminAuditController.java","listAuditLogs","","",""
"GET","/api/v1/admin/audit/export","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminAuditController.java","exportAuditLogs","","",""
"GET","/api/v1/admin/campaign-management","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","listCampaigns","","",""
"POST","/api/v1/admin/campaign-management","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","createCampaign","","",""
"DELETE","/api/v1/admin/campaign-management/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","deleteCampaign","","admin-dashboard\lib\api\admin\campaign-management.ts",""
"GET","/api/v1/admin/campaign-management/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","getCampaign","","",""
"PUT","/api/v1/admin/campaign-management/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","updateCampaign","","",""
"GET","/api/v1/admin/campaign-management/{param}/applications","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","listApplications","","",""
"GET","/api/v1/admin/campaign-management/{param}/deliverables","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","listDeliverables","","",""
"POST","/api/v1/admin/campaign-management/{param}/invite","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","inviteCreator","","",""
"GET","/api/v1/admin/campaign-management/applications","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","listAllApplications","","",""
"POST","/api/v1/admin/campaign-management/applications/{param}/reject","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","rejectApplication","","admin-dashboard\lib\api\admin\campaign-management.ts",""
"POST","/api/v1/admin/campaign-management/applications/{param}/select","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","selectApplication","","admin-dashboard\lib\api\admin\campaign-management.ts",""
"POST","/api/v1/admin/campaign-management/applications/{param}/shortlist","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","shortlistApplication","","admin-dashboard\lib\api\admin\campaign-management.ts",""
"PUT","/api/v1/admin/campaign-management/applications/{param}/status","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","updateApplicationStatus","","admin-dashboard\lib\api\admin\campaign-management.ts",""
"POST","/api/v1/admin/campaign-management/applications/bulk-status","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","bulkUpdateApplications","","admin-dashboard\lib\api\admin\campaign-management.ts",""
"GET","/api/v1/admin/campaign-management/deliverables","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","listAllDeliverables","","",""
"POST","/api/v1/admin/campaign-management/deliverables/{param}/review","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","reviewDeliverable","","admin-dashboard\lib\api\admin\campaign-management.ts",""
"GET","/api/v1/admin/campaign-management/templates","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","listTemplates","","",""
"POST","/api/v1/admin/campaign-management/templates","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","createTemplate","","",""
"DELETE","/api/v1/admin/campaign-management/templates/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","deleteTemplate","","admin-dashboard\lib\api\admin\campaign-management.ts",""
"GET","/api/v1/admin/campaign-management/templates/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","getTemplate","","",""
"PUT","/api/v1/admin/campaign-management/templates/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","updateTemplate","","",""
"POST","/api/v1/admin/campaign-management/templates/from-campaign/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignManagementController.java","createTemplateFromCampaign","","",""
"PUT","/api/v1/admin/campaigns/{param}/approve","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignReviewController.java","approveCampaign","","",""
"PUT","/api/v1/admin/campaigns/{param}/reject","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignReviewController.java","rejectCampaign","","",""
"GET","/api/v1/admin/campaigns/pending","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminCampaignReviewController.java","listPending","","",""
"GET","/api/v1/admin/compliance/gdpr","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminComplianceController.java","listRequests","","",""
"PUT","/api/v1/admin/compliance/gdpr/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminComplianceController.java","updateRequest","","",""
"POST","/api/v1/admin/compliance/gdpr/{param}/anonymize","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminComplianceController.java","anonymizeUser","","",""
"POST","/api/v1/admin/compliance/gdpr/{param}/export","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminComplianceController.java","generateExport","","",""
"GET","/api/v1/admin/compliance/reports","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminComplianceReportController.java","listReports","","",""
"POST","/api/v1/admin/compliance/reports/regulatory","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminComplianceReportController.java","generateRegulatoryReport","","",""
"POST","/api/v1/admin/compliance/reports/tax","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminComplianceReportController.java","generateTaxReport","","",""
"GET","/api/v1/admin/finance/reports/campaigns","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminFinanceController.java","getCampaignReport","","",""
"GET","/api/v1/admin/finance/reports/export","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminFinanceController.java","exportReport","","",""
"GET","/api/v1/admin/finance/reports/period","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminFinanceController.java","getPeriodReport","","",""
"GET","/api/v1/admin/finance/reports/users","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminFinanceController.java","getUserReport","","",""
"GET","/api/v1/admin/finance/summary","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminFinanceController.java","getSummary","","",""
"GET","/api/v1/admin/messages/conversations","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminMessageController.java","listConversations","","",""
"GET","/api/v1/admin/messages/conversations/{param}/messages","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminMessageController.java","getMessages","","",""
"POST","/api/v1/admin/messages/conversations/{param}/messages","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminMessageController.java","sendMessage","","",""
"GET","/api/v1/admin/moderation/flags","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminModerationController.java","listFlags","","",""
"POST","/api/v1/admin/moderation/flags","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminModerationController.java","flagCampaign","","",""
"PUT","/api/v1/admin/moderation/flags/{param}/resolve","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminModerationController.java","resolveFlag","","",""
"GET","/api/v1/admin/moderation/rules","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminModerationController.java","listRules","","",""
"POST","/api/v1/admin/moderation/rules","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminModerationController.java","createRule","","",""
"DELETE","/api/v1/admin/moderation/rules/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminModerationController.java","deleteRule","","admin-dashboard\lib\api\admin\moderation.ts","brand-dashboard\lib\api\admin\moderation.ts"
"PUT","/api/v1/admin/moderation/rules/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminModerationController.java","updateRule","","",""
"GET","/api/v1/admin/moderation/rules/{param}/test","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminModerationController.java","testRule","","",""
"DELETE","/api/v1/admin/permissions/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminPermissionController.java","revokePermission","","",""
"GET","/api/v1/admin/permissions/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminPermissionController.java","listPermissions","","",""
"POST","/api/v1/admin/permissions/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminPermissionController.java","grantPermission","","",""
"PUT","/api/v1/admin/permissions/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminPermissionController.java","replacePermissions","","",""
"PUT","/api/v1/admin/profiles/brand/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminProfileController.java","updateBrandProfile","","",""
"PUT","/api/v1/admin/profiles/creator/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminProfileController.java","updateCreatorProfile","","",""
"PUT","/api/v1/admin/profiles/user/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminProfileController.java","updateUserProfile","","",""
"GET","/api/v1/admin/settings","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminSettingsController.java","listSettings","","",""
"PUT","/api/v1/admin/settings","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminSettingsController.java","upsertSetting","","",""
"POST","/api/v1/admin/system/feedback","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminSystemController.java","submitFeedback","","",""
"GET","/api/v1/admin/system/health","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminSystemController.java","getHealthSummary","","",""
"POST","/api/v1/admin/system/session","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminSystemController.java","trackSession","","",""
"GET","/api/v1/admin/system/summary","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminSystemController.java","getSummary","","",""
"GET","/api/v1/admin/users","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminUserController.java","listUsers","","",""
"PUT","/api/v1/admin/users/{param}/status","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminUserController.java","updateStatus","","",""
"GET","/api/v1/admin/users/appeals","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminUserController.java","listAppeals","","",""
"PUT","/api/v1/admin/users/appeals/{param}/resolve","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AdminUserController.java","resolveAppeal","","",""
"GET","/api/v1/appeals","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AppealController.java","listAppeals","","",""
"POST","/api/v1/appeals","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AppealController.java","submitAppeal","","",""
"GET","/api/v1/applications","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ApplicationController.java","getApplications","","","brand-dashboard\lib\api\applications.ts"
"POST","/api/v1/applications","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ApplicationController.java","submitApplication","","",""
"DELETE","/api/v1/applications/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ApplicationController.java","withdrawApplication","src\api\services\applicationService.ts","",""
"GET","/api/v1/applications/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ApplicationController.java","getApplicationById","","",""
"POST","/api/v1/applications/{param}/reject","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ApplicationController.java","rejectApplication","","",""
"POST","/api/v1/applications/{param}/select","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ApplicationController.java","selectApplication","","",""
"POST","/api/v1/applications/{param}/shortlist","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ApplicationController.java","shortlistApplication","","",""
"PUT","/api/v1/applications/{param}/status","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ApplicationController.java","updateApplicationStatus","","",""
"POST","/api/v1/applications/bulk-status","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ApplicationController.java","bulkUpdateStatus","","admin-dashboard\lib\api\applications.ts","brand-dashboard\lib\api\applications.ts"
"POST","/api/v1/auth/link-supabase-user","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AuthController.java","linkSupabaseUser","","",""
"POST","/api/v1/auth/login","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AuthController.java","login","","",""
"GET","/api/v1/auth/me","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AuthController.java","getCurrentUser","","",""
"POST","/api/v1/auth/register","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AuthController.java","register","","",""
"POST","/api/v1/auth/verify-email","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AuthController.java","verifyEmail","","",""
"POST","/api/v1/auth/verify-phone","backend\creatorx-api\src\main\java\com\creatorx\api\controller\AuthController.java","verifyPhone","","",""
"GET","/api/v1/brand-verification/admin/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\BrandVerificationController.java","getAdminDetail","","",""
"POST","/api/v1/brand-verification/bulk-review","backend\creatorx-api\src\main\java\com\creatorx\api\controller\BrandVerificationController.java","bulkReview","","",""
"GET","/api/v1/brand-verification/pending","backend\creatorx-api\src\main\java\com\creatorx\api\controller\BrandVerificationController.java","getPending","","",""
"POST","/api/v1/brand-verification/review/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\BrandVerificationController.java","reviewDocument","","",""
"GET","/api/v1/brand-verification/status","backend\creatorx-api\src\main\java\com\creatorx\api\controller\BrandVerificationController.java","getStatus","","",""
"POST","/api/v1/brand-verification/submit","backend\creatorx-api\src\main\java\com\creatorx\api\controller\BrandVerificationController.java","submitGstDocument","","",""
"GET","/api/v1/campaigns","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignController.java","getCampaigns","","",""
"POST","/api/v1/campaigns","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignController.java","createCampaign","","",""
"DELETE","/api/v1/campaigns/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignController.java","deleteCampaign","","admin-dashboard\lib\api\campaigns.ts","brand-dashboard\lib\api\campaigns.ts"
"GET","/api/v1/campaigns/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignController.java","getCampaignById","","",""
"PUT","/api/v1/campaigns/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignController.java","updateCampaign","","",""
"GET","/api/v1/campaigns/{param}/analytics","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignAnalyticsController.java","getCampaignAnalytics","","admin-dashboard\lib\api\analytics.ts","brand-dashboard\lib\api\analytics.ts"
"GET","/api/v1/campaigns/{param}/applications","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignController.java","getCampaignApplications","","",""
"GET","/api/v1/campaigns/{param}/deliverables","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignController.java","getCampaignDeliverables","","admin-dashboard\lib\api\deliverables.ts","brand-dashboard\lib\api\deliverables.ts"
"POST","/api/v1/campaigns/{param}/invite","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignController.java","inviteCreator","","admin-dashboard\lib\api\creators.ts","brand-dashboard\lib\api\creators.ts"
"DELETE","/api/v1/campaigns/{param}/save","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignController.java","unsaveCampaign","src\api\services\campaignService.ts","",""
"POST","/api/v1/campaigns/{param}/save","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignController.java","saveCampaign","src\api\services\campaignService.ts","",""
"GET","/api/v1/campaigns/active","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignController.java","getActiveCampaigns","","",""
"GET","/api/v1/campaigns/saved","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignController.java","getSavedCampaigns","","",""
"GET","/api/v1/campaigns/search","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignController.java","searchCampaigns","","",""
"GET","/api/v1/campaign-templates","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignTemplateController.java","getTemplates","","",""
"POST","/api/v1/campaign-templates","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignTemplateController.java","createTemplate","","",""
"DELETE","/api/v1/campaign-templates/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignTemplateController.java","deleteTemplate","","admin-dashboard\lib\api\templates.ts","brand-dashboard\lib\api\templates.ts"
"GET","/api/v1/campaign-templates/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignTemplateController.java","getTemplate","","admin-dashboard\lib\api\templates.ts","brand-dashboard\lib\api\templates.ts"
"PUT","/api/v1/campaign-templates/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignTemplateController.java","updateTemplate","","admin-dashboard\lib\api\templates.ts","brand-dashboard\lib\api\templates.ts"
"POST","/api/v1/campaign-templates/from-campaign/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CampaignTemplateController.java","createFromCampaign","","admin-dashboard\lib\api\templates.ts","brand-dashboard\lib\api\templates.ts"
"GET","/api/v1/compliance/gdpr","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ComplianceController.java","listRequests","","",""
"POST","/api/v1/compliance/gdpr","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ComplianceController.java","submitRequest","","",""
"GET","/api/v1/conversations","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ConversationController.java","getConversations","","",""
"PUT","/api/v1/conversations/{param}/mark-read","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ConversationController.java","markRead","src\api\services\messagingService.ts","admin-dashboard\lib\api\messages.ts","brand-dashboard\lib\api\messages.ts"
"GET","/api/v1/conversations/{param}/messages","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ConversationController.java","getMessages","","",""
"POST","/api/v1/conversations/{param}/messages","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ConversationController.java","sendMessage","","",""
"GET","/api/v1/conversations/application/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ConversationController.java","getConversationByApplication","","",""
"GET","/api/v1/conversations/unread-count","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ConversationController.java","getUnreadCount","","",""
"GET","/api/v1/creator/social-accounts","backend\creatorx-api\src\main\java\com\creatorx\api\controller\SocialAccountController.java","getAccounts","","",""
"POST","/api/v1/creator/social-accounts/{param}/disconnect","backend\creatorx-api\src\main\java\com\creatorx\api\controller\SocialAccountController.java","disconnect","src\api\services\socialConnectService.ts","",""
"POST","/api/v1/creator/social-accounts/{param}/refresh","backend\creatorx-api\src\main\java\com\creatorx\api\controller\SocialAccountController.java","refresh","src\api\services\socialConnectService.ts","",""
"GET","/api/v1/creators","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CreatorController.java","searchCreators","","",""
"GET","/api/v1/creators/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\CreatorController.java","getCreatorById","","admin-dashboard\lib\api\creators.ts","brand-dashboard\lib\api\creators.ts"
"GET","/api/v1/deliverables","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DeliverableController.java","getDeliverables","","",""
"POST","/api/v1/deliverables","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DeliverableController.java","submitDeliverable","","",""
"PUT","/api/v1/deliverables/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DeliverableController.java","resubmitDeliverable","","",""
"GET","/api/v1/deliverables/{param}/history","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DeliverableController.java","getDeliverableHistory","","admin-dashboard\lib\api\deliverables.ts","brand-dashboard\lib\api\deliverables.ts"
"POST","/api/v1/deliverables/{param}/review","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DeliverableController.java","reviewDeliverable","","admin-dashboard\lib\api\deliverables.ts","brand-dashboard\lib\api\deliverables.ts"
"GET","/api/v1/disputes","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DisputeController.java","listDisputes","","",""
"POST","/api/v1/disputes","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DisputeController.java","createDispute","","",""
"PUT","/api/v1/disputes/{param}/assign","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DisputeController.java","assignDispute","","",""
"GET","/api/v1/disputes/{param}/evidence","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DisputeController.java","listEvidence","","",""
"POST","/api/v1/disputes/{param}/evidence","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DisputeController.java","addEvidence","","",""
"GET","/api/v1/disputes/{param}/evidence/admin","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DisputeController.java","listEvidenceForAdmin","","",""
"GET","/api/v1/disputes/{param}/notes","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DisputeController.java","listInternalNotes","","",""
"POST","/api/v1/disputes/{param}/notes","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DisputeController.java","addInternalNote","","",""
"PUT","/api/v1/disputes/{param}/resolve","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DisputeController.java","resolveDispute","","",""
"GET","/api/v1/disputes/admin","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DisputeController.java","listDisputesForAdmin","","",""
"GET","/api/v1/disputes/admin/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\DisputeController.java","getDisputeForAdmin","","",""
"GET","/api/v1/health","backend\creatorx-api\src\main\java\com\creatorx\api\controller\HealthController.java","health","","",""
"GET","/api/v1/kyc/documents","backend\creatorx-api\src\main\java\com\creatorx\api\controller\KYCController.java","getKYCDocuments","","",""
"PUT","/api/v1/kyc/documents/{param}/approve","backend\creatorx-api\src\main\java\com\creatorx\api\controller\KYCController.java","approveKYC","","admin-dashboard\lib\api\admin\kyc.ts","brand-dashboard\lib\api\admin\kyc.ts"
"PUT","/api/v1/kyc/documents/{param}/reject","backend\creatorx-api\src\main\java\com\creatorx\api\controller\KYCController.java","rejectKYC","","admin-dashboard\lib\api\admin\kyc.ts","brand-dashboard\lib\api\admin\kyc.ts"
"POST","/api/v1/kyc/documents/bulk-review","backend\creatorx-api\src\main\java\com\creatorx\api\controller\KYCController.java","bulkReview","","",""
"GET","/api/v1/kyc/pending","backend\creatorx-api\src\main\java\com\creatorx\api\controller\KYCController.java","getPendingDocuments","","",""
"GET","/api/v1/kyc/status","backend\creatorx-api\src\main\java\com\creatorx\api\controller\KYCController.java","getKYCStatus","","",""
"POST","/api/v1/kyc/submit","backend\creatorx-api\src\main\java\com\creatorx\api\controller\KYCController.java","submitKYC","","",""
"GET","/api/v1/messages/conversation/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\MessageController.java","getMessages","","",""
"PUT","/api/v1/messages/conversation/{param}/read","backend\creatorx-api\src\main\java\com\creatorx\api\controller\MessageController.java","markAsRead","","",""
"GET","/api/v1/messages/conversations","backend\creatorx-api\src\main\java\com\creatorx\api\controller\MessageController.java","getConversations","","",""
"GET","/api/v1/messages/conversations/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\MessageController.java","getConversation","","",""
"GET","/api/v1/messages/conversations/application/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\MessageController.java","getConversationByApplication","","",""
"GET","/api/v1/messages/unread-count","backend\creatorx-api\src\main\java\com\creatorx\api\controller\MessageController.java","getUnreadCount","","",""
"GET","/api/v1/notifications","backend\creatorx-api\src\main\java\com\creatorx\api\controller\NotificationController.java","getNotifications","","",""
"PUT","/api/v1/notifications/{param}/read","backend\creatorx-api\src\main\java\com\creatorx\api\controller\NotificationController.java","markAsRead","src\api\services\notificationService.ts","",""
"PUT","/api/v1/notifications/read-all","backend\creatorx-api\src\main\java\com\creatorx\api\controller\NotificationController.java","markAllAsRead","src\api\services\notificationService.ts","",""
"POST","/api/v1/notifications/register-device","backend\creatorx-api\src\main\java\com\creatorx\api\controller\NotificationController.java","registerDevice","","",""
"GET","/api/v1/notifications/unread-count","backend\creatorx-api\src\main\java\com\creatorx\api\controller\NotificationController.java","getUnreadCount","","",""
"DELETE","/api/v1/notifications/unregister-device/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\NotificationController.java","unregisterDevice","","",""
"POST","/api/v1/payments/orders","backend\creatorx-api\src\main\java\com\creatorx\api\controller\PaymentOrderController.java","createPaymentOrder","","",""
"GET","/api/v1/payments/orders/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\PaymentOrderController.java","getPaymentOrder","","",""
"GET","/api/v1/profile","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ProfileController.java","getProfile","","",""
"PUT","/api/v1/profile","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ProfileController.java","updateProfile","","",""
"POST","/api/v1/profile/avatar","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ProfileController.java","uploadAvatar","","",""
"GET","/api/v1/profile/brand","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ProfileController.java","getBrandProfile","","",""
"PUT","/api/v1/profile/brand","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ProfileController.java","updateBrandProfile","","",""
"GET","/api/v1/profile/creator","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ProfileController.java","getCreatorProfile","","",""
"PUT","/api/v1/profile/creator","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ProfileController.java","updateCreatorProfile","","",""
"POST","/api/v1/profile/logo","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ProfileController.java","uploadLogo","","",""
"GET","/api/v1/profile/portfolio","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ProfileController.java","getPortfolio","","",""
"POST","/api/v1/profile/portfolio","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ProfileController.java","addPortfolioItem","","",""
"DELETE","/api/v1/profile/portfolio/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\ProfileController.java","deletePortfolioItem","","",""
"GET","/api/v1/social/connect/{param}/callback","backend\creatorx-api\src\main\java\com\creatorx\api\controller\SocialConnectController.java","oauthCallback","","",""
"GET","/api/v1/social/connect/{param}/start","backend\creatorx-api\src\main\java\com\creatorx\api\controller\SocialConnectController.java","startOAuth","","",""
"DELETE","/api/v1/storage/delete","backend\creatorx-api\src\main\java\com\creatorx\api\controller\StorageController.java","deleteFile","","",""
"GET","/api/v1/storage/signed-url","backend\creatorx-api\src\main\java\com\creatorx\api\controller\StorageController.java","generateSignedUrl","","",""
"POST","/api/v1/storage/upload","backend\creatorx-api\src\main\java\com\creatorx\api\controller\StorageController.java","uploadFile","","",""
"POST","/api/v1/storage/upload/avatar","backend\creatorx-api\src\main\java\com\creatorx\api\controller\StorageController.java","uploadAvatar","","",""
"POST","/api/v1/storage/upload/deliverable","backend\creatorx-api\src\main\java\com\creatorx\api\controller\StorageController.java","uploadDeliverable","","",""
"POST","/api/v1/storage/upload/kyc","backend\creatorx-api\src\main\java\com\creatorx\api\controller\StorageController.java","uploadKYCDocument","","",""
"POST","/api/v1/storage/upload/portfolio","backend\creatorx-api\src\main\java\com\creatorx\api\controller\StorageController.java","uploadPortfolioItem","","",""
"GET","/api/v1/team-members","backend\creatorx-api\src\main\java\com\creatorx\api\controller\TeamMemberController.java","getTeamMembers","","",""
"DELETE","/api/v1/team-members/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\TeamMemberController.java","removeTeamMember","","admin-dashboard\lib\api\profile.ts","brand-dashboard\lib\api\profile.ts"
"POST","/api/v1/team-members/accept","backend\creatorx-api\src\main\java\com\creatorx\api\controller\TeamMemberController.java","acceptInvitation","","",""
"POST","/api/v1/team-members/invite","backend\creatorx-api\src\main\java\com\creatorx\api\controller\TeamMemberController.java","inviteTeamMember","","",""
"GET","/api/v1/wallet","backend\creatorx-api\src\main\java\com\creatorx\api\controller\WalletController.java","getWallet","","",""
"GET","/api/v1/wallet/bank-accounts","backend\creatorx-api\src\main\java\com\creatorx\api\controller\WalletController.java","getBankAccounts","","",""
"POST","/api/v1/wallet/bank-accounts","backend\creatorx-api\src\main\java\com\creatorx\api\controller\WalletController.java","addBankAccount","","",""
"DELETE","/api/v1/wallet/bank-accounts/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\WalletController.java","deleteBankAccount","","",""
"PUT","/api/v1/wallet/bank-accounts/{param}/default","backend\creatorx-api\src\main\java\com\creatorx\api\controller\WalletController.java","setDefaultBankAccount","","",""
"GET","/api/v1/wallet/transactions","backend\creatorx-api\src\main\java\com\creatorx\api\controller\WalletController.java","getTransactions","","",""
"POST","/api/v1/wallet/withdraw","backend\creatorx-api\src\main\java\com\creatorx\api\controller\WalletController.java","requestWithdrawal","","",""
"GET","/api/v1/wallet/withdrawals","backend\creatorx-api\src\main\java\com\creatorx\api\controller\WalletController.java","getWithdrawals","","",""
"DELETE","/api/v1/wallet/withdrawals/{param}","backend\creatorx-api\src\main\java\com\creatorx\api\controller\WalletController.java","cancelWithdrawal","","",""
"POST","/api/v1/webhooks/razorpay","backend\creatorx-api\src\main\java\com\creatorx\api\controller\WebhookController.java","handleRazorpayWebhook","","",""
```

JSON (full matrix):
```json
[
    {
        "method":  "GET",
        "path":  "/api/v1/admin/audit",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminAuditController.java",
        "methodName":  "listAuditLogs",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/audit/export",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminAuditController.java",
        "methodName":  "exportAuditLogs",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/campaign-management",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "listCampaigns",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/campaign-management",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "createCampaign",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "DELETE",
        "path":  "/api/v1/admin/campaign-management/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "deleteCampaign",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\admin\\campaign-management.ts",
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/campaign-management/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "getCampaign",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/admin/campaign-management/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "updateCampaign",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/campaign-management/{param}/applications",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "listApplications",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/campaign-management/{param}/deliverables",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "listDeliverables",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/campaign-management/{param}/invite",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "inviteCreator",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/campaign-management/applications",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "listAllApplications",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/campaign-management/applications/{param}/reject",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "rejectApplication",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\admin\\campaign-management.ts",
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/campaign-management/applications/{param}/select",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "selectApplication",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\admin\\campaign-management.ts",
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/campaign-management/applications/{param}/shortlist",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "shortlistApplication",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\admin\\campaign-management.ts",
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/admin/campaign-management/applications/{param}/status",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "updateApplicationStatus",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\admin\\campaign-management.ts",
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/campaign-management/applications/bulk-status",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "bulkUpdateApplications",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\admin\\campaign-management.ts",
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/campaign-management/deliverables",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "listAllDeliverables",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/campaign-management/deliverables/{param}/review",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "reviewDeliverable",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\admin\\campaign-management.ts",
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/campaign-management/templates",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "listTemplates",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/campaign-management/templates",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "createTemplate",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "DELETE",
        "path":  "/api/v1/admin/campaign-management/templates/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "deleteTemplate",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\admin\\campaign-management.ts",
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/campaign-management/templates/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "getTemplate",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/admin/campaign-management/templates/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "updateTemplate",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/campaign-management/templates/from-campaign/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignManagementController.java",
        "methodName":  "createTemplateFromCampaign",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/admin/campaigns/{param}/approve",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignReviewController.java",
        "methodName":  "approveCampaign",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/admin/campaigns/{param}/reject",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignReviewController.java",
        "methodName":  "rejectCampaign",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/campaigns/pending",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminCampaignReviewController.java",
        "methodName":  "listPending",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/compliance/gdpr",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminComplianceController.java",
        "methodName":  "listRequests",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/admin/compliance/gdpr/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminComplianceController.java",
        "methodName":  "updateRequest",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/compliance/gdpr/{param}/anonymize",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminComplianceController.java",
        "methodName":  "anonymizeUser",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/compliance/gdpr/{param}/export",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminComplianceController.java",
        "methodName":  "generateExport",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/compliance/reports",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminComplianceReportController.java",
        "methodName":  "listReports",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/compliance/reports/regulatory",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminComplianceReportController.java",
        "methodName":  "generateRegulatoryReport",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/compliance/reports/tax",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminComplianceReportController.java",
        "methodName":  "generateTaxReport",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/finance/reports/campaigns",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminFinanceController.java",
        "methodName":  "getCampaignReport",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/finance/reports/export",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminFinanceController.java",
        "methodName":  "exportReport",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/finance/reports/period",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminFinanceController.java",
        "methodName":  "getPeriodReport",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/finance/reports/users",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminFinanceController.java",
        "methodName":  "getUserReport",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/finance/summary",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminFinanceController.java",
        "methodName":  "getSummary",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/messages/conversations",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminMessageController.java",
        "methodName":  "listConversations",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/messages/conversations/{param}/messages",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminMessageController.java",
        "methodName":  "getMessages",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/messages/conversations/{param}/messages",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminMessageController.java",
        "methodName":  "sendMessage",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/moderation/flags",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminModerationController.java",
        "methodName":  "listFlags",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/moderation/flags",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminModerationController.java",
        "methodName":  "flagCampaign",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/admin/moderation/flags/{param}/resolve",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminModerationController.java",
        "methodName":  "resolveFlag",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/moderation/rules",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminModerationController.java",
        "methodName":  "listRules",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/moderation/rules",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminModerationController.java",
        "methodName":  "createRule",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "DELETE",
        "path":  "/api/v1/admin/moderation/rules/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminModerationController.java",
        "methodName":  "deleteRule",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\admin\\moderation.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\admin\\moderation.ts"
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/admin/moderation/rules/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminModerationController.java",
        "methodName":  "updateRule",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/moderation/rules/{param}/test",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminModerationController.java",
        "methodName":  "testRule",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "DELETE",
        "path":  "/api/v1/admin/permissions/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminPermissionController.java",
        "methodName":  "revokePermission",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/permissions/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminPermissionController.java",
        "methodName":  "listPermissions",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/permissions/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminPermissionController.java",
        "methodName":  "grantPermission",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/admin/permissions/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminPermissionController.java",
        "methodName":  "replacePermissions",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/admin/profiles/brand/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminProfileController.java",
        "methodName":  "updateBrandProfile",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/admin/profiles/creator/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminProfileController.java",
        "methodName":  "updateCreatorProfile",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/admin/profiles/user/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminProfileController.java",
        "methodName":  "updateUserProfile",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/settings",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminSettingsController.java",
        "methodName":  "listSettings",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/admin/settings",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminSettingsController.java",
        "methodName":  "upsertSetting",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/system/feedback",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminSystemController.java",
        "methodName":  "submitFeedback",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/system/health",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminSystemController.java",
        "methodName":  "getHealthSummary",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/admin/system/session",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminSystemController.java",
        "methodName":  "trackSession",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/system/summary",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminSystemController.java",
        "methodName":  "getSummary",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/users",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminUserController.java",
        "methodName":  "listUsers",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/admin/users/{param}/status",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminUserController.java",
        "methodName":  "updateStatus",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/admin/users/appeals",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminUserController.java",
        "methodName":  "listAppeals",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/admin/users/appeals/{param}/resolve",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AdminUserController.java",
        "methodName":  "resolveAppeal",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/appeals",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AppealController.java",
        "methodName":  "listAppeals",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/appeals",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AppealController.java",
        "methodName":  "submitAppeal",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/applications",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ApplicationController.java",
        "methodName":  "getApplications",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  "brand-dashboard\\lib\\api\\applications.ts"
    },
    {
        "method":  "POST",
        "path":  "/api/v1/applications",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ApplicationController.java",
        "methodName":  "submitApplication",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "DELETE",
        "path":  "/api/v1/applications/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ApplicationController.java",
        "methodName":  "withdrawApplication",
        "mobile":  "src\\api\\services\\applicationService.ts",
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/applications/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ApplicationController.java",
        "methodName":  "getApplicationById",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/applications/{param}/reject",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ApplicationController.java",
        "methodName":  "rejectApplication",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/applications/{param}/select",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ApplicationController.java",
        "methodName":  "selectApplication",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/applications/{param}/shortlist",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ApplicationController.java",
        "methodName":  "shortlistApplication",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/applications/{param}/status",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ApplicationController.java",
        "methodName":  "updateApplicationStatus",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/applications/bulk-status",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ApplicationController.java",
        "methodName":  "bulkUpdateStatus",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\applications.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\applications.ts"
    },
    {
        "method":  "POST",
        "path":  "/api/v1/auth/link-supabase-user",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AuthController.java",
        "methodName":  "linkSupabaseUser",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/auth/login",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AuthController.java",
        "methodName":  "login",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/auth/me",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AuthController.java",
        "methodName":  "getCurrentUser",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/auth/register",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AuthController.java",
        "methodName":  "register",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/auth/verify-email",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AuthController.java",
        "methodName":  "verifyEmail",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/auth/verify-phone",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\AuthController.java",
        "methodName":  "verifyPhone",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/brand-verification/admin/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\BrandVerificationController.java",
        "methodName":  "getAdminDetail",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/brand-verification/bulk-review",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\BrandVerificationController.java",
        "methodName":  "bulkReview",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/brand-verification/pending",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\BrandVerificationController.java",
        "methodName":  "getPending",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/brand-verification/review/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\BrandVerificationController.java",
        "methodName":  "reviewDocument",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/brand-verification/status",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\BrandVerificationController.java",
        "methodName":  "getStatus",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/brand-verification/submit",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\BrandVerificationController.java",
        "methodName":  "submitGstDocument",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/campaigns",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignController.java",
        "methodName":  "getCampaigns",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/campaigns",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignController.java",
        "methodName":  "createCampaign",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "DELETE",
        "path":  "/api/v1/campaigns/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignController.java",
        "methodName":  "deleteCampaign",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\campaigns.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\campaigns.ts"
    },
    {
        "method":  "GET",
        "path":  "/api/v1/campaigns/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignController.java",
        "methodName":  "getCampaignById",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/campaigns/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignController.java",
        "methodName":  "updateCampaign",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/campaigns/{param}/analytics",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignAnalyticsController.java",
        "methodName":  "getCampaignAnalytics",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\analytics.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\analytics.ts"
    },
    {
        "method":  "GET",
        "path":  "/api/v1/campaigns/{param}/applications",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignController.java",
        "methodName":  "getCampaignApplications",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/campaigns/{param}/deliverables",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignController.java",
        "methodName":  "getCampaignDeliverables",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\deliverables.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\deliverables.ts"
    },
    {
        "method":  "POST",
        "path":  "/api/v1/campaigns/{param}/invite",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignController.java",
        "methodName":  "inviteCreator",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\creators.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\creators.ts"
    },
    {
        "method":  "DELETE",
        "path":  "/api/v1/campaigns/{param}/save",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignController.java",
        "methodName":  "unsaveCampaign",
        "mobile":  "src\\api\\services\\campaignService.ts",
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/campaigns/{param}/save",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignController.java",
        "methodName":  "saveCampaign",
        "mobile":  "src\\api\\services\\campaignService.ts",
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/campaigns/active",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignController.java",
        "methodName":  "getActiveCampaigns",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/campaigns/saved",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignController.java",
        "methodName":  "getSavedCampaigns",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/campaigns/search",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignController.java",
        "methodName":  "searchCampaigns",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/campaign-templates",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignTemplateController.java",
        "methodName":  "getTemplates",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/campaign-templates",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignTemplateController.java",
        "methodName":  "createTemplate",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "DELETE",
        "path":  "/api/v1/campaign-templates/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignTemplateController.java",
        "methodName":  "deleteTemplate",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\templates.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\templates.ts"
    },
    {
        "method":  "GET",
        "path":  "/api/v1/campaign-templates/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignTemplateController.java",
        "methodName":  "getTemplate",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\templates.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\templates.ts"
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/campaign-templates/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignTemplateController.java",
        "methodName":  "updateTemplate",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\templates.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\templates.ts"
    },
    {
        "method":  "POST",
        "path":  "/api/v1/campaign-templates/from-campaign/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CampaignTemplateController.java",
        "methodName":  "createFromCampaign",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\templates.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\templates.ts"
    },
    {
        "method":  "GET",
        "path":  "/api/v1/compliance/gdpr",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ComplianceController.java",
        "methodName":  "listRequests",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/compliance/gdpr",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ComplianceController.java",
        "methodName":  "submitRequest",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/conversations",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ConversationController.java",
        "methodName":  "getConversations",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/conversations/{param}/mark-read",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ConversationController.java",
        "methodName":  "markRead",
        "mobile":  "src\\api\\services\\messagingService.ts",
        "admin_dashboard":  "admin-dashboard\\lib\\api\\messages.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\messages.ts"
    },
    {
        "method":  "GET",
        "path":  "/api/v1/conversations/{param}/messages",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ConversationController.java",
        "methodName":  "getMessages",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/conversations/{param}/messages",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ConversationController.java",
        "methodName":  "sendMessage",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/conversations/application/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ConversationController.java",
        "methodName":  "getConversationByApplication",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/conversations/unread-count",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ConversationController.java",
        "methodName":  "getUnreadCount",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/creator/social-accounts",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\SocialAccountController.java",
        "methodName":  "getAccounts",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/creator/social-accounts/{param}/disconnect",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\SocialAccountController.java",
        "methodName":  "disconnect",
        "mobile":  "src\\api\\services\\socialConnectService.ts",
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/creator/social-accounts/{param}/refresh",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\SocialAccountController.java",
        "methodName":  "refresh",
        "mobile":  "src\\api\\services\\socialConnectService.ts",
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/creators",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CreatorController.java",
        "methodName":  "searchCreators",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/creators/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\CreatorController.java",
        "methodName":  "getCreatorById",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\creators.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\creators.ts"
    },
    {
        "method":  "GET",
        "path":  "/api/v1/deliverables",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DeliverableController.java",
        "methodName":  "getDeliverables",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/deliverables",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DeliverableController.java",
        "methodName":  "submitDeliverable",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/deliverables/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DeliverableController.java",
        "methodName":  "resubmitDeliverable",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/deliverables/{param}/history",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DeliverableController.java",
        "methodName":  "getDeliverableHistory",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\deliverables.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\deliverables.ts"
    },
    {
        "method":  "POST",
        "path":  "/api/v1/deliverables/{param}/review",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DeliverableController.java",
        "methodName":  "reviewDeliverable",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\deliverables.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\deliverables.ts"
    },
    {
        "method":  "GET",
        "path":  "/api/v1/disputes",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DisputeController.java",
        "methodName":  "listDisputes",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/disputes",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DisputeController.java",
        "methodName":  "createDispute",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/disputes/{param}/assign",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DisputeController.java",
        "methodName":  "assignDispute",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/disputes/{param}/evidence",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DisputeController.java",
        "methodName":  "listEvidence",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/disputes/{param}/evidence",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DisputeController.java",
        "methodName":  "addEvidence",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/disputes/{param}/evidence/admin",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DisputeController.java",
        "methodName":  "listEvidenceForAdmin",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/disputes/{param}/notes",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DisputeController.java",
        "methodName":  "listInternalNotes",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/disputes/{param}/notes",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DisputeController.java",
        "methodName":  "addInternalNote",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/disputes/{param}/resolve",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DisputeController.java",
        "methodName":  "resolveDispute",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/disputes/admin",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DisputeController.java",
        "methodName":  "listDisputesForAdmin",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/disputes/admin/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\DisputeController.java",
        "methodName":  "getDisputeForAdmin",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/health",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\HealthController.java",
        "methodName":  "health",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/kyc/documents",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\KYCController.java",
        "methodName":  "getKYCDocuments",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/kyc/documents/{param}/approve",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\KYCController.java",
        "methodName":  "approveKYC",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\admin\\kyc.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\admin\\kyc.ts"
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/kyc/documents/{param}/reject",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\KYCController.java",
        "methodName":  "rejectKYC",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\admin\\kyc.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\admin\\kyc.ts"
    },
    {
        "method":  "POST",
        "path":  "/api/v1/kyc/documents/bulk-review",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\KYCController.java",
        "methodName":  "bulkReview",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/kyc/pending",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\KYCController.java",
        "methodName":  "getPendingDocuments",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/kyc/status",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\KYCController.java",
        "methodName":  "getKYCStatus",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/kyc/submit",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\KYCController.java",
        "methodName":  "submitKYC",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/messages/conversation/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\MessageController.java",
        "methodName":  "getMessages",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/messages/conversation/{param}/read",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\MessageController.java",
        "methodName":  "markAsRead",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/messages/conversations",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\MessageController.java",
        "methodName":  "getConversations",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/messages/conversations/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\MessageController.java",
        "methodName":  "getConversation",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/messages/conversations/application/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\MessageController.java",
        "methodName":  "getConversationByApplication",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/messages/unread-count",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\MessageController.java",
        "methodName":  "getUnreadCount",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/notifications",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\NotificationController.java",
        "methodName":  "getNotifications",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/notifications/{param}/read",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\NotificationController.java",
        "methodName":  "markAsRead",
        "mobile":  "src\\api\\services\\notificationService.ts",
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/notifications/read-all",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\NotificationController.java",
        "methodName":  "markAllAsRead",
        "mobile":  "src\\api\\services\\notificationService.ts",
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/notifications/register-device",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\NotificationController.java",
        "methodName":  "registerDevice",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/notifications/unread-count",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\NotificationController.java",
        "methodName":  "getUnreadCount",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "DELETE",
        "path":  "/api/v1/notifications/unregister-device/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\NotificationController.java",
        "methodName":  "unregisterDevice",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/payments/orders",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\PaymentOrderController.java",
        "methodName":  "createPaymentOrder",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/payments/orders/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\PaymentOrderController.java",
        "methodName":  "getPaymentOrder",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/profile",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ProfileController.java",
        "methodName":  "getProfile",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/profile",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ProfileController.java",
        "methodName":  "updateProfile",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/profile/avatar",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ProfileController.java",
        "methodName":  "uploadAvatar",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/profile/brand",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ProfileController.java",
        "methodName":  "getBrandProfile",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/profile/brand",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ProfileController.java",
        "methodName":  "updateBrandProfile",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/profile/creator",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ProfileController.java",
        "methodName":  "getCreatorProfile",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/profile/creator",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ProfileController.java",
        "methodName":  "updateCreatorProfile",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/profile/logo",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ProfileController.java",
        "methodName":  "uploadLogo",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/profile/portfolio",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ProfileController.java",
        "methodName":  "getPortfolio",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/profile/portfolio",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ProfileController.java",
        "methodName":  "addPortfolioItem",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "DELETE",
        "path":  "/api/v1/profile/portfolio/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\ProfileController.java",
        "methodName":  "deletePortfolioItem",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/social/connect/{param}/callback",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\SocialConnectController.java",
        "methodName":  "oauthCallback",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/social/connect/{param}/start",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\SocialConnectController.java",
        "methodName":  "startOAuth",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "DELETE",
        "path":  "/api/v1/storage/delete",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\StorageController.java",
        "methodName":  "deleteFile",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/storage/signed-url",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\StorageController.java",
        "methodName":  "generateSignedUrl",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/storage/upload",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\StorageController.java",
        "methodName":  "uploadFile",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/storage/upload/avatar",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\StorageController.java",
        "methodName":  "uploadAvatar",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/storage/upload/deliverable",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\StorageController.java",
        "methodName":  "uploadDeliverable",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/storage/upload/kyc",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\StorageController.java",
        "methodName":  "uploadKYCDocument",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/storage/upload/portfolio",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\StorageController.java",
        "methodName":  "uploadPortfolioItem",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/team-members",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\TeamMemberController.java",
        "methodName":  "getTeamMembers",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "DELETE",
        "path":  "/api/v1/team-members/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\TeamMemberController.java",
        "methodName":  "removeTeamMember",
        "mobile":  {

                   },
        "admin_dashboard":  "admin-dashboard\\lib\\api\\profile.ts",
        "brand_dashboard":  "brand-dashboard\\lib\\api\\profile.ts"
    },
    {
        "method":  "POST",
        "path":  "/api/v1/team-members/accept",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\TeamMemberController.java",
        "methodName":  "acceptInvitation",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/team-members/invite",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\TeamMemberController.java",
        "methodName":  "inviteTeamMember",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/wallet",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\WalletController.java",
        "methodName":  "getWallet",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/wallet/bank-accounts",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\WalletController.java",
        "methodName":  "getBankAccounts",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/wallet/bank-accounts",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\WalletController.java",
        "methodName":  "addBankAccount",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "DELETE",
        "path":  "/api/v1/wallet/bank-accounts/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\WalletController.java",
        "methodName":  "deleteBankAccount",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "PUT",
        "path":  "/api/v1/wallet/bank-accounts/{param}/default",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\WalletController.java",
        "methodName":  "setDefaultBankAccount",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/wallet/transactions",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\WalletController.java",
        "methodName":  "getTransactions",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/wallet/withdraw",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\WalletController.java",
        "methodName":  "requestWithdrawal",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "GET",
        "path":  "/api/v1/wallet/withdrawals",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\WalletController.java",
        "methodName":  "getWithdrawals",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "DELETE",
        "path":  "/api/v1/wallet/withdrawals/{param}",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\WalletController.java",
        "methodName":  "cancelWithdrawal",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    },
    {
        "method":  "POST",
        "path":  "/api/v1/webhooks/razorpay",
        "controller":  "backend\\creatorx-api\\src\\main\\java\\com\\creatorx\\api\\controller\\WebhookController.java",
        "methodName":  "handleRazorpayWebhook",
        "mobile":  {

                   },
        "admin_dashboard":  {

                            },
        "brand_dashboard":  {

                            }
    }
]
```

## 14. Infra and CI/CD audit (scripts + workflows + terraform)

### 14.1 scripts/ deployment + test scripts
- scripts/deploy-dev.sh, scripts/deploy-staging.sh, scripts/deploy-production.sh
  - No validation for GCP_PROJECT_ID; deploy continues even if project is unset and gcloud not configured.
  - Staging accepts VERSION but does not validate it; --tag "" will fail when VERSION is missing.
  - All envs use --allow-unauthenticated; relies entirely on app auth and exposes actuator unless blocked at app level.
  - Service account key is written to /tmp/gcp-key.json and never deleted; leaves credentials on disk.
  - Production canary shifts 10/50/100 with no health check gate; a bad deploy can still reach 100 percent.
  - Uses Supabase service role key in runtime env; least-privilege risk if app is compromised.
- scripts/rollback.sh
  - Relies on gcloud run revisions list order; no validation that selected revision is healthy.
  - No post-rollback health check.
- scripts/health-check.sh
  - Hard-coded /actuator/health and expects "status":"UP"; fails if actuator is not public or is secured.
- scripts/smoke-tests.sh
  - Assumes Swagger UI at /swagger-ui.html and OpenAPI at /v3/api-docs; will fail if disabled in prod.
  - Treats any non-200/401 for /api/v1/campaigns as failure; may be OK but not configurable.
- scripts/e2e-tests.sh
  - Uses /api/v1/auth/register and expects accessToken in response; conflicts with Supabase-first auth path.
  - Static test email makes runs non-idempotent; 409 path does not fetch token, so authenticated tests can silently degrade.
- scripts/run-integration-tests.sh
  - Hard-coded docker-compose service names (creatorx-postgres, spring-boot-app); likely to fail if compose names differ.
  - Uses GNU timeout; not available on macOS by default.
  - Leaves services running on failure; no trap/cleanup.

### 14.2 .github/workflows
- .github/workflows/ci-cd.yml
  - Pipeline deploys to Railway but infra/scripts are GCP/AWS based; deployment strategy is inconsistent.
  - Health check hits ${RAILWAY_API_URL}/api/v1/health which is not implemented in backend (actuator uses /actuator/health).
  - Integration tests are non-blocking ("|| echo"), coverage is non-blocking; CI can go green with failing tests.
  - No mobile or web frontend build/test jobs.
- .github/workflows/backend-tests.yml
  - Overlaps with ci-cd build/test; duplicate work and no gating on coverage thresholds.

### 14.3 infra/terraform (AWS)
- infra/terraform/environments/prod/main.tf
  - ALB has no active listener. HTTPS listener is commented out and no HTTP listener exists. ALB will not serve traffic.
  - ALB SG allows only 443; without a listener, traffic is dropped.
  - NAT gateways count is 2 but private subnets count is 3; one private subnet has no route table association.
  - aws_ssm_parameter data sources do not set with_decryption = true; SecureString values will be unreadable ciphertext.
- infra/terraform/environments/dev/main.tf
  - Private subnets exist but have no NAT gateway or private route table; tasks in private subnets will have no outbound internet.
  - ECS task/service/ASG definitions are missing; infra is incomplete for runtime workloads.

## 15. Auth strategy decision and fix plan

### Decision
Use Supabase-only bearer tokens end-to-end (mobile + admin + brand). Backend should accept Supabase JWTs only and map "sub" to internal users. Deprecate backend-issued JWTs and auth endpoints that are not aligned with Supabase.

### Why
- Mobile auth is already Supabase-first (OTP flow, AuthContext).
- Backend includes Supabase JWT validation and WebSocket auth, but frontend expects backend JWTs in several places.
- Dual-token strategies are currently inconsistent and create the user-principal mismatch seen in controllers.

### Fix plan (high level)
1) Backend: make SupabaseJwtAuthenticationFilter the only auth filter for HTTP and WebSocket.
   - Remove or disable JwtAuthenticationFilter and backend JWT issuance paths.
   - Normalize SecurityContext principal to a consistent type (User or userId) and update controllers to use it.
2) Backend: enforce user linking on first request.
   - If user not found for supabase "sub", create or link user record; do not 404.
3) Frontend (mobile + dashboards): always pass Supabase access token as Authorization bearer.
   - Remove calls to /auth/refresh-token, /auth/logout, /auth/forgot-password, /auth/reset-password unless implemented.
4) Update DTO contracts and error shapes for auth responses (remove backend token fields if unused).
5) Add tests: auth filter unit tests, controller auth principal tests, WebSocket auth tests, and a login smoke test that calls a protected endpoint with Supabase JWT.

## 16. Mobile UI audit expansion (remaining screens)

### 16.1 Core entry + navigation
- app/index.tsx: static version string and 2.5s splash delay; no dynamic version or fast-path on auth ready.
- app/_layout.tsx: AuthGuard uses AsyncStorage onboarding flag; no server-side onboarding status. Degraded mode banner relies only on EXPO_PUBLIC_API_BASE_URL.

### 16.2 Explore + campaigns
- app/(app)/(tabs)/explore.tsx: uses real API via useApp; featured cards fall back to hard-coded data when < 2 campaigns.
- app/(app)/(tabs)/active-campaigns.tsx: urgentItems are hard-coded; chat button has no action; RatingModal onSubmit is empty.
- app/(app)/campaign-details.tsx: share action is empty; do/dont lists fall back to static content.
- app/(app)/apply-to-campaign.tsx: always sends expectedTimeline = "Custom" and concatenates fee/portfolio into extraDetails; no field validation beyond pitch length.

### 16.3 Messaging
- app/(app)/(tabs)/chat.tsx: loads from useApp; shows "degraded mode" notice but still renders UI. OK but message access is blocked only by notice.
- app/(app)/conversation.tsx: attachment flow is stubbed with alerts; quick actions are UI only; sendMessage can be called even when messaging is unavailable.
- app/(app)/new-message.tsx: send button has no handler; tools are no-op.
- app/(app)/notifications.tsx: OPEN_CONVERSATION uses params.conversationId, but conversation screen expects chatId; routes will open wrong chat (defaults to id "1").

### 16.4 Wallet + payments
- app/(app)/transaction-detail.tsx: pulls transactionId from params, falls back to id; support button has no action.
- app/(app)/withdraw.tsx: uses walletService for bank accounts and withdrawals; route /add-bank-account does not exist in app.

### 16.5 Documents + files
- app/(app)/documents.tsx and app/(app)/my-docs.tsx: both are fully mock data and duplicate the same concept; no API wiring for storage or contracts.

### 16.6 Profile + settings
- app/(app)/(tabs)/profile.tsx: logout flow only shows alert and does not call any auth service.
- app/(app)/privacy.tsx: all toggles are local state; no persistence or backend integration for security/privacy settings.
- app/(app)/help.tsx: FAQ and contact flows are static; "chat" only adds a local notification.

### 16.7 Community + events + referrals
- app/(app)/(tabs)/more.tsx: events, perks, and news are entirely mocked; all primary actions are no-op.
- app/(app)/event-details.tsx: fully static event metadata with 2023 dates.
- app/(app)/refer-earn.tsx: referral code and stats are hard-coded; no API integration.

### 16.8 Auth + onboarding
- app/(auth)/login-otp.tsx: terms accepted defaults to true; devLogin bypass exists in production build unless gated.
- app/(auth)/onboarding-form.tsx, onboarding-social.tsx, onboarding-commercial.tsx: store data only in AsyncStorage; no backend persistence, which breaks cross-device and admin visibility.
- app/(auth)/welcome.tsx: dev skip entry is available; must be gated to dev.

### 16.9 Other
- app/(app)/analytics.tsx: placeholder screen only.
- app/_dev/reset-onboarding.tsx: dev-only utility is present; ensure it is not shipped or is gated.

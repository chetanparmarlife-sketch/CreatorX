# Admin Dashboard

This document describes the Phase 3 Admin Dashboard implementation for CreatorX.

## Goals
- Full platform governance and compliance.
- Centralized admin tools for KYC, brand verification, moderation, disputes, audit, and settings.

## Admin UI
Location: `admin-dashboard/app/(admin)`

## Separate Admin App (Port 3002)
The admin dashboard can run as a separate Next.js app from `admin-dashboard/` on port 3002.

Dev commands (run from `admin-dashboard/`):
- `npm run dev`
- `npm run build`
- `npm run start`

Environment (admin app):
- `NEXT_PUBLIC_API_BASE_URL` (admin API base URL)
- `NEXT_PUBLIC_BRAND_DASHBOARD_URL` (brand dashboard URL for the switch link)

### Navigation
- Overview: `/admin`
- Work Queue:
  - KYC Review: `/admin/kyc`
  - Campaign Flags: `/admin/campaigns`
  - Disputes: `/admin/disputes`
  - GDPR Requests: `/admin/compliance`
- User Management:
  - Users: `/admin/users`
  - Brand Verification: `/admin/brands`
  - Appeals: `/admin/appeals`
- Moderation:
  - Campaign Reviews: `/admin/campaign-reviews`
  - Moderation Rules: `/admin/moderation`
- Campaigns:
  - Campaign Management: `/admin/campaign-management`
  - Applications: `/admin/applications`
  - Deliverables: `/admin/deliverables`
  - Messages: `/admin/messages`
- Compliance:
  - Reports: `/admin/compliance/reports`
- Finance:
  - Reconciliation: `/admin/finance`
- Monitoring:
  - Audit Log: `/admin/audit`
  - System Health: `/admin/health`
- System:
  - Settings: `/admin/settings`
  - Permissions: `/admin/permissions`

### Layout
- `admin-dashboard/app/(admin)/layout.tsx`
- Sidebar: `admin-dashboard/components/layout/admin-sidebar.tsx`

## Backend Modules
Location: `backend/creatorx-service/src/main/java/com/creatorx/service`

### Admin Services
- Audit log: `admin/AdminAuditService.java`
- Admin permissions: `admin/AdminPermissionService.java`
- Campaign review: `admin/AdminCampaignReviewService.java`
- Campaign management: `admin/AdminCampaignManagementService.java`
- User management + appeals: `admin/AdminUserService.java`
- Moderation + flags: `admin/ModerationService.java`
- Compliance (GDPR): `admin/ComplianceService.java`
- Compliance retention: `admin/ComplianceRetentionJob.java`
- Platform settings resolver: `PlatformSettingsResolver.java`
- Platform settings: `admin/PlatformSettingsService.java`
- Finance summary + reports: `admin/AdminFinanceService.java`
- System summary: `admin/AdminSystemService.java`

### Other Services
- Disputes: `DisputeService.java`
- KYC: `KYCService.java`
- Brand verification: `BrandVerificationService.java`

## Admin API Endpoints
All admin endpoints require `ROLE_ADMIN` and an admin permission (RBAC).

### System Summary
- `GET /api/v1/admin/system/summary`
- `GET /api/v1/admin/system/health`
- `GET /api/v1/health`

### Audit Log
- `GET /api/v1/admin/audit`
- `GET /api/v1/admin/audit/export`

### User Management
- `GET /api/v1/admin/users`
- `PUT /api/v1/admin/users/{userId}/status`
- `GET /api/v1/admin/users/appeals`
- `PUT /api/v1/admin/users/appeals/{appealId}/resolve`
- `PUT /api/v1/admin/profiles/user/{userId}`
- `PUT /api/v1/admin/profiles/creator/{userId}`
- `PUT /api/v1/admin/profiles/brand/{userId}`

### KYC Review
- `GET /api/v1/kyc/pending`
- `POST /api/v1/kyc/documents/bulk-review`
- `PUT /api/v1/kyc/documents/{documentId}/approve`
- `PUT /api/v1/kyc/documents/{documentId}/reject`

### Brand Verification
- `GET /api/v1/brand-verification/pending`
- `POST /api/v1/brand-verification/review/{id}`
- `POST /api/v1/brand-verification/bulk-review`

### Moderation
- `GET /api/v1/admin/moderation/rules`
- `POST /api/v1/admin/moderation/rules`
- `PUT /api/v1/admin/moderation/rules/{ruleId}`
- `DELETE /api/v1/admin/moderation/rules/{ruleId}`
- `GET /api/v1/admin/moderation/flags`
- `POST /api/v1/admin/moderation/flags`
- `PUT /api/v1/admin/moderation/flags/{flagId}/resolve`

### Campaign Pre-Approval
- `GET /api/v1/admin/campaigns/pending`
- `PUT /api/v1/admin/campaigns/{campaignId}/approve`
- `PUT /api/v1/admin/campaigns/{campaignId}/reject`

### Campaign Management (Admin-as-Brand)
- `GET /api/v1/admin/campaign-management`
- `GET /api/v1/admin/campaign-management/{campaignId}`
- `POST /api/v1/admin/campaign-management?brandId=...`
- `PUT /api/v1/admin/campaign-management/{campaignId}`
- `DELETE /api/v1/admin/campaign-management/{campaignId}`
- `POST /api/v1/admin/campaign-management/{campaignId}/invite`
- `GET /api/v1/admin/campaign-management/{campaignId}/applications`
- `GET /api/v1/admin/campaign-management/applications`
- `POST /api/v1/admin/campaign-management/applications/{applicationId}/shortlist`
- `POST /api/v1/admin/campaign-management/applications/{applicationId}/select`
- `POST /api/v1/admin/campaign-management/applications/{applicationId}/reject`
- `PUT /api/v1/admin/campaign-management/applications/{applicationId}/status`
- `POST /api/v1/admin/campaign-management/applications/bulk-status`
- `GET /api/v1/admin/campaign-management/{campaignId}/deliverables`
- `POST /api/v1/admin/campaign-management/deliverables/{submissionId}/review`

### Deliverables (Admin Queue)
- `GET /api/v1/admin/campaign-management/deliverables`
- `GET /api/v1/admin/campaign-management/templates?brandId=...`
- `GET /api/v1/admin/campaign-management/templates/{templateId}`
- `POST /api/v1/admin/campaign-management/templates?brandId=...`
- `POST /api/v1/admin/campaign-management/templates/from-campaign/{campaignId}?brandId=...`
- `PUT /api/v1/admin/campaign-management/templates/{templateId}`
- `DELETE /api/v1/admin/campaign-management/templates/{templateId}`

### Admin Messaging
- `GET /api/v1/admin/messages/conversations`
- `GET /api/v1/admin/messages/conversations/{conversationId}/messages`
- `POST /api/v1/admin/messages/conversations/{conversationId}/messages`

### Disputes
- `GET /api/v1/disputes/admin`
- `GET /api/v1/disputes/admin/{disputeId}`
- `PUT /api/v1/disputes/{disputeId}/assign`
- `PUT /api/v1/disputes/{disputeId}/resolve`
- `GET /api/v1/disputes/{disputeId}/notes`
- `POST /api/v1/disputes/{disputeId}/notes`
- `GET /api/v1/disputes/{disputeId}/evidence/admin`

### Compliance (GDPR)
- `GET /api/v1/admin/compliance/gdpr`
- `PUT /api/v1/admin/compliance/gdpr/{requestId}`
- `POST /api/v1/admin/compliance/gdpr/{requestId}/export`
- `POST /api/v1/admin/compliance/gdpr/{requestId}/anonymize`

### Platform Settings
- `GET /api/v1/admin/settings`
- `PUT /api/v1/admin/settings`

### Finance
- `GET /api/v1/admin/finance/summary`
- `GET /api/v1/admin/finance/reports/users`
- `GET /api/v1/admin/finance/reports/campaigns`
- `GET /api/v1/admin/finance/reports/period`
- `GET /api/v1/admin/finance/reports/export`

### Permissions
- `GET /api/v1/admin/permissions/{adminId}`
- `PUT /api/v1/admin/permissions/{adminId}`
- `POST /api/v1/admin/permissions/{adminId}?permission=...`
- `DELETE /api/v1/admin/permissions/{adminId}?permission=...`

## Database Migration
- `backend/creatorx-api/src/main/resources/db/migration/V20__create_admin_phase3_tables.sql`
- `backend/creatorx-api/src/main/resources/db/migration/V21__seed_admin_permissions.sql`
- `backend/creatorx-api/src/main/resources/db/migration/V22__campaign_preapproval.sql`
- `backend/creatorx-api/src/main/resources/db/migration/V23__dispute_admin_extensions.sql`
- `backend/creatorx-api/src/main/resources/db/migration/V26__admin_campaign_manage_permission.sql`
- `backend/creatorx-api/src/main/resources/db/migration/V27__admin_messages_permission.sql`

## Notes
- Admin authentication is enforced via Spring Security roles + RBAC permissions.
- Campaigns are automatically evaluated against moderation rules on create/update.
- Brand publish requests move campaigns to `PENDING_REVIEW` until approved.
- Admins can create, update, pause/resume, invite creators, and review deliverables on behalf of any brand (`ADMIN_CAMPAIGN_MANAGE`).
- Audit log entries are written for KYC, disputes, user actions, campaign review, settings, and compliance workflows.
- Admin tables use backend paging + sorting, with modal confirmations for reject/resolve actions.
- GDPR export/anonymize is handled by the compliance service with retention cleanup and signed URLs.
- KPI summary includes KYC, dispute, and GDPR SLA metrics (GDPR target 72h).

## Audit Coverage (Critical Services)
Critical services and current audit coverage:
- User management: suspend/activate + appeals resolution + admin profile edits logged.
- Moderation: campaign review approvals/rejections and flag resolutions logged.
- Disputes: assignment + resolution logged.
- Compliance: GDPR updates + export/anonymize + tax/regulatory report generation logged.
- Finance: withdrawal approvals/rejections logged.
- Settings: platform settings updates logged.

Pending audit items:
- Payment actions beyond withdrawals (no additional admin payment endpoints implemented yet).

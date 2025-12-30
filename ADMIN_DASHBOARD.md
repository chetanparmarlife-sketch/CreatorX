# Admin Dashboard

This document describes the Phase 3 Admin Dashboard implementation for CreatorX.

## Goals
- Full platform governance and compliance.
- Centralized admin tools for KYC, brand verification, moderation, disputes, audit, and settings.

## Admin UI
Location: `brand-dashboard/app/(admin)`

## Separate Admin App (Port 3002)
The admin dashboard can run as a separate Next.js app from `admin-dashboard/` on port 3002.

Dev commands (run from `brand-dashboard/`):
- `npm run admin:dev`
- `npm run admin:build`
- `npm run admin:start`

### Navigation
- Overview: `/admin`
- Users: `/admin/users`
- KYC Review: `/admin/kyc`
- Brand Verification: `/admin/brands`
- Appeals: `/admin/appeals`
- Campaign Flags: `/admin/campaigns`
- Moderation Rules: `/admin/moderation`
- Disputes: `/admin/disputes`
- GDPR Requests: `/admin/compliance`
- Audit Log: `/admin/audit`
- Finance: `/admin/finance`
- Settings: `/admin/settings`

### Layout
- `brand-dashboard/app/(admin)/layout.tsx`
- Sidebar: `brand-dashboard/components/layout/admin-sidebar.tsx`

## Backend Modules
Location: `backend/creatorx-service/src/main/java/com/creatorx/service`

### Admin Services
- Audit log: `admin/AdminAuditService.java`
- Admin permissions: `admin/AdminPermissionService.java`
- User management + appeals: `admin/AdminUserService.java`
- Moderation + flags: `admin/ModerationService.java`
- Compliance (GDPR): `admin/ComplianceService.java`
- Platform settings: `admin/PlatformSettingsService.java`
- Finance summary: `admin/AdminFinanceService.java`
- System summary: `admin/AdminSystemService.java`

### Other Services
- Disputes: `DisputeService.java`
- KYC: `KYCService.java`
- Brand verification: `BrandVerificationService.java`

## Admin API Endpoints
All admin endpoints require `ROLE_ADMIN`.

### System Summary
- `GET /api/v1/admin/system/summary`

### Audit Log
- `GET /api/v1/admin/audit`

### User Management
- `GET /api/v1/admin/users`
- `PUT /api/v1/admin/users/{userId}/status`
- `GET /api/v1/admin/users/appeals`
- `PUT /api/v1/admin/users/appeals/{appealId}/resolve`

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

### Disputes
- `GET /api/v1/disputes/admin`
- `PUT /api/v1/disputes/{disputeId}/resolve`

### Compliance (GDPR)
- `GET /api/v1/admin/compliance/gdpr`
- `PUT /api/v1/admin/compliance/gdpr/{requestId}`

### Platform Settings
- `GET /api/v1/admin/settings`
- `PUT /api/v1/admin/settings`

### Finance
- `GET /api/v1/admin/finance/summary`

## Database Migration
- `backend/creatorx-api/src/main/resources/db/migration/V20__create_admin_phase3_tables.sql`

## Notes
- Admin authentication is enforced via Spring Security roles.
- Campaigns are automatically evaluated against moderation rules on create/update.
- Audit log entries are written for KYC, dispute, and brand verification admin actions.

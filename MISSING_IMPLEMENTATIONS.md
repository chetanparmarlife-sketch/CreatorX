# Missing Implementations Report

## Critical (Blocks Core Functionality)
1. Deliverable submission not wired in creator app
   - File: app/(app)/(tabs)/active-campaigns.tsx
   - Status: Draft submission updates local state only; `deliverableService.submitDeliverable` not used
   - Impact: Creator uploads never reach backend
   - Effort: MEDIUM

2. Messaging real-time connection missing in clients
   - Files: src/lib/websocket.ts, src/services/WebSocketService.ts, brand-dashboard/lib/services/websocket-service.ts, admin-dashboard/lib/services/websocket-service.ts
   - Status: WebSocket client exists, but UI pages use polling/React Query only
   - Impact: Messages not real-time
   - Effort: MEDIUM

## High Priority (Affects User Experience)
1. Demo auth always enabled in dashboards
   - Files: brand-dashboard/lib/api/auth.ts, admin-dashboard/lib/api/auth.ts
   - Status: `DEMO_MODE` hardcoded true
   - Impact: Auth bypass, masks backend issues
   - Effort: LOW

2. Creator app features default to mock mode
   - File: src/config/featureFlags.ts
   - Status: all USE_API_* flags false
   - Impact: Real API flows disabled by default
   - Effort: LOW

3. KYC UI not connected to backend
   - File: app/(app)/kyc.tsx
   - Status: UI-only, uses local mock data
   - Impact: KYC flow cannot complete
   - Effort: MEDIUM

## Medium Priority (Nice-to-haves)
1. Social connect uses mock service
   - Files: src/services/socialConnectMock.ts, app/(auth)/connect.tsx
   - Status: Mock-only flow
   - Impact: Onboarding not linked to real platform
   - Effort: MEDIUM

2. OTP login uses mock service
   - Files: src/services/otpMock.ts, app/(auth)/login-otp.tsx
   - Status: Mock-only flow
   - Impact: OTP auth not real
   - Effort: MEDIUM

3. Wallet UI uses mock invoices
   - File: app/(app)/(tabs)/wallet.tsx
   - Status: Mock data lists and summaries
   - Impact: No real payment visibility
   - Effort: MEDIUM

## Low Priority (Optional improvements)
1. Misc mock content in social pages
   - Files: brand-dashboard/app/(dashboard)/facebook/page.tsx, instagram/page.tsx, youtube/page.tsx, lists/page.tsx
   - Status: mock influencers/lists
   - Effort: LOW

## TODO/FIXME Findings
- backend/creatorx-service/src/main/java/com/creatorx/service/storage/FileValidationService.java:197 (image dimension validation)
- backend/creatorx-service/src/main/java/com/creatorx/service/BankAccountService.java:85 (penny drop verification)
- backend/creatorx-service/src/main/java/com/creatorx/service/CreatorDiscoveryService.java:50 (criteria/native query)
- backend/creatorx-service/src/main/java/com/creatorx/service/CreatorDiscoveryService.java:162 (completed campaigns calc)
- backend/creatorx-service/src/main/java/com/creatorx/service/CampaignAnalyticsService.java:170 (engagement data)
- backend/creatorx-service/src/main/java/com/creatorx/service/NotificationService.java:235 (online status check)
- backend/creatorx-service/src/main/java/com/creatorx/service/WithdrawalService.java:191 (payout integration)
- backend/creatorx-service/src/main/java/com/creatorx/service/KYCService.java:332 (notify admins)
- backend/creatorx-service/src/main/java/com/creatorx/service/TeamMemberService.java:90 (invite email)

## Error Handling Gaps
- Mobile `fetch` in src/components/OfflineNotice.tsx uses try/catch but no retry/backoff.
- Many API services rely on centralized apiClient error handling; individual calls rarely wrap try/catch.

## Missing Integration Points
- Creator app: deliverables, wallet, messaging, notifications are feature-flagged and default to mock.
- Brand/Admin dashboards: WebSocket clients exist but are not wired to message UIs.

## Summary
- Total TODO/FIXME: 9
- Critical Missing: 2
- High Priority: 3
- Medium Priority: 3
- Low Priority: 1
- Estimated Effort: ~3-5 weeks

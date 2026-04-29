# Mock Data Remaining

Date: 2026-04-29

This file lists remaining mock/TODO/dev/hardcoded comments found in `app/` and `src/`, plus backend contract items that still need manual review. Secret values are not included.

## Resolved On 2026-04-29

| Item | Resolution |
| --- | --- |
| Missing `/add-bank-account` route | Created `app/(app)/add-bank-account.tsx`, registered it in `app/(app)/_layout.tsx`, and wired submit to `walletService.addBankAccount`. |
| KYC back image picker missing | Added an optional back image picker and preview to the existing KYC upload modal, then passed it to the backend as `backFile` / `backImage`. |
| Chat tab hidden | Removed the chat tab `href: null` and wired `messagingUnreadCount` to `tabBarBadge`. |
| Campaign mock fallback | Removed the mock-data fallback branch from `CampaignContext` and now surfaces an error state when campaign data is malformed. |
| Error reporting TODO | Added optional Sentry initialization and crash capture with a safe no-op wrapper when `@sentry/react-native` is not installed. |

## Needs Manual Review

| File | Line | Note |
| --- | ---: | --- |
| `src/api/services/profileService.ts` | 18 | The task text mentioned `/api/v1/creators/profile`, but the Spring Boot backend exposes `/api/v1/profile`; the app uses the existing backend endpoint to avoid creating a 404. |
| `src/api/services/profileService.ts` | 26 | Avatar upload uses `/api/v1/profile/avatar`, which is the endpoint present in the backend. |

## Remaining Hidden Tabs

| File | Line | Note |
| --- | ---: | --- |
| `app/(app)/(tabs)/_layout.tsx` | 231 | `index` still has `href: null`; left unchanged because this task only requested making the chat tab visible. |

## Search Results

| File | Line | Comment |
| --- | ---: | --- |
| `src/services/WebSocketService.ts` | 96 | SockJS endpoint conversion avoids old mock socket URLs. |
| `src/services/WebSocketService.ts` | 102 | Real backend chat uses STOMP over `/ws` instead of polling/mock behavior. |
| `src/services/WebSocketService.ts` | 227 | Real sends publish to `/app/chat.send` instead of creating a local mock message only. |
| `src/api/types.ts` | 370 | Real KYC submission sends the front image to the backend instead of storing only a local mock file URI. |
| `src/api/services/messagingService.ts` | 53 | Backend unread count replaces mock conversation-derived count. |
| `app/(app)/kyc.tsx` | 310 | Pending/approved KYC documents block the old resubmit-anytime mock path. |
| `app/(app)/kyc.tsx` | 363 | KYC submit now sends documents to the backend instead of showing fake local success. |
| `app/(app)/withdraw.tsx` | 84 | Bank accounts now load from the backend instead of a hardcoded withdrawal option. |
| `app/(app)/withdraw.tsx` | 151 | Withdrawal now uses the backend instead of a disabled/fake path. |
| `src/api/services/kycService.ts` | 35 | KYC upload uses backend multipart fields instead of a local mock path. |
| `src/api/services/kycService.ts` | 48 | Optional back-image upload is supported when the UI collects it. |
| `src/api/services/kycService.ts` | 63 | KYC status now comes from the backend instead of a fake completion flag. |
| `src/api/README_MIGRATION.md` | 71 | Migration docs still mention an example mock-data branch. |
| `src/components/ErrorBoundary.tsx` | 52 | Resolved 2026-04-29: production error reporting now calls optional Sentry capture. |
| `src/api/client.ts` | 67 | API calls read the real Supabase token instead of a screen-local mock token. |
| `src/api/client.ts` | 181 | Token refresh stores real backend tokens instead of stale mock data. |
| `src/api/client.ts` | 243 | Logout clears real API/Supabase tokens instead of old mock auth values. |
| `src/types/global.d.ts` | 10 | API URL config now uses `EXPO_PUBLIC_API_URL` instead of legacy mock/backend aliases. |
| `src/context/AuthContext.tsx` | 69 | Logout clears real auth data instead of preserving old mock user payload. |
| `src/context/AuthContext.tsx` | 160 | Auth state changes persist real Supabase refresh tokens. |
| `src/context/AuthContext.tsx` | 175 | Supabase sign-out clears stale mock token storage. |
| `src/context/AuthContext.tsx` | 275 | Real Supabase login replaces fake login token storage. |
| `src/context/AuthContext.tsx` | 303 | Real Supabase signup replaces device-only mock account creation. |
| `src/context/AuthContext.tsx` | 329 | Signup stores real session tokens instead of mock credentials. |
| `src/context/AuthContext.tsx` | 389 | Dev preview no longer creates a fake session. |
| `src/config/env.ts` | 51 | Deployments now require `EXPO_PUBLIC_API_URL` instead of hardcoded mock backend variables. |
| `src/config/env.ts` | 81 | WebSocket URL is derived from the configured API host instead of localhost. |
| `src/context/MessagingContext.tsx` | 185 | Chat list loads backend conversations instead of mock conversations. |
| `src/context/MessagingContext.tsx` | 239 | Conversation screen loads backend messages instead of a mock message array. |
| `src/screens/__tests__/explore.test.tsx` | 94 | Test defaults still use mock values. |
| `src/context/CampaignContext.tsx` | 228 | Resolved 2026-04-29: mock-data fallback was removed and malformed API data now sets an error state. |
| `src/config/featureFlags.ts` | 53 | WebSocket messaging flag is on for real backend chat. |
| `src/lib/websocket.ts` | 39 | Legacy websocket helper now uses configured backend URL instead of localhost. |

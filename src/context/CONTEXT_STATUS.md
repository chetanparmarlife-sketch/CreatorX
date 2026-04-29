# Context Status

Date: 2026-04-29

This file tracks whether each `src/context/` file is connected to real backend data or still has reachable mock/local-only paths.

| Context file | Status | Remaining mock/local-only paths |
| --- | --- | --- |
| `AppFacade.tsx` | Fully connected | None found. AsyncStorage is used only for cleanup of cached app state. |
| `AuthContext.tsx` | Fully connected | None found. Comments mention removed fake/mock auth paths, but authentication uses Supabase and backend tokens. |
| `CampaignContext.tsx` | Partially connected | Lines 588, 600, and 610 now throw clear errors for process payment and add/update deliverable because those actions still need backend endpoints. Lines 509 and 528 throw when approve/reject cannot find a real backend application ID. |
| `ChatContext.tsx` | Partially connected | None from the requested mock search, but offline queue data is stored locally for retry. |
| `MessagingContext.tsx` | Partially connected | Lines 337 and 350 keep an optimistic local message while the real send path runs; review when offline-send queue is productised. |
| `NotificationContext.tsx` | Partially connected | Line 256 keeps a local notification helper for mock/local notifications; backend notification fetch paths should be used for production alerts. |
| `ProfileContext.tsx` | Fully connected | None found. Comments mention removed AsyncStorage-only mock profile paths; backend load/save is active with local cache fallback. |
| `WalletContext.tsx` | Fully connected | None found. AsyncStorage is used only as wallet cache. |
| `contextUtils.ts` | Utility/cache only | None found. AsyncStorage helpers are shared cache utilities, not mock data branches. |
| `index.ts` | Exports only | None found. |

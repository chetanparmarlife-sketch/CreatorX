# Feature Flags Status

Date: 2026-04-28

This file was generated after turning on the real backend paths for auth, profile, KYC, notifications, wallet, and messaging.

## Remaining USE_API Flags Set To False

None found.

## Current Backend Flags

| Flag | What it controls | Current value | Safe to turn on now? |
| --- | --- | --- | --- |
| USE_API_AUTH | Supabase login/signup linked to backend API auth tokens | true | Already on |
| USE_API_CAMPAIGNS | Campaign lists and campaign details from backend | true | Already on |
| USE_API_APPLICATIONS | Campaign applications from backend | true | Already on |
| USE_API_DELIVERABLES | Deliverable lists and submissions from backend | true | Already on |
| USE_API_WALLET | Wallet balance, bank accounts, transactions, and withdrawals | true | Already on |
| USE_API_MESSAGING | Conversations and messages from backend REST endpoints | true | Already on |
| USE_API_MESSAGING_POLLING | Polling fallback for backend conversations/messages | true | Already on |
| USE_API_NOTIFICATIONS | Notifications from backend | true | Already on |
| USE_API_PROFILE | Creator profile load/save from backend | true | Already on |
| USE_API_SOCIAL_CONNECT | Social account connect flows | true | Already on |
| USE_API_KYC | KYC status and document submission from backend | true | Already on |

## Current Realtime/UI Flags

| Flag | What it controls | Current value | Safe to turn on now? |
| --- | --- | --- | --- |
| USE_WS_MESSAGING | STOMP/SockJS chat connection to the backend `/ws` endpoint | true | Already on |
| USE_WS_MESSAGES | Legacy WebSocket message hooks | true | Already on |
| USE_POLLING_MESSAGES | Polling backup for messages | true | Already on |
| USE_WITHDRAWALS_UI | Withdrawal UI for real payout requests | true | Already on |

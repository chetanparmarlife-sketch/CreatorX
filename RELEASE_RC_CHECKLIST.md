# CreatorX Release RC Checklist

## 1) Environment checks
- `EXPO_PUBLIC_API_BASE_URL` is set (non-empty, includes `/api/v1`).
- Token present: user is logged in and `ACCESS_TOKEN` exists in secure storage.

## 2) API contract verification (current endpoints)
- Campaigns
  - GET `/campaigns`
  - Apply: POST `/applications`
- Deliverables
  - Submit: POST `/deliverables` (multipart/form-data)
- Notifications
  - List: GET `/notifications`
  - Unread count: GET `/notifications/unread-count`
  - Mark read: POST `/notifications/{id}/read`
  - Mark all: POST `/notifications/read-all`
- Wallet
  - Summary: GET `/wallet`
  - Transactions: GET `/wallet/transactions`
  - Withdrawals: GET `/wallet/withdrawals`
- Messaging
  - Conversations: GET `/conversations`
  - Messages: GET `/conversations/{id}/messages`
  - Send: POST `/conversations/{id}/messages`
  - Mark read: PUT `/conversations/{id}/mark-read`

## 3) Manual test steps (screen + expected result)

### Campaign discovery + apply
- Screen: `Explore` (tab)
- Steps:
  1) Open Explore and pull-to-refresh.
  2) Verify campaign cards render with titles/brands.
  3) Tap Apply on a campaign, submit application.
- Expected:
  - GET `/campaigns` returns list.
  - POST `/applications` succeeds.
  - Campaign shows “Applied” state and applications list refreshes.

### Deliverable submission
- Screen: `Active Campaigns` (tab)
- Steps:
  1) Open an active campaign.
  2) Upload a deliverable file and submit.
- Expected:
  - POST `/deliverables` (multipart/form-data) succeeds.
  - Deliverable status updates to “submitted”.

### Notifications
- Screen: `Notifications`
- Steps:
  1) Open Notifications and pull-to-refresh.
  2) Tap a notification (mark read).
  3) Tap “mark all read”.
- Expected:
  - GET `/notifications` returns list.
  - GET `/notifications/unread-count` matches badge.
  - POST `/notifications/{id}/read` marks item read.
  - POST `/notifications/read-all` clears unread count.

### Wallet summary + lists
- Screen: `Wallet` (tab)
- Steps:
  1) Open Wallet and pull-to-refresh.
  2) Scroll Transactions and Withdrawals lists.
  3) Open a Transaction detail.
- Expected:
  - GET `/wallet` returns balance and renders summary.
  - GET `/wallet/transactions` paginates without duplicates.
  - GET `/wallet/withdrawals` paginates without duplicates.
  - Transaction detail matches list item fields.

### Messaging
- Screens: `Messages` (tab), `Conversation`
- Steps:
  1) Open Messages list.
  2) Open a conversation.
  3) Send a message.
  4) Leave conversation and return.
- Expected:
  - GET `/conversations` returns list with last message and unread count.
  - GET `/conversations/{id}/messages` returns paginated messages.
  - POST `/conversations/{id}/messages` sends new message.
  - PUT `/conversations/{id}/mark-read` clears unread count.

## 4) Common failure mapping
- `AUTH_REQUIRED` / 401: User is logged out or token missing. Re-login.
- `CONFIG_MISSING`: `EXPO_PUBLIC_API_BASE_URL` missing or empty. Set env and restart.
- `NETWORK_ERROR`: Device offline or backend unreachable. Check connectivity/backend status.

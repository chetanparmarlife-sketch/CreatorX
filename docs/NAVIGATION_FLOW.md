# App Navigation Flow (Business Logic)

## Route Groups

### Auth (`/(auth)`)
- `welcome` -> `login-otp`
- `login-otp` -> app tabs (`/(app)/(tabs)/explore`) or `onboarding-form`
- `onboarding-form` -> app tabs
- `login`/`register` -> app tabs

### App Tabs (`/(app)/(tabs)`)
- `explore` (Home)
- `active-campaigns` (My Campaign)
- `wallet` (Money)
- `profile` (Profile & Settings)
- `more` (Community Hub)
- `chat` (Messages)

### App Stack (`/(app)`)
- `event-details` (Community event detail)
- `notifications`
- `conversation`
- `new-message`
- `campaign-details` -> `apply-to-campaign`
- `saved`
- `documents` / `my-docs`
- `edit-profile`
- `privacy`
- `help`
- `kyc`
- `refer-earn`
- `transaction-detail`
- `analytics`

## Entry Points & Visibility

### Authenticated
- Default landing: `/(app)/(tabs)/explore`
- Bottom tabs expose: Home, My Campaign, Money, Profile, More
- Messages: available from Explore header message icon and `/chat` tab
- Notifications: available from Explore header bell and My Campaign header

### Unauthenticated
- Guarded by `app/_layout.tsx` auth logic
- Redirects to `/(auth)/login-otp`

### Auth Flow (Business)
- New users: Splash -> Welcome -> Login OTP -> Onboarding Form -> Link Social -> Commercial -> Explore
- Existing users: Splash -> Welcome -> Login OTP -> Explore

## Business Logic Rules

### KYC
- Primary entry: Money tab (`/(app)/(tabs)/wallet`) and `/(app)/kyc`
- Wallet shows KYC progress and CTA. If user is not verified, direct to KYC flow.
- If verified, show verification status and allow wallet actions.

### Privacy & Help
- Visible only from Profile settings pages.
- Not placed on bottom tabs to reduce clutter.

### Community Events
- More tab (`/(app)/(tabs)/more`) lists events.
- "View Details" navigates to `/(app)/event-details`.
- RSVP is a call-to-action; backend hookup pending.

### Notifications
- `/(app)/notifications` shows in-app notifications.
- Dynamic notification deep links rely on `notification.action.path`; paths should be validated server-side.

## Known Hidden Screens
- `transaction-detail` is navigated contextually from transactions.
- `conversation` and `new-message` are messages-only flows.

## Navigation Checks
- All route destinations should be reachable from at least one UI affordance.
- Any route without an entry should be intentionally hidden (documented above).

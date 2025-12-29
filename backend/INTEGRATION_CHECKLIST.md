# CreatorX Phase 0 - End-to-End Integration Checklist

## Overview
This checklist validates all critical user flows in CreatorX Phase 0. Each item should be tested manually and marked as complete when verified.

**Last Updated**: 2024-01-01  
**Test Environment**: Development  
**Testers**: [Your Name]

---

## 1. Authentication Flow ✅

### 1.1 Creator Registration
- [ ] **RN-001**: Creator can register via React Native app
  - Open registration screen
  - Fill in: email, password, name, phone, role (CREATOR)
  - Submit registration
  - **Expected**: Success message, redirected to login/onboarding

- [ ] **RN-002**: User record created in Supabase
  - Check Supabase Auth dashboard
  - **Expected**: New user visible with email and role

- [ ] **RN-003**: User record created in Spring Boot DB
  - Query `users` table: `SELECT * FROM users WHERE email = 'test@example.com'`
  - **Expected**: User record exists with `role = 'CREATOR'`, `supabase_id` populated

- [ ] **RN-004**: Creator profile created
  - Query `creator_profiles` table
  - **Expected**: Profile record linked to user

- [ ] **RN-005**: JWT token stored in AsyncStorage
  - Check React Native AsyncStorage (use debugger or log)
  - **Expected**: `access_token` and `refresh_token` stored

- [ ] **RN-006**: User redirected to home screen after registration
  - **Expected**: App navigates to main tab (Explore/Home)

### 1.2 Login Flow
- [ ] **RN-007**: Creator can login with email/password
  - Enter registered email and password
  - Submit login
  - **Expected**: Success, redirected to home

- [ ] **RN-008**: JWT token received and stored
  - Check AsyncStorage after login
  - **Expected**: Tokens stored

- [ ] **RN-009**: User session persists on app restart
  - Close app completely
  - Reopen app
  - **Expected**: User still logged in, no login screen

### 1.3 Token Management
- [ ] **RN-010**: Token auto-refreshes on expiry
  - Wait for token expiry (or manually expire)
  - Make API call
  - **Expected**: Token refreshed automatically, API call succeeds

- [ ] **RN-011**: Token included in API requests
  - Check network logs (React Native Debugger)
  - **Expected**: `Authorization: Bearer <token>` header present

- [ ] **RN-012**: 401 error triggers token refresh
  - Simulate expired token
  - Make API call
  - **Expected**: Token refreshed, request retried

### 1.4 Logout
- [ ] **RN-013**: Logout clears session
  - Tap logout button
  - **Expected**: Redirected to login screen

- [ ] **RN-014**: AsyncStorage cleared on logout
  - Check AsyncStorage after logout
  - **Expected**: Tokens removed

- [ ] **RN-015**: API calls fail after logout
  - Try to fetch campaigns after logout
  - **Expected**: 401 Unauthorized error

---

## 2. Campaign Discovery 🔍

### 2.1 Campaign Listing
- [ ] **RN-016**: React Native app fetches campaigns from Spring Boot API
  - Open Explore/Home screen
  - **Expected**: Campaigns displayed in list

- [ ] **RN-017**: Campaign data matches API response
  - Compare displayed data with API response
  - **Expected**: Title, description, budget, platform match

- [ ] **RN-018**: Only ACTIVE campaigns shown to creators
  - Check API response
  - **Expected**: `status = 'ACTIVE'` for all campaigns

- [ ] **RN-019**: Loading state shows during fetch
  - **Expected**: Skeleton screen or loading indicator

- [ ] **RN-020**: Empty state shows when no campaigns
  - Clear database or filter to no results
  - **Expected**: "No campaigns found" message

### 2.2 Filters
- [ ] **RN-021**: Filter by category works
  - Select "Fashion" category
  - **Expected**: Only Fashion campaigns shown

- [ ] **RN-022**: Filter by platform works
  - Select "INSTAGRAM" platform
  - **Expected**: Only Instagram campaigns shown

- [ ] **RN-023**: Filter by budget range works
  - Set min: 1000, max: 10000
  - **Expected**: Only campaigns within range shown

- [ ] **RN-024**: Multiple filters work together
  - Apply category + platform + budget
  - **Expected**: Results match all filters

- [ ] **RN-025**: Clear filters resets to all campaigns
  - Apply filters, then clear
  - **Expected**: All active campaigns shown

### 2.3 Pagination
- [ ] **RN-026**: Pagination works (infinite scroll)
  - Scroll to bottom of campaign list
  - **Expected**: More campaigns load automatically

- [ ] **RN-027**: Page size is correct (20 items)
  - Check API call parameters
  - **Expected**: `size=20` in request

- [ ] **RN-028**: Loading indicator during pagination
  - Scroll to bottom
  - **Expected**: Loading indicator at bottom

- [ ] **RN-029**: No more items indicator at end
  - Scroll past all items
  - **Expected**: "No more campaigns" message

### 2.4 Search
- [ ] **RN-030**: Search works (full-text)
  - Enter search query in search bar
  - **Expected**: Matching campaigns shown

- [ ] **RN-031**: Search searches title and description
  - Search for text in description
  - **Expected**: Campaign with matching description shown

- [ ] **RN-032**: Search is case-insensitive
  - Search "FASHION" (uppercase)
  - **Expected**: Matches "fashion" campaigns

- [ ] **RN-033**: Empty search shows all campaigns
  - Clear search query
  - **Expected**: All campaigns shown

### 2.5 Campaign Details
- [ ] **RN-034**: Campaign details load correctly
  - Tap on campaign card
  - **Expected**: Details screen opens

- [ ] **RN-035**: All campaign fields displayed
  - Check details screen
  - **Expected**: Title, description, budget, platform, category, dates, deliverables

- [ ] **RN-036**: Brand information displayed
  - Check details screen
  - **Expected**: Brand name, logo (if available)

- [ ] **RN-037**: Deliverables list displayed
  - Check details screen
  - **Expected**: List of required deliverables shown

- [ ] **RN-038**: Apply button visible for creators
  - Check details screen
  - **Expected**: "Apply" button present

---

## 3. Application Submission 📝

### 3.1 Submit Application
- [ ] **RN-039**: Creator can apply to campaign
  - Open campaign details
  - Tap "Apply" button
  - Fill application form (pitch, timeline)
  - Submit
  - **Expected**: Success message, application submitted

- [ ] **RN-040**: Application saved in DB
  - Query `applications` table
  - **Expected**: New record with `status = 'APPLIED'`, `creator_id` and `campaign_id` set

- [ ] **RN-041**: Application appears in creator's applications
  - Navigate to "My Applications" screen
  - **Expected**: Applied campaign visible with status "APPLIED"

- [ ] **RN-042**: Cannot apply twice to same campaign
  - Try to apply to already applied campaign
  - **Expected**: Error message or button disabled

- [ ] **RN-043**: Application deadline enforced
  - Try to apply after deadline
  - **Expected**: Error message "Application deadline passed"

### 3.2 Application Status Updates
- [ ] **RN-044**: Status updates (APPLIED → SHORTLISTED)
  - Brand shortlists application (via API or admin)
  - Refresh creator's applications
  - **Expected**: Status changed to "SHORTLISTED"

- [ ] **RN-045**: Status updates (SHORTLISTED → SELECTED)
  - Brand selects application
  - Refresh creator's applications
  - **Expected**: Status changed to "SELECTED"

- [ ] **RN-046**: Status updates (APPLIED → REJECTED)
  - Brand rejects application
  - Refresh creator's applications
  - **Expected**: Status changed to "REJECTED"

- [ ] **RN-047**: Application feedback displayed
  - Check rejected application
  - **Expected**: Rejection reason/feedback shown

### 3.3 Withdraw Application
- [ ] **RN-048**: Creator can withdraw application
  - Open application with status "APPLIED"
  - Tap "Withdraw" button
  - Confirm withdrawal
  - **Expected**: Application status changed to "WITHDRAWN"

- [ ] **RN-049**: Cannot withdraw selected application
  - Try to withdraw "SELECTED" application
  - **Expected**: Withdraw button disabled or error message

---

## 4. File Upload 📤

### 4.1 Profile Avatar Upload
- [ ] **RN-050**: Creator can upload profile avatar
  - Navigate to Profile screen
  - Tap avatar/change photo
  - Select image from gallery or camera
  - **Expected**: Image picker opens

- [ ] **RN-051**: Image preview before upload
  - Select image
  - **Expected**: Preview shown before upload

- [ ] **RN-052**: Upload progress indicator
  - Start upload
  - **Expected**: Progress bar or spinner shown

- [ ] **RN-053**: File stored in Supabase Storage
  - Check Supabase Storage dashboard
  - **Expected**: File in `avatars` bucket, path: `{userId}/avatar.jpg`

- [ ] **RN-054**: Avatar URL saved in DB
  - Query `user_profiles` table
  - **Expected**: `avatar_url` field populated with Supabase URL

- [ ] **RN-055**: Avatar displays in app
  - Check profile screen
  - **Expected**: Avatar image displayed

- [ ] **RN-056**: Avatar displays in other screens
  - Check campaign details, messages
  - **Expected**: Avatar shown where user info displayed

### 4.2 File Validation
- [ ] **RN-057**: File size validation (5MB max for avatars)
  - Try to upload file > 5MB
  - **Expected**: Error message "File too large"

- [ ] **RN-058**: File type validation (images only)
  - Try to upload PDF or video
  - **Expected**: Error message "Invalid file type"

- [ ] **RN-059**: Upload retry on failure
  - Simulate network failure
  - **Expected**: Retry button shown

---

## 5. Messaging 💬

### 5.1 WebSocket Connection
- [ ] **RN-060**: WebSocket connection established on login
  - Login to app
  - Check network logs
  - **Expected**: WebSocket connection to `ws://localhost:8080/ws`

- [ ] **RN-061**: JWT token sent in WebSocket handshake
  - Check WebSocket connection headers
  - **Expected**: Authorization header with JWT token

- [ ] **RN-062**: Connection persists during app use
  - Use app for 5 minutes
  - **Expected**: WebSocket still connected

- [ ] **RN-063**: Auto-reconnect on connection loss
  - Disable network, then re-enable
  - **Expected**: WebSocket reconnects automatically

### 5.2 Send Message
- [ ] **RN-064**: Creator can send message to brand
  - Open conversation with brand
  - Type message
  - Send
  - **Expected**: Message appears in chat

- [ ] **RN-065**: Message saved in DB
  - Query `messages` table
  - **Expected**: New message record with `content`, `sender_id`, `conversation_id`

- [ ] **RN-066**: Message sent via WebSocket
  - Check WebSocket message logs
  - **Expected**: Message sent to `/app/chat.send`

- [ ] **RN-067**: Real-time delivery to recipient
  - Send message from Creator A
  - Check Brand B's app (or simulate)
  - **Expected**: Message appears immediately in Brand B's chat

- [ ] **RN-068**: Message delivery status shown
  - Send message
  - **Expected**: "Sending..." → "Sent" → "Delivered" status

### 5.3 Receive Messages
- [ ] **RN-069**: Messages received in real-time
  - Brand sends message
  - **Expected**: Message appears in creator's chat immediately

- [ ] **RN-070**: Unread count updates
  - Receive new message
  - **Expected**: Unread badge count increments

- [ ] **RN-071**: Unread count displayed on tab
  - Check Messages tab
  - **Expected**: Badge shows unread count

- [ ] **RN-072**: Conversation list updates
  - Receive new message
  - Check conversation list
  - **Expected**: Conversation moves to top, shows last message preview

### 5.4 Read Receipts
- [ ] **RN-073**: Mark as read works
  - Open conversation with unread messages
  - **Expected**: Messages marked as read, unread count decreases

- [ ] **RN-074**: Read status synced to server
  - Mark message as read
  - Check DB: `messages.read = true`
  - **Expected**: Read status updated

---

## 6. Wallet 💰

### 6.1 Wallet Display
- [ ] **RN-075**: Wallet balance displays correctly
  - Navigate to Wallet screen
  - **Expected**: Current balance shown

- [ ] **RN-076**: Balance matches DB
  - Check `wallets` table
  - **Expected**: Displayed balance = `wallets.balance`

- [ ] **RN-077**: Currency displayed (INR)
  - Check wallet screen
  - **Expected**: "₹" symbol or "INR" shown

- [ ] **RN-078**: Pending balance shown (if any)
  - Check wallet screen
  - **Expected**: Pending earnings displayed separately

### 6.2 Transaction History
- [ ] **RN-079**: Transaction history paginated
  - Scroll transaction list
  - **Expected**: More transactions load (infinite scroll)

- [ ] **RN-080**: Transactions sorted by date (newest first)
  - Check transaction list
  - **Expected**: Most recent transactions at top

- [ ] **RN-081**: Transaction types displayed correctly
  - Check transaction list
  - **Expected**: EARNING, WITHDRAWAL, REFUND, etc. shown

- [ ] **RN-082**: Transaction amounts displayed
  - Check transaction list
  - **Expected**: Amount, status, date shown

- [ ] **RN-083**: Campaign link for earnings
  - Tap on EARNING transaction
  - **Expected**: Navigate to campaign details

### 6.3 Withdrawal
- [ ] **RN-084**: Withdrawal request submitted
  - Navigate to Withdraw screen
  - Enter amount
  - Select bank account
  - Submit
  - **Expected**: Success message, withdrawal request created

- [ ] **RN-085**: Withdrawal saved in DB
  - Query `withdrawal_requests` table
  - **Expected**: New record with `status = 'PENDING'`

- [ ] **RN-086**: Balance updated (pending)
  - Check wallet balance
  - **Expected**: Available balance decreased, pending increased

- [ ] **RN-087**: Minimum withdrawal amount enforced
  - Try to withdraw less than minimum (e.g., ₹100)
  - **Expected**: Error message

- [ ] **RN-088**: Cannot withdraw more than balance
  - Try to withdraw more than available
  - **Expected**: Error message

---

## 7. Notifications 🔔

### 7.1 Fetch Notifications
- [ ] **RN-089**: Notifications fetched from API
  - Navigate to Notifications screen
  - **Expected**: Notifications list loaded

- [ ] **RN-090**: Notifications paginated
  - Scroll notifications list
  - **Expected**: More notifications load

- [ ] **RN-091**: Notification types displayed
  - Check notification list
  - **Expected**: APPLICATION_STATUS_CHANGED, NEW_MESSAGE, etc.

- [ ] **RN-092**: Notification timestamps displayed
  - Check notification list
  - **Expected**: "2 hours ago", "Yesterday", etc.

### 7.2 Unread Count
- [ ] **RN-093**: Unread count badge on tab
  - Check Notifications tab
  - **Expected**: Badge shows unread count

- [ ] **RN-094**: Unread count updates in real-time
  - Receive new notification
  - **Expected**: Badge count increments

- [ ] **RN-095**: Unread count matches API
  - Check API: `GET /api/v1/notifications/unread-count`
  - **Expected**: Badge count = API response

### 7.3 Mark as Read
- [ ] **RN-096**: Mark as read works
  - Tap on notification
  - **Expected**: Notification marked as read, badge count decreases

- [ ] **RN-097**: Mark all as read works
  - Tap "Mark all as read"
  - **Expected**: All notifications marked as read, badge count = 0

- [ ] **RN-098**: Read status synced to server
  - Mark notification as read
  - Check DB: `notifications.read = true`
  - **Expected**: Read status updated

### 7.4 Push Notifications
- [ ] **RN-099**: Push notifications received (when app in background)
  - Send test notification while app in background
  - **Expected**: Push notification received

- [ ] **RN-100**: Push notification opens app
  - Tap on push notification
  - **Expected**: App opens to relevant screen

- [ ] **RN-101**: Notification badge updates
  - Receive push notification
  - **Expected**: App icon badge count updates

---

## 8. Error Handling ⚠️

### 8.1 Network Errors
- [ ] **RN-102**: Network errors show retry UI
  - Disable network
  - Try to fetch campaigns
  - **Expected**: Error message with "Retry" button

- [ ] **RN-103**: Retry works
  - Tap "Retry" button
  - Re-enable network
  - **Expected**: Request retried, data loaded

- [ ] **RN-104**: Offline indicator shown
  - Disable network
  - **Expected**: "No internet connection" banner or icon

### 8.2 Authentication Errors
- [ ] **RN-105**: 401 errors redirect to login
  - Use expired/invalid token
  - Make API call
  - **Expected**: Redirected to login screen

- [ ] **RN-106**: Token refresh on 401
  - Use expired token
  - Make API call
  - **Expected**: Token refreshed automatically, request retried

- [ ] **RN-107**: Session expired message
  - Token expires
  - **Expected**: "Session expired, please login again" message

### 8.3 Server Errors
- [ ] **RN-108**: 500 errors show error message
  - Simulate server error (or use invalid request)
  - **Expected**: "Something went wrong" message

- [ ] **RN-109**: Error message is user-friendly
  - Check error messages
  - **Expected**: No technical jargon, actionable message

### 8.4 Offline Mode
- [ ] **RN-110**: Offline mode works (cached data)
  - Disable network
  - Open app
  - **Expected**: Cached campaigns/data shown

- [ ] **RN-111**: Cache indicator shown
  - Check offline data
  - **Expected**: "Offline" or "Cached" indicator

- [ ] **RN-112**: Cache refreshed on reconnect
  - Go offline, then online
  - **Expected**: Data refreshed automatically

- [ ] **RN-113**: Actions queued when offline
  - Go offline
  - Try to apply to campaign
  - **Expected**: Application queued, submitted when online

---

## 9. Performance & UX 🚀

### 9.1 Loading States
- [ ] **RN-114**: Skeleton screens for initial load
  - Open app fresh
  - **Expected**: Skeleton screens shown, not blank

- [ ] **RN-115**: Pull-to-refresh works
  - Pull down on campaign list
  - **Expected**: Data refreshed

- [ ] **RN-116**: Loading indicators for actions
  - Tap "Apply" button
  - **Expected**: Loading spinner on button

### 9.2 Data Consistency
- [ ] **RN-117**: Data syncs across screens
  - Update profile avatar
  - Check other screens
  - **Expected**: Avatar updated everywhere

- [ ] **RN-118**: Real-time updates work
  - Brand updates campaign
  - Creator's app open
  - **Expected**: Campaign data updates (if subscribed)

---

## Test Summary

**Total Test Cases**: 118  
**Completed**: ___ / 118  
**Passed**: ___ / 118  
**Failed**: ___ / 118  
**Blocked**: ___ / 118

### Test Execution Log

| Date | Tester | Test Cases | Passed | Failed | Notes |
|------|--------|-----------|--------|--------|-------|
|      |        |           |        |        |       |

---

## Notes

- Mark items as complete `[x]` when verified
- Add notes for any failures or issues
- Update test execution log after each testing session
- Re-test failed items after fixes

---

**Next Steps After Phase 0**:
- Brand dashboard (Phase 1)
- Admin panel (Phase 2)
- Advanced analytics (Phase 3)


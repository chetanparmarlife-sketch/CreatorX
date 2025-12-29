# CreatorX Phase 0 - Testing Script

This script provides step-by-step instructions for testing all critical flows in CreatorX Phase 0.

## Prerequisites

1. **Backend Running**
   ```bash
   cd backend
   ./gradlew :creatorx-api:bootRun
   # Or: docker-compose up -d
   ```

2. **Database Setup**
   - PostgreSQL running (via Docker or Supabase)
   - Migrations applied (Flyway auto-runs on startup)

3. **React Native App Running**
   ```bash
   cd .. # to project root
   npm start
   # Or: expo start
   ```

4. **Test Data**
   - Use provided test data scripts or create manually

---

## Test Data Setup

### Create Test Users

```sql
-- Creator User
INSERT INTO users (id, email, phone, password_hash, role, status, email_verified, phone_verified, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'creator@test.com',
  '+919876543210',
  '$2a$10$...', -- Hashed password
  'CREATOR',
  'ACTIVE',
  true,
  false,
  NOW(),
  NOW()
);

-- Brand User
INSERT INTO users (id, email, phone, password_hash, role, status, email_verified, phone_verified, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'brand@test.com',
  '+919876543211',
  '$2a$10$...',
  'BRAND',
  'ACTIVE',
  true,
  false,
  NOW(),
  NOW()
);
```

### Create Test Campaigns

```sql
-- Active Campaign
INSERT INTO campaigns (id, brand_id, title, description, budget, platform, category, status, start_date, end_date, application_deadline, max_applicants, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'brand@test.com'),
  'Summer Fashion Campaign',
  'Promote our summer collection on Instagram',
  50000.00,
  'INSTAGRAM',
  'Fashion',
  'ACTIVE',
  CURRENT_DATE + INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '37 days',
  CURRENT_DATE + INTERVAL '5 days',
  10,
  NOW(),
  NOW()
);
```

---

## Test Execution

### Test Suite 1: Authentication Flow

#### Test 1.1: Creator Registration

**Steps:**
1. Open React Native app
2. Navigate to Registration screen
3. Fill form:
   - Email: `creator@test.com`
   - Password: `Test123!@#`
   - Name: `Test Creator`
   - Phone: `+919876543210`
   - Role: `CREATOR`
4. Tap "Register"
5. Wait for success message

**Expected Results:**
- ✅ Success message displayed
- ✅ Redirected to home/onboarding screen
- ✅ User created in Supabase Auth
- ✅ User record in Spring Boot DB
- ✅ Creator profile created
- ✅ JWT tokens stored in AsyncStorage

**Verification:**
```bash
# Check Supabase Auth dashboard
# Check DB:
psql -d creatorx -c "SELECT * FROM users WHERE email = 'creator@test.com';"
psql -d creatorx -c "SELECT * FROM creator_profiles WHERE user_id = (SELECT id FROM users WHERE email = 'creator@test.com');"
```

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 1.2: Login Flow

**Steps:**
1. Open app (if logged out)
2. Navigate to Login screen
3. Enter:
   - Email: `creator@test.com`
   - Password: `Test123!@#`
4. Tap "Login"
5. Wait for authentication

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to home screen
- ✅ JWT tokens stored
- ✅ User session persists

**Verification:**
- Check AsyncStorage for tokens
- Check network logs for API calls with Authorization header

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 1.3: Token Auto-Refresh

**Steps:**
1. Login to app
2. Wait for token to expire (or manually expire)
3. Make API call (e.g., fetch campaigns)
4. Observe token refresh behavior

**Expected Results:**
- ✅ Token refreshed automatically
- ✅ API call succeeds after refresh
- ✅ No user interruption

**Verification:**
- Check network logs for refresh token call
- Verify new access token stored

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 1.4: Logout

**Steps:**
1. Login to app
2. Navigate to Profile/Settings
3. Tap "Logout"
4. Confirm logout

**Expected Results:**
- ✅ Redirected to login screen
- ✅ AsyncStorage cleared
- ✅ API calls fail with 401

**Verification:**
- Check AsyncStorage (should be empty)
- Try to fetch campaigns (should fail)

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

### Test Suite 2: Campaign Discovery

#### Test 2.1: Fetch Campaigns

**Steps:**
1. Login as creator
2. Navigate to Explore/Home screen
3. Wait for campaigns to load

**Expected Results:**
- ✅ Campaigns displayed in list
- ✅ Loading indicator shown during fetch
- ✅ Only ACTIVE campaigns shown
- ✅ Campaign data matches API response

**Verification:**
```bash
# Check API response
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/v1/campaigns
```

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 2.2: Filter Campaigns

**Steps:**
1. On Explore screen, tap filter icon
2. Select:
   - Category: `Fashion`
   - Platform: `INSTAGRAM`
   - Budget: Min `1000`, Max `50000`
3. Apply filters
4. Observe results

**Expected Results:**
- ✅ Only matching campaigns shown
- ✅ Filter UI updates
- ✅ Results match filter criteria

**Verification:**
- Check API call includes filter parameters
- Verify results match filters

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 2.3: Search Campaigns

**Steps:**
1. On Explore screen, tap search bar
2. Enter query: `summer`
3. Wait for results

**Expected Results:**
- ✅ Matching campaigns shown
- ✅ Search is case-insensitive
- ✅ Searches title and description

**Verification:**
- Check API call includes search parameter
- Verify results contain search term

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 2.4: Pagination (Infinite Scroll)

**Steps:**
1. On Explore screen, scroll to bottom
2. Observe loading behavior
3. Continue scrolling

**Expected Results:**
- ✅ More campaigns load automatically
- ✅ Loading indicator at bottom
- ✅ No duplicate campaigns
- ✅ "No more campaigns" at end

**Verification:**
- Check API calls for page increments
- Verify total count matches

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 2.5: Campaign Details

**Steps:**
1. On Explore screen, tap on a campaign card
2. Wait for details to load

**Expected Results:**
- ✅ Details screen opens
- ✅ All campaign fields displayed
- ✅ Brand information shown
- ✅ Deliverables list shown
- ✅ Apply button visible

**Verification:**
- Compare displayed data with API response
- Check all fields are present

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

### Test Suite 3: Application Submission

#### Test 3.1: Submit Application

**Steps:**
1. Open campaign details
2. Tap "Apply" button
3. Fill application form:
   - Pitch: `I have 100K followers and would love to collaborate...`
   - Timeline: `2 weeks`
4. Tap "Submit"
5. Wait for confirmation

**Expected Results:**
- ✅ Success message displayed
- ✅ Application saved in DB
- ✅ Application appears in "My Applications"
- ✅ Status is "APPLIED"

**Verification:**
```sql
SELECT * FROM applications 
WHERE creator_id = (SELECT id FROM users WHERE email = 'creator@test.com')
ORDER BY applied_at DESC LIMIT 1;
```

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 3.2: Application Status Updates

**Steps:**
1. Submit application (from Test 3.1)
2. Update status via API or admin:
   ```bash
   # Shortlist
   curl -X PUT http://localhost:8080/api/v1/applications/{id}/status \
     -H "Authorization: Bearer <brand_token>" \
     -d '{"status": "SHORTLISTED"}'
   ```
3. Refresh creator's applications screen
4. Observe status change

**Expected Results:**
- ✅ Status updates in real-time
- ✅ Status changes: APPLIED → SHORTLISTED → SELECTED
- ✅ Feedback displayed for rejected applications

**Verification:**
- Check DB for status updates
- Verify UI reflects status

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 3.3: Withdraw Application

**Steps:**
1. Open "My Applications" screen
2. Find application with status "APPLIED"
3. Tap "Withdraw" button
4. Confirm withdrawal

**Expected Results:**
- ✅ Application status changed to "WITHDRAWN"
- ✅ Withdraw button disabled
- ✅ Cannot withdraw selected applications

**Verification:**
- Check DB: `status = 'WITHDRAWN'`
- Verify UI updates

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

### Test Suite 4: File Upload

#### Test 4.1: Upload Profile Avatar

**Steps:**
1. Navigate to Profile screen
2. Tap on avatar/change photo
3. Select image from gallery (or take photo)
4. Confirm selection
5. Wait for upload

**Expected Results:**
- ✅ Image picker opens
- ✅ Preview shown before upload
- ✅ Upload progress indicator
- ✅ File stored in Supabase Storage
- ✅ Avatar URL saved in DB
- ✅ Avatar displays in app

**Verification:**
```sql
SELECT avatar_url FROM user_profiles 
WHERE user_id = (SELECT id FROM users WHERE email = 'creator@test.com');
```
- Check Supabase Storage dashboard

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 4.2: File Validation

**Steps:**
1. Try to upload file > 5MB
2. Try to upload non-image file (PDF, video)
3. Observe error messages

**Expected Results:**
- ✅ File size validation works
- ✅ File type validation works
- ✅ User-friendly error messages

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

### Test Suite 5: Messaging

#### Test 5.1: WebSocket Connection

**Steps:**
1. Login to app
2. Check network logs
3. Navigate to Messages screen

**Expected Results:**
- ✅ WebSocket connection established
- ✅ JWT token sent in handshake
- ✅ Connection persists

**Verification:**
- Check network logs for WebSocket connection
- Verify Authorization header

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 5.2: Send Message

**Steps:**
1. Open conversation with brand (or create new)
2. Type message: `Hello, I'm interested in your campaign`
3. Tap send
4. Observe message delivery

**Expected Results:**
- ✅ Message appears in chat
- ✅ Message saved in DB
- ✅ Message sent via WebSocket
- ✅ Delivery status shown

**Verification:**
```sql
SELECT * FROM messages 
WHERE sender_id = (SELECT id FROM users WHERE email = 'creator@test.com')
ORDER BY created_at DESC LIMIT 1;
```

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 5.3: Receive Messages

**Steps:**
1. Have brand send message (via API or another device)
2. Observe creator's app

**Expected Results:**
- ✅ Message appears in real-time
- ✅ Unread count updates
- ✅ Badge shows on Messages tab
- ✅ Conversation list updates

**Verification:**
- Check WebSocket message received
- Verify unread count in DB

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 5.4: Mark as Read

**Steps:**
1. Open conversation with unread messages
2. Observe read status
3. Check unread count

**Expected Results:**
- ✅ Messages marked as read
- ✅ Unread count decreases
- ✅ Read status synced to server

**Verification:**
```sql
SELECT read FROM messages 
WHERE conversation_id = '{conversation_id}';
```

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

### Test Suite 6: Wallet

#### Test 6.1: Wallet Display

**Steps:**
1. Navigate to Wallet screen
2. Observe balance display

**Expected Results:**
- ✅ Balance displayed correctly
- ✅ Currency shown (INR)
- ✅ Pending balance shown (if any)
- ✅ Balance matches DB

**Verification:**
```sql
SELECT balance, pending_balance FROM wallets 
WHERE user_id = (SELECT id FROM users WHERE email = 'creator@test.com');
```

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 6.2: Transaction History

**Steps:**
1. On Wallet screen, scroll transaction list
2. Observe pagination

**Expected Results:**
- ✅ Transactions displayed
- ✅ Pagination works (infinite scroll)
- ✅ Sorted by date (newest first)
- ✅ Transaction types shown correctly

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 6.3: Withdrawal Request

**Steps:**
1. Navigate to Withdraw screen
2. Enter amount: `5000.00`
3. Select bank account (or add new)
4. Tap "Submit"
5. Wait for confirmation

**Expected Results:**
- ✅ Withdrawal request submitted
- ✅ Request saved in DB
- ✅ Balance updated (pending)
- ✅ Success message displayed

**Verification:**
```sql
SELECT * FROM withdrawal_requests 
WHERE user_id = (SELECT id FROM users WHERE email = 'creator@test.com')
ORDER BY requested_at DESC LIMIT 1;
```

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

### Test Suite 7: Notifications

#### Test 7.1: Fetch Notifications

**Steps:**
1. Navigate to Notifications screen
2. Wait for notifications to load

**Expected Results:**
- ✅ Notifications list loaded
- ✅ Pagination works
- ✅ Notification types displayed
- ✅ Timestamps shown

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 7.2: Unread Count

**Steps:**
1. Check Notifications tab badge
2. Receive new notification
3. Observe badge update

**Expected Results:**
- ✅ Badge shows unread count
- ✅ Badge updates in real-time
- ✅ Count matches API

**Verification:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8080/api/v1/notifications/unread-count
```

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 7.3: Mark as Read

**Steps:**
1. Open notification
2. Tap "Mark all as read"
3. Observe badge count

**Expected Results:**
- ✅ Notification marked as read
- ✅ Badge count decreases
- ✅ Read status synced to server

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

### Test Suite 8: Error Handling

#### Test 8.1: Network Errors

**Steps:**
1. Disable network (airplane mode)
2. Try to fetch campaigns
3. Observe error handling

**Expected Results:**
- ✅ Error message shown
- ✅ Retry button displayed
- ✅ Offline indicator shown
- ✅ Retry works when network restored

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 8.2: Authentication Errors

**Steps:**
1. Use expired/invalid token
2. Make API call
3. Observe behavior

**Expected Results:**
- ✅ 401 error handled
- ✅ Redirected to login
- ✅ Token refresh attempted (if refresh token valid)

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 8.3: Server Errors

**Steps:**
1. Simulate server error (or use invalid request)
2. Observe error message

**Expected Results:**
- ✅ User-friendly error message
- ✅ No technical jargon
- ✅ Actionable message

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

#### Test 8.4: Offline Mode

**Steps:**
1. Go offline
2. Open app
3. Try to use features

**Expected Results:**
- ✅ Cached data shown
- ✅ Offline indicator displayed
- ✅ Actions queued
- ✅ Data refreshed on reconnect

**Pass/Fail**: [ ] Pass [ ] Fail  
**Notes**: _________________________________

---

## Test Report Template

### Test Execution Summary

**Date**: _______________  
**Tester**: _______________  
**Environment**: Development / Staging / Production

**Total Tests**: 118  
**Passed**: ___  
**Failed**: ___  
**Blocked**: ___

### Failed Tests

| Test ID | Description | Error | Status |
|---------|-------------|-------|--------|
|         |             |       |        |

### Blocked Tests

| Test ID | Description | Reason |
|---------|-------------|--------|
|         |             |        |

### Notes

_________________________________  
_________________________________  
_________________________________

---

## Quick Test Checklist

Use this for quick smoke testing:

- [ ] Login works
- [ ] Campaigns load
- [ ] Can apply to campaign
- [ ] Can upload avatar
- [ ] Can send message
- [ ] Wallet balance shows
- [ ] Notifications load
- [ ] Error handling works
- [ ] Offline mode works

---

**End of Testing Script**


# CreatorX React Native App - Visual Preview

## App Overview

CreatorX is a creator-brand collaboration platform built with React Native and Expo. The app provides a seamless experience for creators to discover campaigns, apply, submit deliverables, manage earnings, and communicate with brands.

## Dashboard Previews (Web)

- **Brand Dashboard**: Lifecycle tabs, queue tooling, deliverables SLA, payments filters. See `brand-dashboard/README.md`.
- **Admin Dashboard**: Work Queue with SLA badges, compliance workflows, dispute resolution. See `ADMIN_DASHBOARD.md`.

---

## Screen Previews

### 1. Authentication Flow

#### Login Screen
- **Location**: `app/auth/login.supabase.tsx`
- **Features**:
  - Email/password login
  - Supabase authentication integration
  - "Forgot Password" link
  - "Register" navigation
  - Dark theme with gradient background

#### Registration Screen
- **Location**: `app/auth/register.supabase.tsx`
- **Features**:
  - Email, password, name, phone registration
  - Role selection (Creator/Brand)
  - Form validation
  - Terms & conditions acceptance

---

### 2. Main Tabs Navigation

#### Explore Tab (Home)
- **Location**: `app/(tabs)/explore.tsx`
- **Features**:
  - Campaign discovery grid/list
  - Platform filters (Instagram, YouTube, LinkedIn)
  - Category filters (Fashion, Beauty, Tech, etc.)
  - Budget range slider
  - Search bar with full-text search
  - Campaign cards showing:
    - Brand logo and name
    - Campaign title
    - Budget amount
    - Platform icons
    - Deadline countdown
    - Save/bookmark button
  - Infinite scroll pagination
  - Pull-to-refresh
  - Empty state with illustration
  - Loading skeletons

**Campaign Card Preview**:
```
┌─────────────────────────────────┐
│  [Brand Logo]  Brand Name       │
│  ─────────────────────────────   │
│  Campaign Title                 │
│  Description preview...         │
│  ─────────────────────────────   │
│  💰 ₹50,000  📅 5 days left     │
│  📱 Instagram  🏷️ Fashion       │
│  [Save] [Apply]                 │
└─────────────────────────────────┘
```

#### Active Campaigns Tab
- **Location**: `app/(tabs)/active-campaigns.tsx`
- **Features**:
  - List of creator's selected campaigns
  - Campaign status indicators
  - Deliverable checklist
  - Payment status badges
  - Progress tracking
  - Deadline warnings

**Active Campaign Preview**:
```
┌─────────────────────────────────┐
│  Active Campaigns (3)           │
│  ─────────────────────────────   │
│  ✅ Summer Fashion Collection    │
│     StyleCo • ₹15,000           │
│     📅 Due: Dec 15, 2024        │
│     [2/3 Deliverables Complete] │
│  ─────────────────────────────   │
│  ⏳ Tech Product Review          │
│     TechBrand • ₹25,000         │
│     📅 Due: Dec 20, 2024        │
│     [1/2 Deliverables Complete] │
└─────────────────────────────────┘
```

#### Wallet Tab
- **Location**: `app/(tabs)/wallet.tsx`
- **Features**:
  - Balance display (Available, Pending, Withdrawn)
  - Monthly earnings chart
  - Transaction history list
  - Withdrawal button
  - Bank account management
  - Transaction filters

**Wallet Screen Preview**:
```
┌─────────────────────────────────┐
│  💰 Wallet                      │
│  ─────────────────────────────   │
│  Available Balance              │
│  ₹45,230                        │
│  ─────────────────────────────   │
│  Pending: ₹8,500                │
│  Withdrawn: ₹12,000             │
│  ─────────────────────────────   │
│  [Request Withdrawal]           │
│  ─────────────────────────────   │
│  Recent Transactions            │
│  • Earning: +₹15,000            │
│    Campaign: Summer Fashion     │
│    Dec 10, 2024                 │
│  • Withdrawal: -₹5,000         │
│    Status: Processing           │
│    Dec 5, 2024                  │
└─────────────────────────────────┘
```

#### Chat Tab
- **Location**: `app/(tabs)/chat.tsx`
- **Features**:
  - Conversation list
  - Unread message badges
  - Last message preview
  - Online/offline indicators
  - Search conversations
  - Empty state

**Chat List Preview**:
```
┌─────────────────────────────────┐
│  💬 Messages (2)                │
│  ─────────────────────────────   │
│  StyleCo                        │
│  Thanks for the submission! 🔴2  │
│  2 hours ago                    │
│  ─────────────────────────────   │
│  TechBrand                      │
│  Can you add more details?      │
│  Yesterday                      │
└─────────────────────────────────┘
```

#### Profile Tab
- **Location**: `app/(tabs)/profile.tsx`
- **Features**:
  - User avatar (uploadable)
  - Name, username, bio
  - Verification badges
  - Social media links
  - Portfolio showcase
  - Statistics (followers, engagement)
  - Settings menu
  - KYC status

**Profile Screen Preview**:
```
┌─────────────────────────────────┐
│  [Avatar]  ✓ Verified           │
│  @rahulcreates                  │
│  Creative content creator        │
│  ─────────────────────────────   │
│  📊 125K followers               │
│  📈 5.5% engagement              │
│  ─────────────────────────────   │
│  Portfolio (6 items)            │
│  [Grid of portfolio images]     │
│  ─────────────────────────────   │
│  Settings                       │
│  • Edit Profile                 │
│  • KYC Documents                │
│  • Notifications                │
│  • Privacy                      │
│  • Help & Support               │
└─────────────────────────────────┘
```

---

### 3. Key Feature Screens

#### Campaign Details Modal
- **Features**:
  - Full campaign description
  - Brand information
  - Deliverable requirements
  - Budget breakdown
  - Application deadline
  - Apply button (if eligible)
  - Save/unsave toggle

#### Application Form Modal
- **Features**:
  - Pitch text input (50-1000 chars)
  - Timeline/availability input
  - Character counter
  - Submit button with loading state
  - Validation errors

#### Conversation Screen
- **Location**: `app/conversation.tsx`
- **Features**:
  - Message list (newest at bottom)
  - Message bubbles (sent/received)
  - Timestamps
  - Delivery status indicators
  - Typing indicator
  - Message input with send button
  - Attachment support (future)

#### Notifications Screen
- **Location**: `app/notifications.tsx`
- **Features**:
  - Notification list
  - Unread indicators
  - Notification types (icons)
  - Timestamps
  - Mark all as read button
  - Navigation to related screens

#### KYC Screen
- **Location**: `app/kyc.tsx`
- **Features**:
  - Document type selection
  - File upload interface
  - Document preview
  - Status indicators (Pending, Approved, Rejected)
  - Submission history

---

## Design System

### Colors
- **Primary**: Gradient (purple to blue)
- **Background**: Dark (#0a0a0a)
- **Card**: Semi-transparent with blur
- **Text**: White/Light gray
- **Accent**: Brand-specific colors

### Typography
- **Headings**: Bold, large
- **Body**: Regular, medium
- **Captions**: Light, small
- **Monospace**: For amounts, codes

### Components
- **Glass Cards**: Frosted glass effect
- **Gradient Buttons**: Animated gradients
- **Badges**: Rounded, colored
- **Icons**: Expo Vector Icons
- **Skeletons**: Shimmer loading states

---

## User Flows

### Flow 1: Discover & Apply
1. Open app → Explore tab
2. Browse campaigns
3. Apply filters/search
4. Tap campaign card
5. View details
6. Tap "Apply"
7. Fill application form
8. Submit
9. See confirmation

### Flow 2: Submit Deliverable
1. Active Campaigns tab
2. Tap active campaign
3. View deliverables list
4. Tap deliverable
5. Upload file (image/video)
6. Add description
7. Submit
8. See status update

### Flow 3: Withdraw Earnings
1. Wallet tab
2. View balance
3. Tap "Request Withdrawal"
4. Enter amount
5. Select bank account
6. Confirm
7. See pending status

### Flow 4: Real-time Messaging
1. Chat tab
2. Tap conversation
3. View message history
4. Type message
5. Send (WebSocket)
6. See real-time delivery
7. Receive response

---

## Technical Highlights

### Performance
- Lazy loading for images
- Pagination for lists
- Optimistic UI updates
- Caching with AsyncStorage
- Code splitting

### Offline Support
- Cached data display
- Offline indicators
- Action queuing
- Auto-sync on reconnect

### Real-time Features
- WebSocket messaging
- Push notifications
- Live unread counts
- Status updates

---

## Launch Instructions

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Start backend (in another terminal)
cd backend && docker-compose up -d

# 3. Start Expo dev server
npm run dev

# 4. Scan QR code with Expo Go app
# OR press 'i' for iOS, 'a' for Android, 'w' for web
```

### Environment Setup
Create `.env.development`:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws
```

---

## Screenshots Locations

After launching the app, take screenshots of:
- Login/Register screens
- Explore tab with campaigns
- Campaign details modal
- Active campaigns list
- Wallet screen
- Chat conversations
- Profile screen
- Notifications

Save screenshots in `test-results/screenshots/` for documentation.

---

## Next Steps

1. **Launch App**: Follow APP_LAUNCH_GUIDE.md
2. **Test Features**: Follow INTEGRATION_CHECKLIST.md
3. **Document Results**: Update TEST_RESULTS.md
4. **Report Bugs**: Add to BUGS.md

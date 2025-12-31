# CreatorX React Native App - Launch Guide

## Web Dashboards

- Brand Dashboard: `brand-dashboard/SETUP.md`
- Admin Dashboard: `admin-dashboard/SETUP.md`

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn installed
- Expo CLI installed globally (optional): `npm install -g expo-cli`
- Expo Go app on your phone (iOS/Android) OR iOS Simulator / Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Or using yarn
yarn install
```

### Launch Options

#### Option 1: Local Development (Recommended)
```bash
# Start Expo development server (no tunnel)
npm run dev:local

# Or using npx
npx expo start --port 5000
```

This will:
- Start Metro bundler
- Open Expo DevTools in browser
- Show QR code for scanning with Expo Go app
- Provide options to open in iOS Simulator, Android Emulator, or Web

**For physical device on same WiFi:**
1. Find your computer's IP address
2. Update `.env.local` with IP instead of localhost
3. Restart Expo dev server
4. Scan QR code

#### Option 2: Platform-Specific
```bash
# iOS Simulator (Mac only)
npm run dev:ios

# Android Emulator
npm run dev:android

# Web Browser
npm run dev:web
```

#### Option 3: Tunnel Mode (for remote testing only)
```bash
# Uses Expo tunnel service (requires internet)
npm run dev:tunnel
```

**Note:** Tunnel mode is only needed if testing on device not on same WiFi network.

## App Structure Preview

### Main Navigation (Tabs)

1. **Explore Tab** (`app/(tabs)/explore.tsx`)
   - Campaign discovery
   - Filters (category, platform, budget)
   - Search functionality
   - Campaign cards with details

2. **Active Campaigns Tab** (`app/(tabs)/active-campaigns.tsx`)
   - Creator's active campaigns
   - Deliverable submissions
   - Payment status

3. **Wallet Tab** (`app/(tabs)/wallet.tsx`)
   - Balance display
   - Transaction history
   - Withdrawal requests

4. **Chat Tab** (`app/(tabs)/chat.tsx`)
   - Conversation list
   - Real-time messaging
   - Unread message count

5. **Profile Tab** (`app/(tabs)/profile.tsx`)
   - User profile
   - Portfolio items
   - Settings

### Key Screens

- **Authentication**: `app/auth/login.supabase.tsx`, `app/auth/register.supabase.tsx`
- **Campaign Details**: Modal from explore screen
- **Application Form**: Modal for applying to campaigns
- **Conversation**: `app/conversation.tsx` - Individual chat screen
- **Notifications**: `app/notifications.tsx`
- **KYC**: `app/kyc.tsx` - Document submission
- **Edit Profile**: `app/edit-profile.tsx`

## App Preview Features

### Theme
- **Dark Mode**: Default (configurable)
- **Colors**: Custom theme with gradients
- **Typography**: Custom font system

### UI Components
- Glass morphism cards
- Gradient buttons
- Skeleton loaders
- Empty states
- Error states with retry
- Pull-to-refresh

### Key Features
- ✅ Campaign browsing with filters
- ✅ Application submission
- ✅ Real-time messaging (WebSocket)
- ✅ Wallet management
- ✅ File uploads (avatars, KYC, deliverables)
- ✅ Push notifications
- ✅ Offline support with caching

## Testing the App

### 1. Start Backend First
```bash
cd backend
docker-compose up -d
```

### 2. Configure Environment
Ensure `.env.development` is set:
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws
```

### 3. Launch App
```bash
npm run dev
```

### 4. Connect Device
- **Physical Device**: Scan QR code with Expo Go app
- **iOS Simulator**: Press `i` in terminal
- **Android Emulator**: Press `a` in terminal
- **Web Browser**: Press `w` in terminal

## Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache and restart
npx expo start -c
```

### Port Already in Use
```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Expo Go Connection Issues
- Ensure phone and computer are on same WiFi
- Use tunnel mode if on different networks
- Check firewall settings

## Development Tips

### Hot Reload
- Enabled by default
- Changes reflect immediately
- Press `r` in terminal to reload manually

### Debugging
- Shake device to open developer menu
- Enable remote debugging
- Use React Native Debugger
- Use Flipper for advanced debugging

### Network Debugging
- Use React Native Debugger Network tab
- Use Flipper Network plugin
- Check API calls in browser DevTools (Web)

## Next Steps

1. **Start Backend**: Ensure Docker services are running
2. **Load Test Data**: Run test-data-setup.sql
3. **Launch App**: Run `npm run dev`
4. **Test Features**: Follow INTEGRATION_CHECKLIST.md
5. **Review Results**: Check TEST_RESULTS.md

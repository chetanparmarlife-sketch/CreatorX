# Running CreatorX Without Backend

## Current Status ✅

**Good news!** The app is configured to work **without the backend** using mock data. All feature flags are set to use mock data by default, so you can explore the full UI and functionality.

## What Works Without Backend

✅ **All UI Screens** - Explore, Profile, Wallet, Chat, etc.
✅ **Mock Campaign Data** - Sample campaigns to browse
✅ **Mock User Profile** - Sample user data
✅ **Mock Wallet** - Sample transactions and balance
✅ **Mock Messages** - Sample chat conversations
✅ **All Navigation** - Full app navigation works
✅ **UI Interactions** - Buttons, modals, forms all work

## Feature Flags (Mock Data Enabled)

The app uses feature flags to toggle between mock and real API. Currently, all flags are set to `false`, meaning **mock data is used**:

```typescript
USE_API_AUTH: false          // Using mock auth
USE_API_CAMPAIGNS: false     // Using mock campaigns
USE_API_APPLICATIONS: false  // Using mock applications
USE_API_DELIVERABLES: false  // Using mock deliverables
USE_API_WALLET: false        // Using mock wallet
USE_API_MESSAGING: false     // Using mock messages
USE_API_NOTIFICATIONS: false // Using mock notifications
USE_API_PROFILE: false       // Using mock profile
```

## Installing Backend (Optional)

If you want to run the backend later, you have two options:

### Option 1: Docker Desktop (Recommended)

**Why Docker?**
- Easiest setup - one command starts everything
- Includes PostgreSQL, Redis, Spring Boot, Supabase Studio
- No need to install Java, PostgreSQL, Redis separately

**Installation:**
1. Download Docker Desktop: https://www.docker.com/products/docker-desktop
2. Install and start Docker Desktop
3. Run: `npm run start:backend`
4. Wait for services to start (takes 1-2 minutes)
5. Backend will be available at `http://localhost:8080`

**Verify Backend:**
```bash
curl http://localhost:8080/actuator/health
# Should return: {"status":"UP"}
```

### Option 2: Native Java Setup

**Requirements:**
- Java JDK 17 or higher
- PostgreSQL 14+
- Redis 6+
- Gradle 7+

**Installation Steps:**

1. **Install Java JDK 17+**
   - Windows: Download from https://adoptium.net/
   - Mac: `brew install openjdk@17`
   - Linux: `sudo apt install openjdk-17-jdk`

2. **Install PostgreSQL**
   - Windows: https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql@14`
   - Linux: `sudo apt install postgresql-14`

3. **Install Redis**
   - Windows: Use WSL or Docker
   - Mac: `brew install redis`
   - Linux: `sudo apt install redis-server`

4. **Configure Database**
   - Create database: `createdb creatorx`
   - Update `backend/creatorx-api/src/main/resources/application.properties`

5. **Run Backend**
   ```bash
   cd backend/creatorx-api
   ./gradlew bootRun
   ```

## Enabling Real API (When Backend is Ready)

Once the backend is running, you can enable real API calls by updating feature flags:

### Method 1: Programmatically (Recommended)

Add this to your app initialization or a settings screen:

```typescript
import { featureFlags } from '@/src/config/featureFlags';

// Enable all API features
await featureFlags.setFlag('USE_API_CAMPAIGNS', true);
await featureFlags.setFlag('USE_API_APPLICATIONS', true);
await featureFlags.setFlag('USE_API_WALLET', true);
await featureFlags.setFlag('USE_API_MESSAGING', true);
await featureFlags.setFlag('USE_API_NOTIFICATIONS', true);
await featureFlags.setFlag('USE_API_PROFILE', true);
```

### Method 2: Clear AsyncStorage

The feature flags are stored in AsyncStorage. Clear app data to reset to defaults (all mock).

## Current App Status

- **Frontend**: ✅ Running at http://localhost:8082
- **Backend**: ❌ Not running (using mock data)
- **Database**: ❌ Not needed (using mock data)
- **Supabase**: ⚠️ Optional (only needed for file storage)

## Testing the App

You can fully test the app UI without the backend:

1. **Explore Screen** - Browse mock campaigns
2. **Profile Screen** - View mock user profile
3. **Wallet Screen** - See mock transactions
4. **Chat Screen** - View mock conversations
5. **Campaign Details** - Open and view campaign modals
6. **Application Forms** - Fill out application forms (saved locally)

## When You Need Backend

You'll need the backend running for:

- **Real Authentication** - Login/Register with actual users
- **Real Campaign Data** - Fetch campaigns from database
- **Real Applications** - Submit applications to backend
- **Real File Uploads** - Upload avatars, deliverables, KYC documents
- **Real Messaging** - Send/receive actual messages
- **Real Wallet** - Process actual payments
- **Real Notifications** - Receive push notifications

## Troubleshooting

### App Shows "No campaigns found"
- This is normal - it means mock data hasn't loaded yet
- Check browser console for any errors
- Try refreshing the app

### API Calls Failing
- This is expected without backend
- The app will gracefully fall back to mock data
- Check feature flags are set to `false` (mock mode)

### Want to Test Real API?
1. Install Docker Desktop
2. Run `npm run start:backend`
3. Wait for backend to start
4. Enable feature flags (see above)
5. Restart the app

## Next Steps

1. **Explore the UI** - Test all screens and interactions
2. **Review Mock Data** - See what data structure is used
3. **Install Docker** (optional) - When ready to test with backend
4. **Enable API Flags** (optional) - When backend is running

## Summary

✅ **You can use the app right now** - All UI works with mock data
✅ **No backend required** - Feature flags use mock data by default
✅ **Full functionality** - Explore, Profile, Wallet, Chat all work
⚠️ **Backend optional** - Install Docker/Java when ready to test real API

Enjoy exploring the CreatorX app! 🎉



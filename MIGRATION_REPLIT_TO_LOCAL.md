# Migration Guide: Replit Cloud to Local Development

This guide documents the migration from Replit cloud environment to local development setup.

## What Changed

### Removed Cloud Dependencies

1. **Tunnel Mode**: Removed `--tunnel` flag from default dev script
   - **Before**: `npx expo start --tunnel --port 5000`
   - **After**: `npx expo start --port 5000`
   - **Why**: Tunnel requires Expo cloud service, not needed for local dev

2. **Replit Configuration**: `.replit` file kept but documented as Replit-only
   - File still exists for Replit compatibility
   - Not used for local development

3. **Tunnel Scripts**: Updated to remove tunnel requirement
   - `start-mobile.sh` - Removed `--tunnel` flag
   - `expo-tunnel.js` - Kept for optional use

### Added Local Development Support

1. **Environment Files**:
   - `.env.local` - Local configuration (gitignored)
   - `.env.example` - Template for setup
   - Both support localhost URLs

2. **New Scripts**:
   - `dev:local` - Local development (no tunnel)
   - `dev:ios` - iOS Simulator
   - `dev:android` - Android Emulator
   - `dev:web` - Web Browser
   - `dev:tunnel` - Tunnel mode (optional, for remote testing)
   - `start:backend` - Start Docker services
   - `start:all` - Start backend + frontend

3. **Setup Scripts**:
   - `setup-local.sh` - Automated setup (Mac/Linux)
   - `setup-local.bat` - Automated setup (Windows)

4. **Configuration Updates**:
   - `src/config/env.ts` - Improved localhost detection
   - `src/config/supabase.ts` - Better error handling
   - `src/lib/websocket.ts` - Uses WS_BASE_URL from env

## Migration Steps

### Step 1: Run Setup Script

**Windows:**
```bash
setup-local.bat
```

**Mac/Linux:**
```bash
chmod +x setup-local.sh
./setup-local.sh
```

### Step 2: Configure Environment

1. Edit `.env.local`:
   ```env
   EXPO_PUBLIC_ENV=dev
   EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
   EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
   ```

2. Get Supabase credentials from your Supabase dashboard

### Step 3: Start Backend

```bash
npm run start:backend
```

Or manually:
```bash
cd backend
docker-compose up -d
```

### Step 4: Start App

```bash
npm run dev:local
```

**For physical device:**
1. Find your computer's IP address
2. Update `.env.local` with IP instead of localhost
3. Restart Expo dev server
4. Scan QR code

## Key Differences

### Replit vs Local

| Feature | Replit | Local |
|---------|--------|-------|
| Tunnel | Required | Optional |
| Backend URL | Cloud URL | localhost:8080 |
| WebSocket | Cloud URL | ws://localhost:8080/ws |
| Port | Dynamic | Fixed (5000) |
| Network | Cloud network | Local network |
| Setup | Automatic | Manual (one-time) |

### URL Configuration

**Replit (Cloud):**
- Backend: Cloud-provided URL
- WebSocket: Cloud-provided URL
- Automatic port mapping

**Local:**
- Backend: `http://localhost:8080` (or your IP)
- WebSocket: `ws://localhost:8080/ws` (or your IP)
- Fixed ports

## Verification

After migration, verify:

1. **Backend accessible:**
   ```bash
   curl http://localhost:8080/actuator/health
   ```
   Should return: `{"status":"UP"}`

2. **App starts:**
   ```bash
   npm run dev:local
   ```
   Should show QR code and dev server URL

3. **Environment loaded:**
   Check console for:
   ```
   📍 Local Development Mode
      API: http://localhost:8080/api/v1
      WebSocket: ws://localhost:8080/ws
   ```

4. **Supabase configured:**
   Check console for:
   ```
   ✅ Supabase configured
      URL: https://your-project.supabase.co
   ```

## Troubleshooting Migration

### Issue: App still tries to use tunnel

**Solution:** Ensure you're using `npm run dev:local` not `npm run dev` (if dev still has tunnel)

### Issue: Can't connect to backend

**Solution:** 
1. Verify backend is running: `docker ps`
2. Check `.env.local` has correct URL
3. For physical device, use IP address not localhost

### Issue: Environment variables not loading

**Solution:**
1. Ensure `.env.local` exists in root directory
2. Restart Expo dev server after changing `.env.local`
3. Check file is named exactly `.env.local` (not `.env.local.txt`)

### Issue: WebSocket connection fails

**Solution:**
1. Verify `EXPO_PUBLIC_WS_URL` in `.env.local`
2. Check backend WebSocket endpoint is running
3. For physical device, use `ws://YOUR_IP:8080/ws`

## Rollback (If Needed)

If you need to use Replit again:

1. Use tunnel mode:
   ```bash
   npm run dev:tunnel
   ```

2. Update `.env.local` with Replit URLs (if different)

3. The `.replit` file is still present for Replit compatibility

## Benefits of Local Development

1. **Faster**: No cloud latency
2. **Offline**: Works without internet (except Supabase)
3. **Debugging**: Easier to debug local services
4. **Control**: Full control over environment
5. **Cost**: No cloud service dependencies
6. **Privacy**: Data stays on your machine

## Next Steps

- See `LOCAL_DEVELOPMENT.md` for detailed setup
- See `QUICK_START.md` for quick reference
- See `APP_LAUNCH_GUIDE.md` for app features




# CreatorX Local Development Guide

Complete guide for setting up and running CreatorX locally on your machine.

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Docker Desktop** (optional, for backend services) - [Download](https://www.docker.com/products/docker-desktop)
  - **Note**: Backend is optional! The app works with mock data by default. See `RUNNING_WITHOUT_BACKEND.md` for details.
- **Git** - [Download](https://git-scm.com/)

## Quick Setup

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
setup-local.bat
```

**Mac/Linux:**
```bash
chmod +x setup-local.sh
./setup-local.sh
```

This script will:
- Check Node.js and npm versions
- Install dependencies
- Create `.env.local` file
- Verify Docker (if installed)
- Check backend connectivity

### Option 2: Manual Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Configure Supabase:**
   Edit `.env.local` and add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## Starting the Application

### Step 1: Start Backend Services

**Using Docker Compose (Recommended):**
```bash
cd backend
docker-compose up -d
```

Or from root directory:
```bash
npm run start:backend
```

**Verify backend is running:**
```bash
curl http://localhost:8080/actuator/health
```

Expected response: `{"status":"UP"}`

### Step 2: Start React Native App

**Standard local mode (no tunnel):**
```bash
npm run dev:local
```

**Platform-specific:**
```bash
npm run dev:ios      # iOS Simulator
npm run dev:android  # Android Emulator
npm run dev:web      # Web Browser
```

**With tunnel (only if needed for remote testing):**
```bash
npm run dev:tunnel
```

### Step 3: Connect Your Device

**Option A: Same WiFi Network (Recommended)**
1. Find your computer's IP address:
   - **Windows**: `ipconfig` (look for IPv4 Address)
   - **Mac/Linux**: `ifconfig` or `ip addr` (look for inet)
2. Update `.env.local`:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:8080/api/v1
   EXPO_PUBLIC_WS_URL=ws://YOUR_IP:8080/ws
   ```
   Example: `http://192.168.1.100:8080/api/v1`
3. Restart Expo dev server
4. Scan QR code with Expo Go app

**Option B: Emulator/Simulator**
- **iOS Simulator**: Press `i` in terminal (Mac only)
- **Android Emulator**: Press `a` in terminal
- Uses `localhost` automatically

**Option C: Web Browser**
- Press `w` in terminal
- Opens in default browser
- Uses `localhost` automatically

## Environment Configuration

### Environment Files

- **`.env.local`** - Your local configuration (gitignored)
- **`.env.example`** - Template (committed to git)
- **`.env.development`** - Optional dev profile

### Required Variables

```env
# Environment
EXPO_PUBLIC_ENV=dev

# Backend API
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create new)
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Network Configuration

### Localhost vs IP Address

| Scenario | Use | Example |
|----------|-----|---------|
| iOS Simulator | `localhost` | `http://localhost:8080` |
| Android Emulator | `10.0.2.2` | `http://10.0.2.2:8080` |
| Web Browser | `localhost` | `http://localhost:8080` |
| Physical Device (same WiFi) | Your IP | `http://192.168.1.100:8080` |
| Physical Device (different network) | Tunnel or ngrok | `https://your-tunnel.ngrok.io` |

### Finding Your IP Address

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**Mac/Linux:**
```bash
ifconfig | grep "inet "
# Or
ip addr show | grep "inet "
```

### Android Emulator Special Case

Android emulator uses `10.0.2.2` to access host machine's localhost.

Update `.env.local`:
```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8080/api/v1
EXPO_PUBLIC_WS_URL=ws://10.0.2.2:8080/ws
```

## Troubleshooting

### Issue: "Network request failed"

**Symptoms:** App can't connect to backend

**Solutions:**
1. Verify backend is running:
   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. Check `.env.local` has correct URL:
   - Simulator/Emulator: Use `localhost` or `10.0.2.2` (Android)
   - Physical device: Use your computer's IP address

3. Check firewall settings:
   - Allow port 8080 (backend)
   - Allow port 5000 (Expo dev server)

4. Verify same WiFi network (for physical devices)

### Issue: "Cannot connect to WebSocket"

**Symptoms:** Real-time features not working

**Solutions:**
1. Check `EXPO_PUBLIC_WS_URL` in `.env.local`
2. Verify backend WebSocket endpoint is accessible
3. Check browser/device console for WebSocket errors
4. Ensure WebSocket URL uses `ws://` (not `http://`)

### Issue: "Supabase authentication failed"

**Symptoms:** Login/register not working

**Solutions:**
1. Verify Supabase credentials in `.env.local`
2. Check Supabase project is active
3. Verify API keys are correct (anon key, not service role key)
4. Check Supabase project URL is correct

### Issue: Port already in use

**Symptoms:** `Error: Port 5000 is already in use`

**Solutions:**
1. Find and kill process using port:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill
   ```

2. Or use different port:
   ```bash
   npx expo start --port 5001
   ```

### Issue: Backend not accessible

**Symptoms:** Backend health check fails

**Solutions:**
1. Verify Docker is running:
   ```bash
   docker ps
   ```

2. Check backend logs:
   ```bash
   cd backend
   docker-compose logs spring-boot-app
   ```

3. Restart backend:
   ```bash
   cd backend
   docker-compose restart spring-boot-app
   ```

4. Check backend port:
   ```bash
   # Should return {"status":"UP"}
   curl http://localhost:8080/actuator/health
   ```

## Development Workflow

### Daily Development

1. **Start backend:**
   ```bash
   npm run start:backend
   ```

2. **Start app:**
   ```bash
   npm run dev:local
   ```

3. **Make changes** - Hot reload works automatically

4. **Test on device:**
   - Scan QR code with Expo Go
   - Or press `i`/`a`/`w` for simulator/emulator/web

### Stopping Services

**Stop app:**
- Press `Ctrl+C` in terminal

**Stop backend:**
```bash
cd backend
docker-compose down
```

**Stop all services:**
```bash
cd backend
docker-compose down -v  # Also removes volumes
```

## Advanced Configuration

### Using Remote Supabase

If you prefer using remote Supabase (cloud instance):

1. Get credentials from Supabase dashboard
2. Update `.env.local`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### Using Local Supabase (Docker)

If you want to run Supabase locally:

1. Install Supabase CLI: `npm install -g supabase`
2. Start Supabase: `supabase start`
3. Get local credentials from output
4. Update `.env.local` with local URLs

### Custom Ports

If ports 8080 or 5000 are in use:

1. **Backend port:**
   - Update `backend/.env`: `SERVER_PORT=8081`
   - Update `.env.local`: `EXPO_PUBLIC_API_BASE_URL=http://localhost:8081/api/v1`

2. **Expo port:**
   ```bash
   npx expo start --port 5001
   ```

## Testing Checklist

After setup, verify:

- [ ] Backend health check: `curl http://localhost:8080/actuator/health`
- [ ] App starts without errors: `npm run dev:local`
- [ ] Can scan QR code with Expo Go
- [ ] App connects to backend (check network tab)
- [ ] WebSocket connects (check console logs)
- [ ] Supabase auth works (try login/register)
- [ ] Hot reload works (make a change, see it update)

## Next Steps

- See `QUICK_START.md` for quick reference
- See `APP_LAUNCH_GUIDE.md` for detailed app features
- See `MIGRATION_REPLIT_TO_LOCAL.md` for migration details
- See `TEST_EXECUTION_GUIDE.md` for testing instructions

## Getting Help

If you encounter issues:

1. Check this troubleshooting section
2. Review error messages in console
3. Check backend logs: `docker-compose logs -f`
4. Verify environment variables are set correctly
5. Ensure all prerequisites are installed

## Common Commands Reference

```bash
# Setup
./setup-local.sh              # Mac/Linux
setup-local.bat              # Windows

# Backend
npm run start:backend        # Start backend services
cd backend && docker-compose down  # Stop backend

# App
npm run dev:local            # Start app (local)
npm run dev:ios              # iOS Simulator
npm run dev:android          # Android Emulator
npm run dev:web              # Web Browser
npm run dev:tunnel           # With tunnel (cloud)

# Both
npm run start:all            # Start backend + app
```



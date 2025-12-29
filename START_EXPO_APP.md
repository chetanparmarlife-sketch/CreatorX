# Starting Expo App Preview - Quick Guide

## Prerequisites Check

Before starting, ensure you have:

1. **Node.js 18+ installed**
   - Check: `node --version`
   - Download: https://nodejs.org/

2. **npm installed** (comes with Node.js)
   - Check: `npm --version`

3. **Dependencies installed**
   - Run: `npm install`

4. **Environment configured**
   - File `.env.local` should exist
   - Contains Supabase credentials

## Quick Start Commands

### Step 1: Install Dependencies (if not done)
```bash
npm install
```

### Step 2: Start Expo Development Server
```bash
npm run dev:local
```

### Alternative: Start with specific platform
```bash
npm run dev:web      # Opens in web browser
npm run dev:ios      # Opens iOS Simulator (Mac only)
npm run dev:android  # Opens Android Emulator
```

## What You'll See

After running `npm run dev:local`, you'll see:

1. **Metro Bundler** starting
2. **QR Code** in terminal
3. **Expo DevTools** URL (usually http://localhost:19002)
4. **Options menu** with:
   - Press `w` - Open in web browser
   - Press `i` - Open iOS Simulator (Mac only)
   - Press `a` - Open Android Emulator
   - Scan QR code - Open on physical device (Expo Go app)

## Troubleshooting

### "node is not recognized"
- Node.js is not installed or not in PATH
- Install from https://nodejs.org/
- Restart terminal after installation

### "npm is not recognized"
- npm comes with Node.js
- Reinstall Node.js if npm is missing

### "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

### "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Backend not running
```bash
# Start backend first
npm run start:backend

# Or manually
cd backend
docker-compose up -d
```

## Expected Output

When Expo starts successfully, you should see:

```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press w │ open in web browser
› Press i │ open iOS simulator
› Press a │ open Android emulator
› Press r │ reload app
› Press m │ toggle menu
```

## Next Steps

1. **For Web Preview**: Press `w` in the terminal
2. **For Mobile Preview**: Scan QR code with Expo Go app
3. **For Simulator**: Press `i` (iOS) or `a` (Android)

## Environment Setup

If `.env.local` doesn't exist:

1. Copy from template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Restart Expo dev server

## Full Documentation

- See `LOCAL_DEVELOPMENT.md` for complete setup guide
- See `QUICK_START.md` for 3-step quick start
- See `MIGRATION_REPLIT_TO_LOCAL.md` for migration details



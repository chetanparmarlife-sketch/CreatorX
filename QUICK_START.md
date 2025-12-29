# CreatorX - Quick Start Guide

## 🚀 Launch the App in 3 Steps

### Step 1: Setup Local Environment
```bash
# Windows
setup-local.bat

# Mac/Linux
chmod +x setup-local.sh
./setup-local.sh
```

This will install dependencies and create `.env.local` file.

**Important:** Edit `.env.local` with your Supabase credentials!

### Step 2: Start Backend
```bash
npm run start:backend
```

Or manually:
```bash
cd backend
docker-compose up -d
```

### Step 3: Launch App
```bash
npm run dev:local
```

Then:
- **On Phone**: Scan QR code with Expo Go app (same WiFi required)
- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`
- **Web Browser**: Press `w`

---

## 📱 What You'll See

### Main Screens:
1. **Explore** - Browse campaigns with filters
2. **Active Campaigns** - Your active work
3. **Wallet** - Earnings and transactions
4. **Chat** - Messages with brands
5. **Profile** - Your profile and settings

### Key Features:
- ✅ Campaign discovery and application
- ✅ Real-time messaging
- ✅ Wallet management
- ✅ File uploads
- ✅ Push notifications
- ✅ Offline support

---

## 🔧 Troubleshooting

**Port 5000 in use?**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

**Clear cache:**
```bash
npx expo start -c
```

**Dependencies issue:**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 More Information

- **Full Launch Guide**: See `APP_LAUNCH_GUIDE.md`
- **App Preview**: See `APP_PREVIEW.md`
- **Integration Tests**: See `TEST_EXECUTION_GUIDE.md`

---

**Ready to launch? Run `npm run dev` now!** 🎉


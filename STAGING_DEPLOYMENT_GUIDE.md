# 🚀 CreatorX Staging Deployment Guide

**Target Environment:** Staging  
**Backend:** Railway  
**Dashboards:** Vercel  
**Database:** Supabase Production  

---

## 📋 Prerequisites

Before starting deployment, ensure you have:

- [ ] Railway account (https://railway.app)
- [ ] Vercel account (https://vercel.com)
- [ ] Supabase Production project created
- [ ] GitHub repository connected
- [ ] Razorpay test/production credentials
- [ ] Domain names (optional for staging)

---

## 🗄️ STEP 1: Supabase Production Setup

### 1.1 Create Production Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Select organization and name: `creatorx-staging`
4. Choose region closest to your users (e.g., `ap-south-1` for India)
5. Set a strong database password (save this!)
6. Wait for project to be provisioned (~2 minutes)

### 1.2 Get Connection Details

From Supabase Dashboard → Settings → Database:

```env
# Connection String (Transaction Mode - for app)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres

# Direct Connection (for migrations)
DATABASE_URL_DIRECT=postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
```

From Supabase Dashboard → Settings → API:

```env
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # service_role key
SUPABASE_JWT_SECRET=your-jwt-secret  # Under Project Settings → API → JWT Settings
```

### 1.3 Run Database Migrations

Option A: Using Supabase CLI
```bash
cd backend
npx supabase db push --db-url "postgresql://postgres.[ref]:[pass]@db.[ref].supabase.co:5432/postgres"
```

Option B: Using Flyway (recommended)
```bash
# Add to application.yml for one-time migration
cd backend
./gradlew :creatorx-api:bootRun --args='--spring.flyway.enabled=true --spring.datasource.url=jdbc:postgresql://db.[ref].supabase.co:5432/postgres'
```

Option C: Manual SQL execution
1. Go to Supabase Dashboard → SQL Editor
2. Run each migration file from `backend/creatorx-api/src/main/resources/db/migration/` in order

### 1.4 Configure Storage Buckets

In Supabase Dashboard → Storage:

1. Create buckets:
   - `avatars` (public)
   - `kyc-documents` (private)
   - `deliverables` (private)
   - `campaign-media` (public)

2. Set bucket policies (SQL Editor):
```sql
-- Public read for avatars
CREATE POLICY "Public avatar access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Authenticated upload for avatars
CREATE POLICY "Auth avatar upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 🚂 STEP 2: Railway Backend Deployment

### 2.1 Create Railway Project

1. Go to https://railway.app/dashboard
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select `CreatorX-2` repository
6. Railway will auto-detect the Dockerfile

### 2.2 Configure Build Settings

In Railway Dashboard → Service Settings:

**Root Directory:** `backend`

**Build Command:** (auto from Dockerfile)

**Start Command:** (auto from Dockerfile)

### 2.3 Add Environment Variables

In Railway Dashboard → Variables, add:

```env
# ===== SERVER =====
PORT=8080
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=staging

# ===== DATABASE (Supabase) =====
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:6543/postgres?user=postgres.[project-ref]&password=[password]
SPRING_DATASOURCE_USERNAME=postgres.[project-ref]
SPRING_DATASOURCE_PASSWORD=[your-supabase-password]

# ===== FLYWAY =====
SPRING_FLYWAY_ENABLED=true
SPRING_FLYWAY_BASELINE_ON_MIGRATE=true

# ===== SUPABASE =====
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_STORAGE_URL=https://[project-ref].supabase.co/storage/v1

# ===== RAZORPAY =====
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# ===== REDIS (Optional - Railway Redis) =====
SPRING_REDIS_HOST=redis.railway.internal
SPRING_REDIS_PORT=6379
SPRING_REDIS_PASSWORD=[railway-redis-password]

# ===== CORS =====
CREATORX_CORS_ALLOWED_ORIGINS=https://brand.creatorx.app,https://admin.creatorx.app,https://*.vercel.app

# ===== EMAIL (Optional) =====
# SENDGRID_API_KEY=SG.xxxxx
# EMAIL_FROM=noreply@creatorx.app

# ===== FCM (Optional) =====
# FIREBASE_PROJECT_ID=creatorx-xxxxx
# FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk@creatorx.iam.gserviceaccount.com
```

### 2.4 Add Redis (Optional but Recommended)

1. In Railway Dashboard, click "New" → "Database" → "Redis"
2. Wait for Redis to provision
3. Copy the internal connection details to environment variables

### 2.5 Deploy

1. Railway will auto-deploy on push to main branch
2. Check deployment logs for errors
3. First deploy takes ~5-8 minutes (building JAR)

### 2.6 Get Railway URL

After deployment, Railway provides a URL like:
```
https://creatorx-backend-production.up.railway.app
```

Or configure custom domain in Settings → Domains.

---

## ▲ STEP 3: Vercel Dashboard Deployments

### 3.1 Brand Dashboard Deployment

#### Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import from GitHub: `CreatorX-2`
4. Configure:
   - **Root Directory:** `brand-dashboard`
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

#### Environment Variables

```env
# API Backend
NEXT_PUBLIC_API_URL=https://creatorx-backend-production.up.railway.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App URL (for callbacks)
NEXT_PUBLIC_APP_URL=https://brand-creatorx.vercel.app

# Environment
NEXT_PUBLIC_ENV=staging
```

#### Deploy

Click "Deploy" - Vercel will build and deploy automatically.

**Result URL:** `https://brand-creatorx.vercel.app`

### 3.2 Admin Dashboard Deployment

#### Create Second Project

1. In Vercel, click "Add New" → "Project"
2. Import same repo: `CreatorX-2`
3. Configure:
   - **Root Directory:** `admin-dashboard`
   - **Framework Preset:** Next.js

#### Environment Variables

```env
# API Backend
NEXT_PUBLIC_API_URL=https://creatorx-backend-production.up.railway.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App URL
NEXT_PUBLIC_APP_URL=https://admin-creatorx.vercel.app

# Environment
NEXT_PUBLIC_ENV=staging
```

#### Deploy

Click "Deploy"

**Result URL:** `https://admin-creatorx.vercel.app`

---

## 📱 STEP 4: Mobile App Configuration

### 4.1 Update API Base URL

Edit `src/config/env.ts`:

```typescript
// Staging configuration
export const API_CONFIG = {
  development: 'http://localhost:8080',
  staging: 'https://creatorx-backend-production.up.railway.app',
  production: 'https://api.creatorx.app',
};

export const API_BASE_URL = API_CONFIG.staging;
```

### 4.2 Update Supabase Config

Ensure `supabase.ts` points to production Supabase:

```typescript
export const supabase = createClient(
  'https://[project-ref].supabase.co',
  'your-anon-key'
);
```

### 4.3 Build for Testing

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android

# Or use Expo Go with staging config
npx expo start
```

---

## ✅ STEP 5: Verification Checklist

### 5.1 Backend Health Check

```bash
# Health endpoint
curl https://creatorx-backend-production.up.railway.app/api/v1/health

# Expected response:
{
  "status": "UP",
  "timestamp": "2026-01-22T12:00:00Z"
}
```

### 5.2 Database Connection

```bash
# Check via API
curl https://creatorx-backend-production.up.railway.app/actuator/health

# Should show database: UP
```

### 5.3 Authentication Flow

```bash
# Test login
curl -X POST https://creatorx-backend-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

### 5.4 Dashboard Access

1. Open https://brand-creatorx.vercel.app
   - [ ] Login page loads
   - [ ] Can authenticate
   - [ ] Dashboard shows

2. Open https://admin-creatorx.vercel.app
   - [ ] Login page loads
   - [ ] Can authenticate with admin
   - [ ] Admin dashboard shows

### 5.5 Mobile App

1. Launch app with staging config
   - [ ] Splash screen shows
   - [ ] OTP login works
   - [ ] Campaigns load from API

### 5.6 Integration Tests

```bash
# Run integration tests against staging
cd backend
./gradlew test -Dspring.profiles.active=staging \
  -DAPI_BASE_URL=https://creatorx-backend-production.up.railway.app
```

---

## 🔧 STEP 6: Post-Deployment Configuration

### 6.1 Update CORS Origins

In Railway, update `CREATORX_CORS_ALLOWED_ORIGINS`:

```env
CREATORX_CORS_ALLOWED_ORIGINS=https://brand-creatorx.vercel.app,https://admin-creatorx.vercel.app,exp://localhost:8081
```

### 6.2 Configure Razorpay Webhooks

1. Go to Razorpay Dashboard → Webhooks
2. Add webhook URL:
   ```
   https://creatorx-backend-production.up.railway.app/api/v1/webhooks/razorpay
   ```
3. Select events:
   - payment.captured
   - payment.failed
   - payout.processed
   - payout.failed
4. Copy webhook secret to Railway env vars

### 6.3 Set Up Monitoring (Optional)

Add to Railway environment:
```env
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 📁 Configuration Files

### railway.toml (Backend)

Create `backend/railway.toml`:

```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "java -jar app.jar"
healthcheckPath = "/actuator/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3

[service]
internalPort = 8080
```

### vercel.json (Brand Dashboard)

Create `brand-dashboard/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["bom1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### vercel.json (Admin Dashboard)

Create `admin-dashboard/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["bom1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🚨 Troubleshooting

### Backend Won't Start

1. Check Railway logs for errors
2. Verify DATABASE_URL format (JDBC format for Spring Boot)
3. Ensure Supabase allows external connections

### Database Connection Refused

1. Check Supabase → Settings → Database → Connection Pooling is enabled
2. Use pooler URL (port 6543), not direct (port 5432)
3. Verify password doesn't have special characters (URL encode if needed)

### CORS Errors

1. Add Vercel URLs to `CREATORX_CORS_ALLOWED_ORIGINS`
2. Include protocol (https://)
3. Redeploy backend after changing

### Dashboard 404 Errors

1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Verify API is accessible from Vercel (no firewall)
3. Check browser console for errors

### Migrations Failed

1. Run migrations manually via Supabase SQL Editor
2. Check for conflicting schema
3. Use `baseline-on-migrate=true` for existing databases

---

## 📊 Deployment Summary

| Component | Platform | URL |
|-----------|----------|-----|
| Backend API | Railway | https://creatorx-backend-production.up.railway.app |
| Brand Dashboard | Vercel | https://brand-creatorx.vercel.app |
| Admin Dashboard | Vercel | https://admin-creatorx.vercel.app |
| Database | Supabase | https://[project-ref].supabase.co |
| Redis Cache | Railway | redis.railway.internal:6379 |

---

## 🔄 Continuous Deployment

Both Railway and Vercel auto-deploy on push to main branch.

**Workflow:**
1. Push to `main` branch
2. Railway rebuilds backend (~5 min)
3. Vercel rebuilds dashboards (~2 min each)
4. Auto-deployed to staging

For production, use separate branches:
- `main` → staging
- `production` → production

---

*Guide created: January 22, 2026*

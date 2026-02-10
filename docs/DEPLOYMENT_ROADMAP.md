# 🚀 CreatorX Deployment Roadmap

**Your Setup:**
- 🌐 **Domain:** creator-x.club
- 🔧 **Backend:** Railway
- 🗄️ **Database:** Supabase
- ⚡ **Redis:** Upstash
- 📱 **Mobile:** Expo

---

## 📋 Current Audit Status

| Component | Status | Ready? |
|-----------|--------|--------|
| Dockerfile | ✅ Exists | Yes |
| Railway config | ✅ Exists | Yes |
| Database migrations | ✅ Flyway configured | Yes |
| Mobile app | ✅ Configured | Yes |
| Dashboards | ✅ Next.js ready | Yes |

**🎉 Good news: Your codebase is already deployment-ready!**

---

## 🗺️ Deployment Roadmap (9 Steps)

### Phase 1: Create Accounts (Day 1)
- [ ] Step 1: Create Supabase project
- [ ] Step 2: Create Upstash Redis
- [ ] Step 3: Create Railway project

### Phase 2: Deploy Backend (Day 1-2)
- [ ] Step 4: Configure Railway environment
- [ ] Step 5: Deploy backend to Railway

### Phase 3: Deploy Dashboards (Day 2)
- [ ] Step 6: Deploy Brand Dashboard to Vercel
- [ ] Step 7: Deploy Admin Dashboard to Vercel

### Phase 4: Connect Domain (Day 2)
- [ ] Step 8: Configure creator-x.club subdomains

### Phase 5: Mobile App (Day 3)
- [ ] Step 9: Configure Expo for production

---

## 📖 Step-by-Step Instructions

---

### STEP 1: Create Supabase Project

**Time: 5 minutes**

1. Go to https://supabase.com
2. Click "Start your project" → Sign up with GitHub
3. Click "New Project"
4. Fill in:
   - **Name:** `creatorx-staging`
   - **Database Password:** [Create strong password - **SAVE THIS!**]
   - **Region:** Mumbai (ap-south-1)
5. Click "Create new project" → Wait 2 minutes

**📝 Save these values:**
```
SUPABASE_PROJECT_REF: [abc123xyz...]
SUPABASE_URL: https://[project-ref].supabase.co
SUPABASE_ANON_KEY: [Under Settings → API]
SUPABASE_SERVICE_KEY: [Under Settings → API → service_role key]
SUPABASE_JWT_SECRET: [Under Settings → API → JWT Settings]
DATABASE_PASSWORD: [Your password]
```

---

### STEP 2: Create Upstash Redis

**Time: 3 minutes**

1. Go to https://upstash.com
2. Sign up with GitHub
3. Click "Create Database"
4. Fill in:
   - **Name:** `creatorx-redis`
   - **Region:** Mumbai (ap-south-1)
   - **Type:** Regional
5. Click "Create"

**📝 Save these values:**
```
UPSTASH_REDIS_URL: redis://default:xxx@xxx.upstash.io:6379
UPSTASH_REDIS_HOST: xxx.upstash.io
UPSTASH_REDIS_PORT: 6379
UPSTASH_REDIS_PASSWORD: [Your password]
```

---

### STEP 3: Create Railway Project

**Time: 5 minutes**

1. Go to https://railway.app
2. Click "Login" → Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Authorize Railway to access your GitHub
6. Find and select `CreatorX-2` repository
7. **⚠️ IMPORTANT:** Click "Add Service" → "Empty Service" (don't auto-deploy yet)

Railway will show your project dashboard.

---

### STEP 4: Configure Railway Environment Variables

**Time: 10 minutes**

1. In Railway, click on your service
2. Click "Variables" tab
3. Click "RAW Editor" (easier than one-by-one)
4. Paste this entire block, **replacing the placeholders with your real values:**

```env
# Server
PORT=8080
SERVER_PORT=8080
SPRING_PROFILES_ACTIVE=staging

# Database (Supabase)
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:6543/postgres?user=postgres.YOUR_PROJECT_REF&password=YOUR_DB_PASSWORD
SPRING_DATASOURCE_USERNAME=postgres.YOUR_PROJECT_REF
SPRING_DATASOURCE_PASSWORD=YOUR_DB_PASSWORD

# Flyway
SPRING_FLYWAY_ENABLED=true
SPRING_FLYWAY_BASELINE_ON_MIGRATE=true

# Supabase
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_KEY=YOUR_SERVICE_KEY
SUPABASE_JWT_SECRET=YOUR_JWT_SECRET
SUPABASE_STORAGE_URL=https://YOUR_PROJECT_REF.supabase.co/storage/v1

# Redis (Upstash)
SPRING_REDIS_HOST=YOUR_UPSTASH_HOST
SPRING_REDIS_PORT=6379
SPRING_REDIS_PASSWORD=YOUR_UPSTASH_PASSWORD

# CORS
CREATORX_CORS_ALLOWED_ORIGINS=https://brand.creator-x.club,https://admin.creator-x.club,https://*.vercel.app,exp://localhost:8081

# Razorpay (Test mode for now)
RAZORPAY_KEY_ID=rzp_test_XXXXXX
RAZORPAY_KEY_SECRET=XXXXXX
RAZORPAY_WEBHOOK_SECRET=XXXXXX

# Logging
LOGGING_LEVEL_ROOT=INFO
LOGGING_LEVEL_COM_CREATORX=DEBUG
```

5. Click "Update Variables"

---

### STEP 5: Deploy Backend to Railway

**Time: 10 minutes**

1. In Railway service settings:
   - **Root Directory:** `backend`
   - **Builder:** Dockerfile

2. Go to "Settings" tab
3. Under "Source", connect to GitHub repo
4. Set **Root Directory:** `/backend`
5. Click "Deploy" or push to GitHub main branch

**Wait 5-8 minutes for build**

6. After deploy, go to "Settings" → "Networking"
7. Click "Generate Domain" → You'll get:
   ```
   https://creatorx-xxx.up.railway.app
   ```

**📝 Save this URL as your API_BASE_URL**

**✅ Verify:** Visit `https://your-railway-url.up.railway.app/actuator/health`
Should show: `{"status":"UP"}`

---

### STEP 6: Deploy Brand Dashboard to Vercel

**Time: 5 minutes**

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"
4. Select `CreatorX-2` repository
5. Configure:
   - **Root Directory:** `brand-dashboard`
   - **Framework:** Next.js

6. Add Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_APP_URL=https://brand.creator-x.club
NEXT_PUBLIC_ENV=staging
```

7. Click "Deploy"

**Result URL:** `https://brand-creatorx.vercel.app`

---

### STEP 7: Deploy Admin Dashboard to Vercel

**Time: 5 minutes**

1. In Vercel, click "Add New" → "Project"
2. Import same repo `CreatorX-2`
3. Configure:
   - **Root Directory:** `admin-dashboard`
   - **Framework:** Next.js

4. Add Environment Variables:
```
NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_APP_URL=https://admin.creator-x.club
NEXT_PUBLIC_ENV=staging
```

5. Click "Deploy"

---

### STEP 8: Configure Domain (creator-x.club)

**Time: 15 minutes**

**Your domain subdomains:**
| Subdomain | Points To | Purpose |
|-----------|-----------|---------|
| api.creator-x.club | Railway backend | API |
| brand.creator-x.club | Vercel brand dashboard | Brands |
| admin.creator-x.club | Vercel admin dashboard | Admins |
| creator-x.club | Landing page / App | Main site |

**A. Railway Domain Setup:**

1. In Railway → Your Service → Settings → Networking
2. Click "Custom Domain"
3. Enter: `api.creator-x.club`
4. Railway shows CNAME value

**B. Go to your domain registrar (GoDaddy/Namecheap/Cloudflare):**

Add DNS records:

| Type | Name | Value |
|------|------|-------|
| CNAME | api | xxx.up.railway.app |
| CNAME | brand | cname.vercel-dns.com |
| CNAME | admin | cname.vercel-dns.com |

**C. Vercel Domain Setup:**

1. Brand Dashboard → Settings → Domains
2. Add: `brand.creator-x.club`
3. Admin Dashboard → Settings → Domains
4. Add: `admin.creator-x.club`

**Wait 5-30 minutes for DNS propagation**

---

### STEP 9: Configure Mobile App

**Time: 5 minutes**

1. Open `src/config/env.ts` in your code
2. Update:

```typescript
export const API_BASE_URL = 'https://api.creator-x.club';
export const SUPABASE_URL = 'https://YOUR_PROJECT_REF.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

3. Commit and push to GitHub

**Test locally:**
```bash
npx expo start
```

**For production builds, use Expo EAS:**
```bash
npx eas build --platform all
```

---

## ✅ Final Verification Checklist

```bash
# Test API health
curl https://api.creator-x.club/actuator/health

# Expected: {"status":"UP"}
```

- [ ] API responds at api.creator-x.club
- [ ] Brand dashboard loads at brand.creator-x.club
- [ ] Admin dashboard loads at admin.creator-x.club
- [ ] Mobile app connects to API
- [ ] Login works on all platforms

---

## 🏭 Production vs Staging

For **production**, create separate projects:

| Environment | Supabase | Railway | Purpose |
|-------------|----------|---------|---------|
| Staging | creatorx-staging | creatorx-staging | Testing |
| Production | creatorx-prod | creatorx-prod | Live users |

**Best Practice:**
- Use `main` branch → Staging
- Use `production` branch → Production

---

## 📞 Need Help?

Common issues:
1. **Build fails?** Check Railway logs
2. **Database error?** Verify Supabase connection string
3. **CORS error?** Add domain to CORS origins in Railway
4. **Domain not working?** Wait 30min for DNS propagation

---

*Created: Feb 7, 2026*

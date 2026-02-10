# CreatorX GCP Deployment Roadmap

> **Target Architecture**: GCP (Backend + Frontends) + Supabase (Database + Auth + Storage)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GOOGLE CLOUD PLATFORM                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐  │
│  │  Cloud Run      │     │  Cloud Run      │     │  Cloud Run   │  │
│  │  (Admin UI)     │     │  (Brand UI)     │     │  (Backend)   │  │
│  │  Port 3000      │     │  Port 3000      │     │  Port 8080   │  │
│  └────────┬────────┘     └────────┬────────┘     └──────┬───────┘  │
│           │                       │                      │          │
│           └───────────────────────┼──────────────────────┘          │
│                                   │                                 │
│                        ┌──────────▼──────────┐                      │
│                        │   Cloud Load        │                      │
│                        │   Balancer + SSL    │                      │
│                        └──────────┬──────────┘                      │
│                                   │                                 │
│  ┌─────────────────┐     ┌───────▼───────┐     ┌──────────────────┐│
│  │  Memorystore    │◄────┤  VPC Network  ├────►│  Secret Manager  ││
│  │  (Redis 7)      │     │               │     │  (Credentials)   ││
│  └─────────────────┘     └───────────────┘     └──────────────────┘│
│                                                                     │
│  ┌─────────────────┐     ┌─────────────────┐   ┌──────────────────┐│
│  │  Cloud Storage  │     │  Artifact       │   │  Cloud Build     ││
│  │  (Build Cache)  │     │  Registry       │   │  (CI/CD)         ││
│  └─────────────────┘     └─────────────────┘   └──────────────────┘│
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            SUPABASE                                 │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │  PostgreSQL 15  │  │  Auth           │  │  Storage            │ │
│  │  (Database)     │  │  (JWT/Sessions) │  │  (Files/Media)      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         EXPO / APP STORES                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │  EAS Build      │  │  Apple App      │  │  Google Play        │ │
│  │  (CI/CD)        │  │  Store          │  │  Store              │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Table of Contents

1. [Phase 1: Supabase Setup](#phase-1-supabase-setup)
2. [Phase 2: GCP Project Setup](#phase-2-gcp-project-setup)
3. [Phase 3: Secret Manager Setup](#phase-3-secret-manager-setup)
4. [Phase 4: Redis (Memorystore) Setup](#phase-4-redis-memorystore-setup)
5. [Phase 5: Backend Deployment](#phase-5-backend-deployment)
6. [Phase 6: Frontend Deployment](#phase-6-frontend-deployment)
7. [Phase 7: Custom Domain Setup](#phase-7-custom-domain-setup)
8. [Phase 8: CI/CD with Cloud Build](#phase-8-cicd-with-cloud-build)
9. [Phase 9: Monitoring & Logging](#phase-9-monitoring--logging)
10. [Phase 10: Expo Mobile App Deployment](#phase-10-expo-mobile-app-deployment)
11. [Cost Estimate](#cost-estimate)
12. [Checklist Summary](#checklist-summary)

---

## Phase 1: Supabase Setup

**Timeline: Day 1**

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Select region closest to your users (e.g., `ap-south-1` for India, `us-east-1` for US)
3. Set a strong database password (save it securely)
4. Wait for project provisioning (~2 minutes)

**Save these credentials:**

| Credential | Location | Usage |
|------------|----------|-------|
| Project URL | Settings → API | `SUPABASE_URL` |
| Anon Key | Settings → API | Frontend (public) |
| Service Role Key | Settings → API | Backend only (secret) |
| JWT Secret | Settings → API → JWT Settings | `SUPABASE_JWT_SECRET` |
| Database URL | Settings → Database → Connection String | `DATABASE_URL` |

### 1.2 Run Database Migrations

You have 36+ Flyway migrations. Run them in order:

**Option A: Using Supabase SQL Editor (Recommended for first time)**

1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste each migration file content in order:
   - `V1__create_enums.sql`
   - `V2__create_users_and_profiles.sql`
   - `V3__create_campaigns.sql`
   - ... (continue through all V*.sql files)

**Option B: Using psql CLI**

```bash
# Get connection string from Supabase Dashboard
# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

cd backend/creatorx-api/src/main/resources/db/migration

# Run all migrations in order
for file in V*.sql; do
  echo "Running $file..."
  psql "postgresql://postgres:PASSWORD@db.PROJECT-REF.supabase.co:5432/postgres" -f "$file"
done
```

**Option C: Let Flyway handle it (on first backend startup)**

The backend will auto-run migrations if `FLYWAY_ENABLED=true` (default).

### 1.3 Create Storage Buckets

In Supabase Dashboard → Storage → New Bucket:

| Bucket Name | Public | Purpose |
|-------------|--------|---------|
| `avatars` | Yes | User profile pictures |
| `kyc-documents` | No | KYC verification documents |
| `deliverables` | No | Campaign deliverable files |
| `portfolio` | Yes | Creator portfolio items |

### 1.4 Configure Storage Policies (RLS)

Go to Storage → Policies → New Policy for each bucket:

**Avatars Bucket (Public Read, Authenticated Write):**

```sql
-- Allow anyone to view avatars
CREATE POLICY "Public avatar access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);
```

**KYC Documents Bucket (Private):**

```sql
-- Only authenticated users can upload KYC docs
CREATE POLICY "Users can upload KYC docs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents'
  AND auth.role() = 'authenticated'
);

-- Only admins can view KYC docs (via service role key on backend)
-- No SELECT policy for regular users
```

---

## Phase 2: GCP Project Setup

**Timeline: Day 1-2**

### 2.1 Prerequisites

Install Google Cloud CLI:

```bash
# Windows (PowerShell as Admin)
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe

# macOS
brew install google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
```

### 2.2 Create GCP Project

```bash
# Login to GCP
gcloud auth login

# Create project
gcloud projects create creatorx-prod --name="CreatorX Production"

# Set as default project
gcloud config set project creatorx-prod

# IMPORTANT: Link billing account
# Go to: https://console.cloud.google.com/billing
# Select project → Link billing account
```

### 2.3 Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  redis.googleapis.com \
  vpcaccess.googleapis.com \
  compute.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com
```

### 2.4 Create Artifact Registry

```bash
# Create Docker repository
gcloud artifacts repositories create creatorx \
  --repository-format=docker \
  --location=asia-south1 \
  --description="CreatorX Docker images"

# Configure Docker to use Artifact Registry
gcloud auth configure-docker asia-south1-docker.pkg.dev
```

### 2.5 Create VPC Connector

Required for Cloud Run to access Memorystore Redis:

```bash
gcloud compute networks vpc-access connectors create creatorx-connector \
  --region=asia-south1 \
  --network=default \
  --range=10.8.0.0/28 \
  --min-instances=2 \
  --max-instances=3
```

---

## Phase 3: Secret Manager Setup

**Timeline: Day 2**

### 3.1 Create All Secrets

```bash
# ==================== Database (Supabase) ====================
echo -n "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" | \
  gcloud secrets create DATABASE_URL --data-file=-

echo -n "https://YOUR_PROJECT_REF.supabase.co" | \
  gcloud secrets create SUPABASE_URL --data-file=-

echo -n "your-supabase-service-role-key" | \
  gcloud secrets create SUPABASE_SERVICE_ROLE_KEY --data-file=-

echo -n "your-supabase-jwt-secret" | \
  gcloud secrets create SUPABASE_JWT_SECRET --data-file=-

echo -n "your-supabase-anon-key" | \
  gcloud secrets create SUPABASE_ANON_KEY --data-file=-

# ==================== JWT (Application) ====================
# Generate a secure 64-character secret
echo -n "$(openssl rand -base64 48)" | \
  gcloud secrets create JWT_SECRET --data-file=-

# ==================== Razorpay ====================
echo -n "rzp_live_xxxxxxxxxxxx" | \
  gcloud secrets create RAZORPAY_KEY_ID --data-file=-

echo -n "your-razorpay-key-secret" | \
  gcloud secrets create RAZORPAY_KEY_SECRET --data-file=-

echo -n "your-razorpay-webhook-secret" | \
  gcloud secrets create RAZORPAY_WEBHOOK_SECRET --data-file=-

echo -n "your-razorpay-account-number" | \
  gcloud secrets create RAZORPAY_ACCOUNT_NUMBER --data-file=-

# ==================== SendGrid ====================
echo -n "SG.xxxxxxxxxxxxxxxxxxxx" | \
  gcloud secrets create SENDGRID_API_KEY --data-file=-

# ==================== Firebase ====================
# Upload Firebase service account JSON
gcloud secrets create FIREBASE_SERVICE_ACCOUNT \
  --data-file=path/to/firebase-service-account.json

# ==================== Meta (Facebook/Instagram) ====================
echo -n "your-meta-app-id" | \
  gcloud secrets create META_APP_ID --data-file=-

echo -n "your-meta-app-secret" | \
  gcloud secrets create META_APP_SECRET --data-file=-
```

### 3.2 Grant Cloud Run Access to Secrets

```bash
# Get project number
PROJECT_NUMBER=$(gcloud projects describe creatorx-prod --format='value(projectNumber)')

# Default compute service account
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant access to all secrets
SECRETS=(
  "DATABASE_URL"
  "SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY"
  "SUPABASE_JWT_SECRET"
  "SUPABASE_ANON_KEY"
  "JWT_SECRET"
  "RAZORPAY_KEY_ID"
  "RAZORPAY_KEY_SECRET"
  "RAZORPAY_WEBHOOK_SECRET"
  "RAZORPAY_ACCOUNT_NUMBER"
  "SENDGRID_API_KEY"
  "FIREBASE_SERVICE_ACCOUNT"
  "META_APP_ID"
  "META_APP_SECRET"
)

for secret in "${SECRETS[@]}"; do
  gcloud secrets add-iam-policy-binding $secret \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor"
done
```

---

## Phase 4: Redis (Memorystore) Setup

**Timeline: Day 2**

### 4.1 Create Redis Instance

```bash
gcloud redis instances create creatorx-cache \
  --size=1 \
  --region=asia-south1 \
  --redis-version=redis_7_0 \
  --tier=basic \
  --network=default \
  --connect-mode=DIRECT_PEERING
```

### 4.2 Get Redis Connection Info

```bash
# Get Redis host IP (save this for Cloud Run config)
REDIS_HOST=$(gcloud redis instances describe creatorx-cache \
  --region=asia-south1 \
  --format='value(host)')

echo "Redis Host: $REDIS_HOST"
# Example output: 10.123.45.67

# Get Redis port (default 6379)
REDIS_PORT=$(gcloud redis instances describe creatorx-cache \
  --region=asia-south1 \
  --format='value(port)')

echo "Redis Port: $REDIS_PORT"
```

---

## Phase 5: Backend Deployment

**Timeline: Day 3**

### 5.1 Create Production Dockerfile

The project already has `backend/Dockerfile.prod`. Verify it exists:

```dockerfile
# backend/Dockerfile.prod
FROM gradle:8.5-jdk17 AS builder
WORKDIR /app
COPY . .
RUN gradle clean bootJar -x test --no-daemon

FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache curl
WORKDIR /app

# Extract layers for better caching
COPY --from=builder /app/creatorx-api/build/libs/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# Final image with layers
FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache curl && \
    addgroup -g 1001 spring && \
    adduser -u 1001 -G spring -D spring
WORKDIR /app

COPY --from=1 /app/dependencies/ ./
COPY --from=1 /app/spring-boot-loader/ ./
COPY --from=1 /app/snapshot-dependencies/ ./
COPY --from=1 /app/application/ ./

USER spring:spring
EXPOSE 8080

ENV JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
```

### 5.2 Create Cloud Build Configuration

Create `backend/cloudbuild.yaml`:

```yaml
steps:
  # Build JAR with Gradle
  - name: 'gradle:8.5-jdk17'
    entrypoint: 'gradle'
    args: ['clean', 'bootJar', '-x', 'test', '--no-daemon']
    dir: 'backend'

  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'asia-south1-docker.pkg.dev/$PROJECT_ID/creatorx/backend:$COMMIT_SHA'
      - '-t'
      - 'asia-south1-docker.pkg.dev/$PROJECT_ID/creatorx/backend:latest'
      - '-f'
      - 'Dockerfile.prod'
      - '.'
    dir: 'backend'

  # Push images
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'asia-south1-docker.pkg.dev/$PROJECT_ID/creatorx/backend:$COMMIT_SHA']

  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'asia-south1-docker.pkg.dev/$PROJECT_ID/creatorx/backend:latest']

  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    entrypoint: 'bash'
    args:
      - '-c'
      - |
        gcloud run deploy creatorx-backend \
          --image=asia-south1-docker.pkg.dev/$PROJECT_ID/creatorx/backend:$COMMIT_SHA \
          --region=asia-south1 \
          --platform=managed \
          --allow-unauthenticated \
          --port=8080 \
          --memory=1Gi \
          --cpu=1 \
          --min-instances=1 \
          --max-instances=10 \
          --timeout=300 \
          --concurrency=80 \
          --vpc-connector=creatorx-connector \
          --set-secrets="DATABASE_URL=DATABASE_URL:latest" \
          --set-secrets="SUPABASE_URL=SUPABASE_URL:latest" \
          --set-secrets="SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest" \
          --set-secrets="SUPABASE_JWT_SECRET=SUPABASE_JWT_SECRET:latest" \
          --set-secrets="JWT_SECRET=JWT_SECRET:latest" \
          --set-secrets="RAZORPAY_KEY_ID=RAZORPAY_KEY_ID:latest" \
          --set-secrets="RAZORPAY_KEY_SECRET=RAZORPAY_KEY_SECRET:latest" \
          --set-secrets="RAZORPAY_WEBHOOK_SECRET=RAZORPAY_WEBHOOK_SECRET:latest" \
          --set-secrets="SENDGRID_API_KEY=SENDGRID_API_KEY:latest" \
          --set-env-vars="SPRING_PROFILES_ACTIVE=prod" \
          --set-env-vars="REDIS_HOST=${_REDIS_HOST}" \
          --set-env-vars="REDIS_PORT=6379" \
          --set-env-vars="EMAIL_ENABLED=true" \
          --set-env-vars="FLYWAY_ENABLED=true" \
          --set-env-vars="PAYOUT_SCHEDULER_ENABLED=true"

substitutions:
  _REDIS_HOST: '10.x.x.x'  # Replace with actual Redis IP

images:
  - 'asia-south1-docker.pkg.dev/$PROJECT_ID/creatorx/backend:$COMMIT_SHA'
  - 'asia-south1-docker.pkg.dev/$PROJECT_ID/creatorx/backend:latest'

options:
  logging: CLOUD_LOGGING_ONLY
  machineType: 'E2_HIGHCPU_8'
```

### 5.3 Manual First Deployment

```bash
cd backend

# Build JAR locally
./gradlew clean bootJar -x test

# Build Docker image
docker build \
  -t asia-south1-docker.pkg.dev/creatorx-prod/creatorx/backend:v1 \
  -f Dockerfile.prod .

# Push to Artifact Registry
docker push asia-south1-docker.pkg.dev/creatorx-prod/creatorx/backend:v1

# Deploy to Cloud Run
gcloud run deploy creatorx-backend \
  --image=asia-south1-docker.pkg.dev/creatorx-prod/creatorx/backend:v1 \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=10 \
  --vpc-connector=creatorx-connector \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest" \
  --set-secrets="SUPABASE_URL=SUPABASE_URL:latest" \
  --set-secrets="SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest" \
  --set-secrets="JWT_SECRET=JWT_SECRET:latest" \
  --set-secrets="RAZORPAY_KEY_ID=RAZORPAY_KEY_ID:latest" \
  --set-secrets="RAZORPAY_KEY_SECRET=RAZORPAY_KEY_SECRET:latest" \
  --set-secrets="SENDGRID_API_KEY=SENDGRID_API_KEY:latest" \
  --set-env-vars="SPRING_PROFILES_ACTIVE=prod,REDIS_HOST=10.x.x.x,EMAIL_ENABLED=true"
```

### 5.4 Get Backend URL

```bash
# Get the deployed URL
BACKEND_URL=$(gcloud run services describe creatorx-backend \
  --region=asia-south1 \
  --format='value(status.url)')

echo "Backend URL: $BACKEND_URL"
# Example: https://creatorx-backend-abc123-xx.a.run.app

# Test health endpoint
curl "$BACKEND_URL/actuator/health"
```

---

## Phase 6: Frontend Deployment

**Timeline: Day 3-4**

### 6.1 Create Next.js Dockerfile

Create `admin-dashboard/Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build arguments for environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_ENV=production

# Set environment variables for build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_ENV=$NEXT_PUBLIC_ENV

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 6.2 Update Next.js Config for Standalone

Update `admin-dashboard/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Existing config...
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

### 6.3 Create Cloud Build for Admin Dashboard

Create `admin-dashboard/cloudbuild.yaml`:

```yaml
steps:
  # Build Docker image with build args
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '--build-arg'
      - 'NEXT_PUBLIC_API_URL=${_API_URL}'
      - '--build-arg'
      - 'NEXT_PUBLIC_SUPABASE_URL=${_SUPABASE_URL}'
      - '--build-arg'
      - 'NEXT_PUBLIC_SUPABASE_ANON_KEY=${_SUPABASE_ANON_KEY}'
      - '--build-arg'
      - 'NEXT_PUBLIC_APP_URL=${_APP_URL}'
      - '-t'
      - 'asia-south1-docker.pkg.dev/$PROJECT_ID/creatorx/admin-dashboard:$COMMIT_SHA'
      - '-t'
      - 'asia-south1-docker.pkg.dev/$PROJECT_ID/creatorx/admin-dashboard:latest'
      - '.'
    dir: 'admin-dashboard'

  # Push images
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'asia-south1-docker.pkg.dev/$PROJECT_ID/creatorx/admin-dashboard:$COMMIT_SHA']

  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'asia-south1-docker.pkg.dev/$PROJECT_ID/creatorx/admin-dashboard:latest']

  # Deploy to Cloud Run
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'creatorx-admin'
      - '--image=asia-south1-docker.pkg.dev/$PROJECT_ID/creatorx/admin-dashboard:$COMMIT_SHA'
      - '--region=asia-south1'
      - '--platform=managed'
      - '--allow-unauthenticated'
      - '--port=3000'
      - '--memory=512Mi'
      - '--cpu=1'
      - '--min-instances=0'
      - '--max-instances=5'
      - '--concurrency=80'

substitutions:
  _API_URL: 'https://api.creatorx.com'
  _SUPABASE_URL: 'https://xxx.supabase.co'
  _SUPABASE_ANON_KEY: 'xxx'
  _APP_URL: 'https://admin.creatorx.com'

images:
  - 'asia-south1-docker.pkg.dev/$PROJECT_ID/creatorx/admin-dashboard:$COMMIT_SHA'
  - 'asia-south1-docker.pkg.dev/$PROJECT_ID/creatorx/admin-dashboard:latest'

options:
  logging: CLOUD_LOGGING_ONLY
```

### 6.4 Deploy Admin Dashboard

```bash
cd admin-dashboard

# Build with environment variables
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://creatorx-backend-xxx.a.run.app \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
  --build-arg NEXT_PUBLIC_APP_URL=https://admin.creatorx.com \
  -t asia-south1-docker.pkg.dev/creatorx-prod/creatorx/admin-dashboard:v1 .

# Push
docker push asia-south1-docker.pkg.dev/creatorx-prod/creatorx/admin-dashboard:v1

# Deploy
gcloud run deploy creatorx-admin \
  --image=asia-south1-docker.pkg.dev/creatorx-prod/creatorx/admin-dashboard:v1 \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=3000 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=5
```

### 6.5 Deploy Brand Dashboard

Same process for brand-dashboard:

```bash
cd brand-dashboard

# Copy the same Dockerfile (or create symlink)
cp ../admin-dashboard/Dockerfile .

# Build
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://creatorx-backend-xxx.a.run.app \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
  --build-arg NEXT_PUBLIC_APP_URL=https://app.creatorx.com \
  -t asia-south1-docker.pkg.dev/creatorx-prod/creatorx/brand-dashboard:v1 .

# Push
docker push asia-south1-docker.pkg.dev/creatorx-prod/creatorx/brand-dashboard:v1

# Deploy
gcloud run deploy creatorx-brand \
  --image=asia-south1-docker.pkg.dev/creatorx-prod/creatorx/brand-dashboard:v1 \
  --region=asia-south1 \
  --platform=managed \
  --allow-unauthenticated \
  --port=3000 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=5
```

---

## Phase 7: Custom Domain Setup

**Timeline: Day 4**

### 7.1 Map Custom Domains to Cloud Run

```bash
# Backend API
gcloud run domain-mappings create \
  --service=creatorx-backend \
  --domain=api.creatorx.com \
  --region=asia-south1

# Admin Dashboard
gcloud run domain-mappings create \
  --service=creatorx-admin \
  --domain=admin.creatorx.com \
  --region=asia-south1

# Brand Dashboard
gcloud run domain-mappings create \
  --service=creatorx-brand \
  --domain=app.creatorx.com \
  --region=asia-south1
```

### 7.2 Get DNS Records

```bash
# Get required DNS records for each service
gcloud run domain-mappings describe \
  --domain=api.creatorx.com \
  --region=asia-south1

# Output will show required DNS records
```

### 7.3 Configure DNS at Your Registrar

Add these DNS records:

| Type | Name | Value |
|------|------|-------|
| CNAME | api | ghs.googlehosted.com |
| CNAME | admin | ghs.googlehosted.com |
| CNAME | app | ghs.googlehosted.com |

**Note:** SSL certificates are automatically provisioned by Cloud Run (takes ~15-30 minutes after DNS propagation).

### 7.4 Verify Domain Mapping

```bash
# Check status
gcloud run domain-mappings list --region=asia-south1

# Wait until certificate status shows "ACTIVE"
```

---

## Phase 8: CI/CD with Cloud Build

**Timeline: Day 5**

### 8.1 Connect GitHub Repository

```bash
# This opens a browser for GitHub OAuth
gcloud builds triggers create github \
  --name="deploy-backend" \
  --repo-owner="chetanparmarlife-sketch" \
  --repo-name="CreatorX" \
  --branch-pattern="^main$" \
  --build-config="backend/cloudbuild.yaml" \
  --included-files="backend/**" \
  --substitutions="_REDIS_HOST=10.x.x.x"
```

### 8.2 Create Triggers for All Services

```bash
# Backend trigger
gcloud builds triggers create github \
  --name="deploy-backend" \
  --repo-owner="chetanparmarlife-sketch" \
  --repo-name="CreatorX" \
  --branch-pattern="^main$" \
  --build-config="backend/cloudbuild.yaml" \
  --included-files="backend/**"

# Admin Dashboard trigger
gcloud builds triggers create github \
  --name="deploy-admin-dashboard" \
  --repo-owner="chetanparmarlife-sketch" \
  --repo-name="CreatorX" \
  --branch-pattern="^main$" \
  --build-config="admin-dashboard/cloudbuild.yaml" \
  --included-files="admin-dashboard/**"

# Brand Dashboard trigger
gcloud builds triggers create github \
  --name="deploy-brand-dashboard" \
  --repo-owner="chetanparmarlife-sketch" \
  --repo-name="CreatorX" \
  --branch-pattern="^main$" \
  --build-config="brand-dashboard/cloudbuild.yaml" \
  --included-files="brand-dashboard/**"
```

### 8.3 Alternative: Update GitHub Actions

If you prefer GitHub Actions over Cloud Build, update `.github/workflows/ci-cd.yml`:

```yaml
name: Deploy to GCP

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'production'
        type: choice
        options:
          - staging
          - production

env:
  GCP_PROJECT_ID: creatorx-prod
  GCP_REGION: asia-south1
  REGISTRY: asia-south1-docker.pkg.dev

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.modified, 'backend/') || github.event_name == 'workflow_dispatch'

    steps:
      - uses: actions/checkout@v4

      - name: Setup JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Setup Gradle
        uses: gradle/gradle-build-action@v2

      - name: Build JAR
        run: ./gradlew clean bootJar -x test
        working-directory: backend

      - name: Authenticate to GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Setup gcloud
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker
        run: gcloud auth configure-docker ${{ env.REGISTRY }}

      - name: Build and Push Docker Image
        run: |
          docker build -t ${{ env.REGISTRY }}/${{ env.GCP_PROJECT_ID }}/creatorx/backend:${{ github.sha }} \
            -f Dockerfile.prod .
          docker push ${{ env.REGISTRY }}/${{ env.GCP_PROJECT_ID }}/creatorx/backend:${{ github.sha }}
        working-directory: backend

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy creatorx-backend \
            --image=${{ env.REGISTRY }}/${{ env.GCP_PROJECT_ID }}/creatorx/backend:${{ github.sha }} \
            --region=${{ env.GCP_REGION }} \
            --platform=managed

  deploy-admin:
    runs-on: ubuntu-latest
    if: contains(github.event.head_commit.modified, 'admin-dashboard/') || github.event_name == 'workflow_dispatch'

    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Setup gcloud
        run: gcloud auth configure-docker ${{ env.REGISTRY }}

      - name: Build and Push
        run: |
          docker build \
            --build-arg NEXT_PUBLIC_API_URL=${{ secrets.API_URL }} \
            --build-arg NEXT_PUBLIC_SUPABASE_URL=${{ secrets.SUPABASE_URL }} \
            --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }} \
            -t ${{ env.REGISTRY }}/${{ env.GCP_PROJECT_ID }}/creatorx/admin-dashboard:${{ github.sha }} .
          docker push ${{ env.REGISTRY }}/${{ env.GCP_PROJECT_ID }}/creatorx/admin-dashboard:${{ github.sha }}
        working-directory: admin-dashboard

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy creatorx-admin \
            --image=${{ env.REGISTRY }}/${{ env.GCP_PROJECT_ID }}/creatorx/admin-dashboard:${{ github.sha }} \
            --region=${{ env.GCP_REGION }} \
            --platform=managed
```

---

## Phase 9: Monitoring & Logging

**Timeline: Day 5**

### 9.1 View Logs

```bash
# Backend logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=creatorx-backend" \
  --limit=100 \
  --format="table(timestamp,textPayload)"

# Stream logs in real-time
gcloud beta run services logs tail creatorx-backend --region=asia-south1
```

### 9.2 Create Uptime Checks

```bash
# Backend health check
gcloud monitoring uptime-check-configs create \
  --display-name="Backend Health Check" \
  --resource-type=uptime-url \
  --hostname=api.creatorx.com \
  --path=/actuator/health \
  --http-method=GET \
  --check-interval=60s \
  --timeout=10s
```

### 9.3 Create Alert Policies

Go to Cloud Console → Monitoring → Alerting → Create Policy:

**Alert 1: High Error Rate**
- Condition: Cloud Run Request Count (5xx) > 10 per minute
- Notification: Email/Slack

**Alert 2: High Latency**
- Condition: Cloud Run Request Latency (99th percentile) > 5s
- Notification: Email/Slack

**Alert 3: Instance Count**
- Condition: Cloud Run Instance Count > 8
- Notification: Email/Slack (indicates high load)

### 9.4 Create Dashboard

Go to Cloud Console → Monitoring → Dashboards → Create Dashboard:

Add widgets for:
- Request count by service
- Request latency (p50, p95, p99)
- Error rate
- Instance count
- CPU utilization
- Memory utilization

---

## Phase 10: Expo Mobile App Deployment

**Timeline: Day 6**

### 10.1 Prerequisites

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login
```

### 10.2 Configure EAS Build

Create/update `app/eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "http://localhost:8080/api/v1",
        "EXPO_PUBLIC_SUPABASE_URL": "https://xxx.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "xxx"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "buildType": "development"
      },
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://staging-api.creatorx.com/api/v1",
        "EXPO_PUBLIC_SUPABASE_URL": "https://xxx.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "xxx"
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "buildType": "release"
      },
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.creatorx.com/api/v1",
        "EXPO_PUBLIC_SUPABASE_URL": "https://xxx.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "xxx"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "YOUR_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### 10.3 Update App Configuration

Update `app/app.json`:

```json
{
  "expo": {
    "name": "CreatorX",
    "slug": "creatorx",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.creatorx.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "CreatorX needs camera access to take photos for your profile and content.",
        "NSPhotoLibraryUsageDescription": "CreatorX needs photo library access to upload images.",
        "NSMicrophoneUsageDescription": "CreatorX needs microphone access for video recording."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.creatorx.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECORD_AUDIO"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow CreatorX to access your photos.",
          "cameraPermission": "Allow CreatorX to access your camera."
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    },
    "owner": "your-expo-username"
  }
}
```

### 10.4 Update API Configuration in App

Create/update `app/lib/config.ts`:

```typescript
// Environment-aware configuration
const ENV = {
  development: {
    apiUrl: 'http://localhost:8080/api/v1',
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xxx.supabase.co',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'xxx',
  },
  preview: {
    apiUrl: 'https://staging-api.creatorx.com/api/v1',
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xxx.supabase.co',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'xxx',
  },
  production: {
    apiUrl: 'https://api.creatorx.com/api/v1',
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xxx.supabase.co',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'xxx',
  },
};

// Determine current environment
const getEnvironment = () => {
  if (__DEV__) return 'development';
  // EAS Build sets this
  const releaseChannel = process.env.EXPO_PUBLIC_RELEASE_CHANNEL;
  if (releaseChannel === 'preview') return 'preview';
  return 'production';
};

export const config = ENV[getEnvironment()];

export const API_BASE_URL = config.apiUrl;
export const SUPABASE_URL = config.supabaseUrl;
export const SUPABASE_ANON_KEY = config.supabaseAnonKey;
```

### 10.5 Build for Development/Testing

```bash
cd app

# Configure the project (first time only)
eas build:configure

# Build development APK (Android)
eas build --platform android --profile development

# Build development build (iOS Simulator)
eas build --platform ios --profile development

# Build preview APK for internal testing
eas build --platform android --profile preview

# Build preview IPA for internal testing (requires Apple Developer account)
eas build --platform ios --profile preview
```

### 10.6 Build for Production

```bash
cd app

# Build production AAB (Android App Bundle) for Play Store
eas build --platform android --profile production

# Build production IPA for App Store
eas build --platform ios --profile production
```

### 10.7 Submit to App Stores

**Android (Google Play Store):**

1. Create Google Play Developer account ($25 one-time)
2. Create app in Google Play Console
3. Generate service account key for automated uploads
4. Place `google-play-service-account.json` in app folder

```bash
# Submit to Google Play
eas submit --platform android --profile production
```

**iOS (Apple App Store):**

1. Apple Developer Program membership ($99/year)
2. Create App Store Connect app record
3. Configure certificates and provisioning profiles

```bash
# Submit to App Store
eas submit --platform ios --profile production
```

### 10.8 Configure Push Notifications (Firebase)

**Step 1: Set up Firebase project**
1. Go to Firebase Console → Create project
2. Add iOS app (bundle ID: `com.creatorx.app`)
3. Add Android app (package: `com.creatorx.app`)
4. Download config files

**Step 2: Add Firebase to Expo**

```bash
# Install Firebase packages
cd app
npx expo install @react-native-firebase/app @react-native-firebase/messaging
```

**Step 3: Update app.json for Firebase**

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ]
    ],
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

### 10.9 EAS Update (Over-the-Air Updates)

For JS-only updates without rebuilding:

```bash
# Configure EAS Update
eas update:configure

# Push update to production
eas update --branch production --message "Bug fixes"

# Push update to preview
eas update --branch preview --message "New feature testing"
```

### 10.10 Mobile App CI/CD

Add to `.github/workflows/mobile.yml`:

```yaml
name: Mobile App Build

on:
  push:
    branches: [main]
    paths:
      - 'app/**'
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform to build'
        required: true
        default: 'all'
        type: choice
        options:
          - android
          - ios
          - all
      profile:
        description: 'Build profile'
        required: true
        default: 'preview'
        type: choice
        options:
          - development
          - preview
          - production

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: app/package-lock.json

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm ci
        working-directory: app

      - name: Build Android
        if: github.event.inputs.platform == 'android' || github.event.inputs.platform == 'all' || github.event.inputs.platform == ''
        run: eas build --platform android --profile ${{ github.event.inputs.profile || 'preview' }} --non-interactive
        working-directory: app

      - name: Build iOS
        if: github.event.inputs.platform == 'ios' || github.event.inputs.platform == 'all'
        run: eas build --platform ios --profile ${{ github.event.inputs.profile || 'preview' }} --non-interactive
        working-directory: app
```

---

## Cost Estimate

### Monthly Costs (Production)

| Service | Specification | Est. Cost (USD) |
|---------|---------------|-----------------|
| **GCP Cloud Run (Backend)** | 1 vCPU, 1GB RAM, min 1 instance, ~100K requests/month | $30-50 |
| **GCP Cloud Run (Admin)** | 1 vCPU, 512MB RAM, min 0, ~10K requests/month | $5-15 |
| **GCP Cloud Run (Brand)** | 1 vCPU, 512MB RAM, min 0, ~50K requests/month | $10-20 |
| **GCP Memorystore Redis** | 1GB Basic tier | $35 |
| **GCP Artifact Registry** | ~5GB storage | $2-5 |
| **GCP Cloud Build** | ~100 build-minutes/month | $3-10 |
| **GCP Secret Manager** | 15 secrets, ~1000 access/month | $1 |
| **GCP Cloud Logging** | ~5GB/month | $2-5 |
| **Supabase Pro** | 8GB database, 250GB bandwidth | $25 |
| **Expo EAS** | Production builds (free tier: 30/month) | $0-99 |
| **Domain + SSL** | Auto-managed by Cloud Run | $0 |
| **Total** | | **~$115-265/month** |

### Cost Optimization Tips

1. **Cloud Run min-instances=0** for dashboards (scales to zero when not in use)
2. **Use Supabase free tier** during development ($0)
3. **Redis Basic tier** is sufficient for caching (upgrade to Standard for HA)
4. **EAS free tier** provides 30 builds/month
5. **Committed use discounts** for predictable workloads (up to 57% savings)

---

## Checklist Summary

### Pre-Deployment (Day 0)
- [ ] Create GCP account with billing
- [ ] Create Supabase account
- [ ] Create Expo account
- [ ] Create Apple Developer account (for iOS)
- [ ] Create Google Play Developer account (for Android)
- [ ] Purchase/configure domain name

### Day 1: Supabase
- [ ] Create Supabase project
- [ ] Run all 36+ database migrations
- [ ] Create storage buckets (avatars, kyc-documents, deliverables, portfolio)
- [ ] Configure RLS policies
- [ ] Document all credentials

### Day 2: GCP Infrastructure
- [ ] Create GCP project
- [ ] Enable required APIs
- [ ] Create Artifact Registry
- [ ] Create VPC connector
- [ ] Create Memorystore Redis
- [ ] Set up Secret Manager with all secrets

### Day 3: Backend Deployment
- [ ] Build backend Docker image
- [ ] Push to Artifact Registry
- [ ] Deploy to Cloud Run
- [ ] Test health endpoint
- [ ] Verify database connection
- [ ] Test API endpoints

### Day 4: Frontend Deployment
- [ ] Create Next.js Dockerfiles
- [ ] Update next.config.js for standalone
- [ ] Build and deploy admin dashboard
- [ ] Build and deploy brand dashboard
- [ ] Map custom domains
- [ ] Verify SSL certificates

### Day 5: CI/CD & Monitoring
- [ ] Connect GitHub to Cloud Build
- [ ] Create build triggers for all services
- [ ] Set up monitoring dashboards
- [ ] Configure alert policies
- [ ] Test deployment pipeline

### Day 6: Mobile App
- [ ] Configure EAS build profiles
- [ ] Update app configuration with production URLs
- [ ] Build preview builds for testing
- [ ] Test on real devices
- [ ] Build production builds
- [ ] Submit to App Store (iOS)
- [ ] Submit to Play Store (Android)

### Post-Deployment
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security review
- [ ] Documentation update
- [ ] Team training

---

## Quick Reference Commands

```bash
# ============ GCP ============
# View all Cloud Run services
gcloud run services list --region=asia-south1

# View logs
gcloud beta run services logs tail creatorx-backend --region=asia-south1

# Update service
gcloud run services update creatorx-backend --region=asia-south1 --memory=2Gi

# ============ Supabase ============
# Connect to database
psql "postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"

# ============ Expo ============
# Build Android
eas build -p android --profile production

# Build iOS
eas build -p ios --profile production

# Submit to stores
eas submit -p android
eas submit -p ios

# OTA Update
eas update --branch production --message "Update description"
```

---

## Troubleshooting

### Backend won't start
1. Check logs: `gcloud beta run services logs tail creatorx-backend --region=asia-south1`
2. Verify secrets are accessible
3. Check database connection string
4. Ensure Redis is accessible via VPC connector

### Frontend shows API errors
1. Verify NEXT_PUBLIC_API_URL is correct
2. Check CORS configuration on backend
3. Verify Supabase credentials

### Mobile app can't connect to API
1. Check API_BASE_URL in config.ts
2. Verify the backend is accessible
3. Check for SSL/certificate issues

### Database migration failures
1. Check migration file syntax
2. Verify PostgreSQL version compatibility
3. Run migrations manually to see specific errors

---

## Support & Resources

- **GCP Documentation**: https://cloud.google.com/run/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Expo Documentation**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Project Repository**: https://github.com/chetanparmarlife-sketch/CreatorX

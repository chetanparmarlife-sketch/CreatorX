# Production Deployment Checklist: CreatorX

**Target Architecture:** AWS (ECS/Fargate) + RDS Postgres + Redis ElastiCache
**Stack:** Spring Boot (Backend) + Next.js (Web) + React Native (Mobile)

---

## Phase 1: Cloud Infrastructure (AWS Example)

### 1.1 Network & Security
- [ ] **VPC Setup:** Create VPC with 2 Public Subnets (LB) and 2 Private Subnets (App/DB).
- [ ] **Security Groups:**
    -   `sg-alb`: Allow Inbound TCP 443 from `0.0.0.0/0`.
    -   `sg-app`: Allow Inbound TCP 8080 from `sg-alb`.
    -   `sg-db`: Allow Inbound TCP 5432 from `sg-app`.
    -   `sg-redis`: Allow Inbound TCP 6379 from `sg-app`.

### 1.2 Managed Services
- [ ] **Database (RDS):**
    -   Launch Postgres 15+ (t3.medium or larger).
    -   Enable "Multi-AZ" for high availability.
    -   Create production DB name: `creatorx_prod`.
    -   Store credentials in AWS Secrets Manager.
- [ ] **Cache (ElastiCache):**
    -   Launch Redis cluster (t3.micro is fine for start).
    -   Enable "Encryption at Rest".
- [ ] **Storage (S3):**
    -   Create simplified bucket naming: `creatorx-prod-assets`.
    -   **CRITICAL:** Block Public Access. configure CloudFront for delivery.

---

## Phase 2: Application Configuration

### 2.1 Backend Credentials
- [ ] **Environment Variables:**
    -   `SPRING_PROFILES_ACTIVE`: `prod`
    -   `DATABASE_URL`: `jdbc:postgresql://<rds-endpoint>:5432/creatorx_prod`
    -   `SUPABASE_URL`: `https://<prod-project>.supabase.co`
    -   `JWT_SECRET`: Generate new 64-char random string.
- [ ] **Supabase:**
    -   Create new "Production" project in Supabase Dashboard.
    -   Enable "Email Provider" (or disable if using custom SMTP).
    -   Apply `db/migration` scripts to Supabase DB.

### 2.2 Dashboard Config (Vercel/Amplify)
- [ ] **Deploy Brand Dashboard:**
    -   `NEXT_PUBLIC_API_BASE_URL`: `https://api.creatorx.com/api/v1`
- [ ] **Deploy Admin Dashboard:**
    -   Ensure basic auth or VPN protection if internal-only.

---

## Phase 3: CI/CD Pipeline (GitHub Actions)

### 3.1 Secrets Setup
- [ ] Go to Repo Settings > Secrets and add:
    -   `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`
    -   `ECR_REPOSITORY_URI`
    -   `PROD_DB_URL`
    -   `SONAR_TOKEN`

### 3.2 Workflow Modernization
- [ ] **Fix `ci-cd.yml`:**
    -   Remove reference to invalid `dev` environment or create it.
    -   Add "Build & Push to ECR" step.
    -   Add "Deploy to ECS" step.

---

## Phase 4: Domain & SSL

### 4.1 DNS (Route53 / GoDaddy)
- [ ] **Backend:** Create A Record `api.creatorx.com` -> ALB Alias.
- [ ] **Web:** Create CNAME `dashboard.creatorx.com` -> Vercel/Amplify.
- [ ] **Deep Links:** Configure Apple App Site Association (AASA) file at `https://api.creatorx.com/.well-known/apple-app-site-association`.

### 4.2 SSL Certificates
- [ ] Request ACM Certificate `*.creatorx.com`.
- [ ] Attach Certificate to Load Balancer listener (443).

---

## Phase 5: Mobile Release Checks (App Store/Play Store)

### 5.1 Hardening
- [ ] **Update `API_BASE_URL`:** Point to `https://api.creatorx.com/api/v1`.
- [ ] **Remove Logs:** Ensure `console.log` is stripped in release build (babel-plugin-transform-remove-console).
- [ ] **Version Bump:** Increment `version` in `app.json` (e.g., 1.0.0 -> 1.0.1).

### 5.2 Legal
- [ ] **Privacy Policy URL:** Must be publicly accessible (e.g., `https://creatorx.com/privacy`).
- [ ] **Support URL:** Must be accessible.

---

## Phase 6: Post-Deployment Verification

- [ ] **Connectivity Test:** Can `api.creatorx.com/actuator/health` be reached?
- [ ] **Database Test:** Can a new user Sign Up? (Writes to DB).
- [ ] **Storage Test:** Can user upload Avatar? (Writes to S3/Supabase).
- [ ] **Email Test:** trigger "Forgot Password" -> Receive Email?

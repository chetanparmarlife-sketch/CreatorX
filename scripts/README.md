# CreatorX Deployment Scripts

This directory contains deployment and testing scripts for CreatorX backend.

## Scripts

### Deployment Scripts

#### `deploy-dev.sh`
Deploys the application to the development environment.

**Usage:**
```bash
./deploy-dev.sh <image-tag>
```

**Environment Variables:**
- `SERVICE_NAME`: Cloud Run service name (default: `creatorx-backend-dev`)
- `REGION`: GCP region (default: `us-central1`)
- `GCP_PROJECT_ID`: GCP project ID
- `GCP_SA_KEY`: Base64-encoded GCP service account key

#### `deploy-staging.sh`
Deploys the application to the staging environment.

**Usage:**
```bash
./deploy-staging.sh <image-tag> <version>
```

**Environment Variables:**
- `SERVICE_NAME`: Cloud Run service name (default: `creatorx-backend-staging`)
- `REGION`: GCP region (default: `us-central1`)
- `GCP_PROJECT_ID`: GCP project ID
- `GCP_SA_KEY`: Base64-encoded GCP service account key

#### `deploy-production.sh`
Deploys the application to the production environment with blue-green deployment.

**Usage:**
```bash
./deploy-production.sh <image-tag>
```

**Features:**
- Gradual traffic shifting (10% → 50% → 100%)
- Rollback support
- Health checks

**Environment Variables:**
- `SERVICE_NAME`: Cloud Run service name (default: `creatorx-backend-prod`)
- `REGION`: GCP region (default: `us-central1`)
- `GCP_PROJECT_ID`: GCP project ID
- `GCP_SA_KEY`: Base64-encoded GCP service account key

#### `rollback.sh`
Rolls back to a previous revision.

**Usage:**
```bash
./rollback.sh <environment> [revision-name]
```

**Examples:**
```bash
# Rollback to previous revision
./rollback.sh production

# Rollback to specific revision
./rollback.sh production creatorx-backend-prod-00001-abc
```

### Testing Scripts

#### `smoke-tests.sh`
Runs smoke tests against a deployed environment.

**Usage:**
```bash
./smoke-tests.sh <base-url>
```

**Tests:**
- Health endpoint
- Info endpoint
- Swagger UI
- OpenAPI docs
- Campaigns endpoint

#### `health-check.sh`
Performs health check with retry logic.

**Usage:**
```bash
./health-check.sh <base-url>
```

**Features:**
- Retry logic (10 attempts)
- Timeout handling
- Status validation

#### `e2e-tests.sh`
Runs end-to-end tests.

**Usage:**
```bash
./e2e-tests.sh <base-url>
```

**Tests:**
- Health check
- User registration
- Campaign listing
- API documentation

## Setup

### Make Scripts Executable

```bash
chmod +x scripts/*.sh
```

### Configure GCP Authentication

1. Create a service account in GCP
2. Grant necessary permissions (Cloud Run Admin, etc.)
3. Download the key file
4. Base64 encode it:
   ```bash
   base64 -i key.json > key.b64
   ```
5. Add to GitHub Secrets as `GCP_SA_KEY`

### Required Secrets

Add these to GitHub Secrets:

- `GCP_PROJECT_ID`: Your GCP project ID
- `GCP_SA_KEY`: Base64-encoded service account key
- `AWS_ACCESS_KEY_ID`: AWS access key (if using AWS)
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `AWS_REGION`: AWS region
- `SONAR_TOKEN`: SonarQube token (optional)
- `SNYK_TOKEN`: Snyk token (optional)
- `CODECOV_TOKEN`: Codecov token (optional)

## Usage Examples

### Deploy to Dev

```bash
export GCP_PROJECT_ID=your-project-id
export GCP_SA_KEY=$(cat key.b64)
export SERVICE_NAME=creatorx-backend-dev
./scripts/deploy-dev.sh ghcr.io/your-org/creatorx-backend:main-abc123
```

### Run Smoke Tests

```bash
./scripts/smoke-tests.sh https://api-dev.creatorx.com
```

### Rollback Production

```bash
export GCP_PROJECT_ID=your-project-id
export GCP_SA_KEY=$(cat key.b64)
./scripts/rollback.sh production
```

## Troubleshooting

### Permission Denied

```bash
chmod +x scripts/*.sh
```

### GCP Authentication Failed

- Verify service account key is correct
- Check service account has necessary permissions
- Ensure key is base64-encoded correctly

### Deployment Failed

- Check Cloud Run logs: `gcloud run services logs read <service-name>`
- Verify environment variables are set
- Check service account permissions

## Notes

- All scripts use `set -e` to exit on error
- Scripts are designed for GitHub Actions but can be run locally
- Make sure to set all required environment variables before running


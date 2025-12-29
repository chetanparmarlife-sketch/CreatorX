#!/bin/bash

# Deploy CreatorX backend to Production environment
# Usage: ./deploy-production.sh <image-tag>

set -e

IMAGE_TAG=$1
SERVICE_NAME=${SERVICE_NAME:-creatorx-backend-prod}
REGION=${REGION:-us-central1}
PROJECT_ID=${GCP_PROJECT_ID}

if [ -z "$IMAGE_TAG" ]; then
    echo "Error: Image tag is required"
    echo "Usage: ./deploy-production.sh <image-tag>"
    exit 1
fi

echo "🚀 Deploying to Production environment..."
echo "Image Tag: $IMAGE_TAG"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# Authenticate with GCP
if [ -n "$GCP_SA_KEY" ]; then
    echo "$GCP_SA_KEY" | base64 -d > /tmp/gcp-key.json
    export GOOGLE_APPLICATION_CREDENTIALS=/tmp/gcp-key.json
    gcloud auth activate-service-account --key-file=/tmp/gcp-key.json
    gcloud config set project "$PROJECT_ID"
fi

# Get current revision for rollback
CURRENT_REVISION=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.latestReadyRevisionName)' 2>/dev/null || echo "")
echo "Current revision: $CURRENT_REVISION"

# Deploy to Cloud Run with traffic splitting (blue-green)
gcloud run deploy "$SERVICE_NAME" \
    --image "$IMAGE_TAG" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --memory 4Gi \
    --cpu 4 \
    --min-instances 2 \
    --max-instances 50 \
    --timeout 300 \
    --concurrency 80 \
    --set-env-vars "SPRING_PROFILES_ACTIVE=prod" \
    --set-secrets "DATABASE_URL=DATABASE_URL:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest,REDIS_PASSWORD=REDIS_PASSWORD:latest" \
    --port 8080 \
    --no-traffic

# Get new revision
NEW_REVISION=$(gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format 'value(status.latestReadyRevisionName)')
echo "New revision: $NEW_REVISION"

# Gradually shift traffic (canary deployment)
echo "Shifting 10% traffic to new revision..."
gcloud run services update-traffic "$SERVICE_NAME" \
    --region "$REGION" \
    --to-revisions "$NEW_REVISION=10"

sleep 30

echo "Shifting 50% traffic to new revision..."
gcloud run services update-traffic "$SERVICE_NAME" \
    --region "$REGION" \
    --to-revisions "$NEW_REVISION=50"

sleep 30

echo "Shifting 100% traffic to new revision..."
gcloud run services update-traffic "$SERVICE_NAME" \
    --region "$REGION" \
    --to-revisions "$NEW_REVISION=100"

echo "✅ Deployment completed successfully!"
echo "Service URL: $(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')"
echo "Current revision: $NEW_REVISION"
echo "Previous revision (for rollback): $CURRENT_REVISION"


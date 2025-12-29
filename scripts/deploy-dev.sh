#!/bin/bash

# Deploy CreatorX backend to Dev environment
# Usage: ./deploy-dev.sh <image-tag>

set -e

IMAGE_TAG=$1
SERVICE_NAME=${SERVICE_NAME:-creatorx-backend-dev}
REGION=${REGION:-us-central1}
PROJECT_ID=${GCP_PROJECT_ID}

if [ -z "$IMAGE_TAG" ]; then
    echo "Error: Image tag is required"
    echo "Usage: ./deploy-dev.sh <image-tag>"
    exit 1
fi

echo "🚀 Deploying to Dev environment..."
echo "Image Tag: $IMAGE_TAG"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# Authenticate with GCP (if using GCP)
if [ -n "$GCP_SA_KEY" ]; then
    echo "$GCP_SA_KEY" | base64 -d > /tmp/gcp-key.json
    export GOOGLE_APPLICATION_CREDENTIALS=/tmp/gcp-key.json
    gcloud auth activate-service-account --key-file=/tmp/gcp-key.json
    gcloud config set project "$PROJECT_ID"
fi

# Deploy to Cloud Run
gcloud run deploy "$SERVICE_NAME" \
    --image "$IMAGE_TAG" \
    --region "$REGION" \
    --platform managed \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 1 \
    --max-instances 10 \
    --timeout 300 \
    --concurrency 80 \
    --set-env-vars "SPRING_PROFILES_ACTIVE=dev" \
    --set-secrets "DATABASE_URL=DATABASE_URL:latest,SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest" \
    --port 8080

echo "✅ Deployment completed successfully!"
echo "Service URL: $(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')"


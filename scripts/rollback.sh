#!/bin/bash

# Rollback script for CreatorX backend
# Usage: ./rollback.sh <environment> [revision-name]

set -e

ENVIRONMENT=$1
REVISION=$2

if [ -z "$ENVIRONMENT" ]; then
    echo "Error: Environment is required"
    echo "Usage: ./rollback.sh <environment> [revision-name]"
    exit 1
fi

case $ENVIRONMENT in
    dev)
        SERVICE_NAME=${SERVICE_NAME:-creatorx-backend-dev}
        ;;
    staging)
        SERVICE_NAME=${SERVICE_NAME:-creatorx-backend-staging}
        ;;
    production|prod)
        SERVICE_NAME=${SERVICE_NAME:-creatorx-backend-prod}
        ;;
    *)
        echo "Error: Invalid environment. Use: dev, staging, or production"
        exit 1
        ;;
esac

REGION=${REGION:-us-central1}
PROJECT_ID=${GCP_PROJECT_ID}

echo "🔄 Rolling back $ENVIRONMENT environment..."
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"

# Authenticate with GCP
if [ -n "$GCP_SA_KEY" ]; then
    echo "$GCP_SA_KEY" | base64 -d > /tmp/gcp-key.json
    export GOOGLE_APPLICATION_CREDENTIALS=/tmp/gcp-key.json
    gcloud auth activate-service-account --key-file=/tmp/gcp-key.json
    gcloud config set project "$PROJECT_ID"
fi

# List recent revisions
echo "Recent revisions:"
gcloud run revisions list --service "$SERVICE_NAME" --region "$REGION" --limit 5

# If revision not specified, use previous one
if [ -z "$REVISION" ]; then
    echo "No revision specified, using previous revision..."
    REVISION=$(gcloud run revisions list --service "$SERVICE_NAME" --region "$REGION" --limit 2 --format 'value(name)' | tail -n1)
    echo "Selected revision: $REVISION"
fi

# Confirm rollback
if [ "$ENVIRONMENT" = "production" ] || [ "$ENVIRONMENT" = "prod" ]; then
    echo "⚠️  WARNING: Rolling back PRODUCTION environment!"
    echo "This will route 100% traffic to revision: $REVISION"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Rollback cancelled"
        exit 1
    fi
fi

# Rollback by routing traffic to previous revision
echo "Rolling back to revision: $REVISION"
gcloud run services update-traffic "$SERVICE_NAME" \
    --region "$REGION" \
    --to-revisions "$REVISION=100"

echo "✅ Rollback completed successfully!"
echo "Service URL: $(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')"
echo "Active revision: $REVISION"


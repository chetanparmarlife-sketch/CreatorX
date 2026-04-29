# CreatorX Deployment Guide

This guide explains how to set up CreatorX staging and production from zero.

## 1. Overview

Staging is your test kitchen. It should look and behave like the real app, but it is safe to break while testing new features.

Production is the real business. Real users, real brand payments, real creator payouts, and real data live here, so changes should be made carefully.

Simple flow:

```text
Developer pushes code
        |
        v
GitHub checks the branch
        |
        +--> develop branch --> staging
        |
        +--> main branch -----> production
```

## 2. One-Time Setup Checklist

1. Create Railway account

Go to `railway.app`, click `Login`, create an account, then click `New Project`.

Choose `Deploy from GitHub repo`, connect GitHub, and select the CreatorX repository.

Create two Railway services:

- `creatorx-backend-staging`
- `creatorx-backend-prod`

Add the staging environment variables from [backend/.env.example](backend/.env.example) to the staging service. Add the production environment variables from the same file to the production service.

2. Create Vercel projects

Go to `vercel.com`, click `Add New`, then click `Project`.

Import the CreatorX repository and set `Root Directory` to `brand-dashboard`. Name the project `creatorx-brand`.

Import the CreatorX repository again and set `Root Directory` to `admin-dashboard`. Name the project `creatorx-admin-staging` for staging or use one project with Vercel environments.

If you also deploy the landing page on Vercel, import the repository again and set `Root Directory` to `landing-page`.

3. Create Supabase projects

Go to `supabase.com`, create one project for staging, and create a second project for production.

Use the staging Supabase URL and anon key only in staging. Use the production Supabase URL and anon key only in production.

4. Get Razorpay keys

Go to `razorpay.com`, open the developer API keys page, and create TEST API keys for staging.

When the business is ready for real payments, create LIVE API keys for production.

5. Add GitHub Secrets

In GitHub, open the CreatorX repository, click `Settings`, click `Secrets and variables`, click `Actions`, then click `New repository secret`.

Add every secret listed in the table below.

## 3. GitHub Secrets Needed

| Secret Name | What it is | Where to find it |
| --- | --- | --- |
| `STAGING_RAILWAY_TOKEN` | Railway token for staging deploys | Railway project settings, create a project token for the staging environment |
| `PROD_RAILWAY_TOKEN` | Railway token for production deploys | Railway project settings, create a project token for the production environment |
| `VERCEL_TOKEN` | Allows GitHub Actions to deploy to Vercel | Vercel account settings, Tokens |
| `VERCEL_ORG_ID` | Your Vercel team or account ID | Run `vercel pull` locally or check `.vercel/project.json` after linking |
| `VERCEL_BRAND_PROJECT_ID` | Vercel project ID for the brand dashboard | Vercel project settings for the brand dashboard |
| `VERCEL_ADMIN_PROJECT_ID` | Vercel project ID for the admin dashboard | Vercel project settings for the admin dashboard |
| `PROD_API_URL` | Public production backend URL | Railway production service public URL |
| `STAGING_ALLOWED_ORIGINS` | Comma-separated staging frontend URLs allowed for CORS and WebSocket connections | Use the staging Vercel URLs for brand/admin dashboards and any staging frontend |
| `PROD_ALLOWED_ORIGINS` | Comma-separated production frontend URLs allowed for CORS and WebSocket connections | Use the production Vercel URLs for brand/admin dashboards and any production frontend |
| `EXPO_PUBLIC_SENTRY_DSN` | Optional mobile Sentry DSN for creator app crash reporting | Sentry project settings, Client Keys / DSN |
| `SLACK_WEBHOOK_URL` | Optional Slack webhook for deployment messages | Slack app or incoming webhook settings |
| `DISCORD_WEBHOOK_URL` | Optional Discord webhook for deployment messages | Discord channel integration settings |

## 4. How To Deploy

To deploy to staging: push your code to the `develop` branch.

To deploy to production: merge `develop` into the `main` branch.

To check if deployment succeeded, open the GitHub repository, click `Actions`, and open the latest workflow run.

For backend logs, open Railway, select the service, then click `Deployments` or `Logs`.

For dashboard logs, open Vercel, select the project, then click the latest deployment.

## 5. How To Check If Everything Is Working

Backend health check URL pattern:

```text
https://YOUR_BACKEND_DOMAIN_HERE/actuator/health
```

The production workflow checks:

```text
$PROD_API_URL/actuator/health
```

To open the brand dashboard, go to the Vercel project for `brand-dashboard`, then click the latest deployment URL.

To open the admin dashboard, go to the Vercel project for `admin-dashboard`, then click the latest deployment URL.

## 6. If Something Goes Wrong

In Railway, open the backend service, click `Deployments`, choose the failed deployment, and read the build and runtime logs.

In Vercel, open the dashboard project, choose the failed deployment, and read the build logs.

To roll back in Railway, open the service deployments list, choose the last working deployment, and click rollback or redeploy.

To roll back in Vercel, open the project deployments list, choose the last working deployment, click the menu, and choose rollback or promote that deployment.

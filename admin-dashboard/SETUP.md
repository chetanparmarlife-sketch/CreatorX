# CreatorX Admin Dashboard Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd admin-dashboard
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.local.example .env.local

# Edit .env.local
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
# NEXT_PUBLIC_BRAND_DASHBOARD_URL=http://localhost:3000
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002)

## Project Structure

```
admin-dashboard/
├── app/
│   ├── (auth)/               # Authentication routes
│   ├── (admin)/              # Admin routes
│   │   └── admin/            # Admin pages
│   ├── layout.tsx            # Root layout
│   └── providers.tsx         # React Query provider
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── layout/               # Layout components
│   └── shared/               # Shared UI patterns
├── lib/
│   ├── api/                  # API client + admin services
│   ├── store/                # Zustand stores
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Notes

- Admin endpoints require `ROLE_ADMIN` + RBAC permissions.
- Work Queue counts + SLA badges are sourced from `/admin/system/summary`.

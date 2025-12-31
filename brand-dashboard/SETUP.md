# CreatorX Brand Dashboard Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd brand-dashboard
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.local.example .env.local

# Edit .env.local
# API_BASE_URL=http://localhost:8080/api/v1
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
brand-dashboard/
├── app/
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── dashboard/        # KPIs + workflows
│   │   ├── campaigns/        # Lifecycle + details
│   │   ├── creators/         # Creator discovery
│   │   ├── deliverables/     # SLA queue
│   │   ├── payments/         # Filters + balance
│   │   ├── profile/          # Brand profile + verification
│   │   └── settings/         # Settings
│   ├── layout.tsx           # Root layout
│   └── providers.tsx        # React Query provider
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components
│   └── shared/              # Shared UI patterns
├── lib/
│   ├── api/                 # API client and services
│   ├── store/               # Zustand stores
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Notes

- Campaigns default to `DRAFT` and move to `PENDING_REVIEW` when submitted.
- Deliverables queue supports bulk review with SLA signals.

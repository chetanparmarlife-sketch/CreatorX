# CreatorX Admin Dashboard

Next.js 14 admin console for platform governance, compliance, and operations on CreatorX.

## Features

- ✅ Work Queue with counts + SLA badges (KYC, flags, disputes, GDPR)
- ✅ Moderation tools (campaign reviews, moderation rules)
- ✅ Admin-as-brand campaign management (create/edit/pause, applications, deliverables)
- ✅ Dispute management with evidence + resolution actions
- ✅ Compliance workflows (GDPR export/anonymize, audit log, reports)
- ✅ Finance reconciliation + CSV exports
- ✅ System monitoring (health/metrics)
- ✅ RBAC permission enforcement
- ✅ Shared UI system (status chips, action bars, empty states)
- ✅ Admin messaging (view all conversations, reply as Team CreatorX)

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + shared patterns
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:8080`

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your configuration
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
# NEXT_PUBLIC_BRAND_DASHBOARD_URL=http://localhost:3000
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3002
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

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
│   └── shared/               # Shared UI patterns (status chip, action bar, etc.)
├── lib/
│   ├── api/                  # API client and services
│   ├── store/                # Zustand stores
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
└── package.json
```

## UI System (Shared Patterns)

- **StatusChip**: approved/needs-action/blocked/pending states
- **ActionBar / QueueToolbar**: bulk actions + SLA summary
- **ContextPanel**: compact info blocks for detail pages
- **EmptyState**: consistent empty guidance
- **Density classes**: `table-compact`, `table-comfortable`, `surface-card`

## Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_BRAND_DASHBOARD_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## API Integration

The dashboard integrates with the same Spring Boot backend as the mobile app:

- Same API endpoints
- Same authentication flow
- Same data types
- Consistent error handling

## License

Proprietary - All rights reserved

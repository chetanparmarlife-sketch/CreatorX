# CreatorX Brand Dashboard

Next.js 14 brand dashboard for managing influencer campaigns on CreatorX.

## Features

- ✅ Campaign creation with budget guidance + launch checklist
- ✅ Lifecycle tabs (Draft → Open → In Review → Active → Completed)
- ✅ Inline preview + bulk actions for campaigns
- ✅ Creator discovery with shortlist + compare + pagination
- ✅ Deliverables queue with SLA signals + bulk review
- ✅ Payments filters + balance summary
- ✅ Profile + GST verification workflow
- ✅ Dashboard KPIs: lifecycle progress, spend/budget health, deliverables status, in-progress tasks
- ✅ Shared UI system (status chips, action bars, empty states)

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
# API_BASE_URL=http://localhost:8080/api/v1
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
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
brand-dashboard/
├── app/
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Dashboard routes
│   │   ├── dashboard/        # Home + KPIs
│   │   ├── campaigns/        # Campaign lifecycle + details
│   │   ├── creators/         # Creator discovery
│   │   ├── deliverables/     # Deliverables queue
│   │   ├── payments/         # Payments + filters
│   │   ├── profile/          # Brand profile + GST verification
│   │   └── settings/         # Settings
│   ├── layout.tsx            # Root layout
│   └── providers.tsx         # React Query provider
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── layout/               # Layout components
│   └── shared/               # Shared UI patterns (queue toolbar, chips)
├── lib/
│   ├── api/                  # API client and services
│   ├── store/                # Zustand stores
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
└── package.json
```

## UI System (Shared Patterns)

- **StatusChip**: approved/needs-action/blocked/pending states
- **QueueToolbar**: bulk actions + SLA summary
- **ContextPanel**: compact info blocks
- **EmptyState**: consistent empty guidance
- **Density classes**: `table-compact`, `table-comfortable`, `surface-card`

## Environment Variables

```env
API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## License

Proprietary - All rights reserved

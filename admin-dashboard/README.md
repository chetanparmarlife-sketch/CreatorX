# CreatorX Brand Dashboard

Next.js 14 brand dashboard for managing influencer campaigns on CreatorX.

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ shadcn/ui components
- ✅ React Query for data fetching
- ✅ Zustand for state management
- ✅ JWT authentication with auto-refresh
- ✅ Responsive design

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
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
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/          # Dashboard routes
│   │   ├── campaigns/
│   │   ├── creators/
│   │   └── messages/
│   ├── layout.tsx            # Root layout
│   └── providers.tsx         # React Query provider
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── layout/               # Layout components
├── lib/
│   ├── api/                  # API client and services
│   ├── store/                # Zustand stores
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
└── package.json
```

## Architecture

### API Client

The API client (`lib/api/client.ts`) matches the React Native app architecture:

- JWT token management
- Automatic token refresh
- Request/response interceptors
- Error handling
- Token storage (localStorage)

### Authentication

Authentication uses Supabase (matching React Native app):

- Login/Register via Supabase
- Link user to backend
- JWT token storage
- Auto-refresh on token expiry

### State Management

- **Zustand**: Global auth state
- **React Query**: Server state and caching

## Environment Variables

```env
API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## API Integration

The dashboard integrates with the same Spring Boot backend as the React Native app:

- Same API endpoints
- Same authentication flow
- Same data types
- Consistent error handling

## Components

### shadcn/ui Components

- Button
- Card
- Input
- Label
- Badge
- Alert
- (More can be added as needed)

## Development

### Adding New Pages

1. Create page in `app/(dashboard)/`
2. Add route to sidebar navigation
3. Create API service if needed
4. Add React Query hooks

### Adding API Services

1. Create service in `lib/api/`
2. Use `apiClient` from `lib/api/client.ts`
3. Define types in `lib/types/index.ts`
4. Create React Query hooks

## License

Proprietary - All rights reserved


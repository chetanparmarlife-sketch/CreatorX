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
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── campaigns/
│   │   ├── creators/
│   │   └── messages/
│   ├── layout.tsx          # Root layout
│   └── providers.tsx        # React Query provider
├── components/
│   ├── ui/                  # shadcn/ui components
│   └── layout/              # Layout components
├── lib/
│   ├── api/                 # API client and services
│   ├── store/               # Zustand stores
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
└── package.json
```

## Architecture

### API Client

The API client (`lib/api/client.ts`) matches the React Native app:

- JWT token management
- Automatic token refresh
- Request/response interceptors
- Error handling

### Authentication

- Uses Supabase Auth (same as React Native app)
- Links user to backend
- JWT token storage in localStorage
- Auto-refresh on expiry

### State Management

- **Zustand**: Global auth state
- **React Query**: Server state and caching

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Next Steps

1. Complete campaign management pages
2. Add application management
3. Implement messaging interface
4. Add analytics dashboard


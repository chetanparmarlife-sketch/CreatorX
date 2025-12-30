# CreatorX - Content Creator Collaboration App

## Overview
CreatorX is a comprehensive React Native/Expo mobile application for content creators to discover brand collaboration campaigns, manage deliverables, track earnings, and communicate with brands. The app features a premium dark mode design aesthetic inspired by Linear and Stripe.

## Recent Changes
- **December 2024**: Brand Dashboard UI overhaul to match new Figma design (light theme, sky blue primary)
- **December 2024**: New sidebar navigation with Influencer Discovery section (Instagram/Facebook/YouTube)
- **December 2024**: New Dashboard home page with stats cards and activity feed
- **December 2024**: New Influencer Lists, Profile, and Help & Support pages
- **December 2024**: Updated login page with social login buttons (Google/Apple)
- **December 2024**: Added Splash Screen with animated logo and branding
- **December 2024**: Added Auth Screen with login/signup and skip option
- **December 2024**: Implemented app flow: Splash -> Auth -> Main app
- **December 2024**: Added Analytics page with performance metrics, charts, and insights
- **December 2024**: Added Saved Campaigns page to bookmark and manage favorite campaigns
- **December 2024**: Added Edit Profile page for updating user information and settings
- **December 2024**: Fixed deprecated shadow style warnings for web compatibility
- **December 2024**: Added Quick Actions section on home page for fast navigation
- **December 2024**: Updated package dependencies for Expo compatibility
- **December 2024**: Enhanced profile page with links to Analytics and Saved campaigns

## Project Architecture

### Technology Stack
- **Framework**: React Native with Expo (Mobile App), Next.js (Brand Dashboard)
- **Navigation**: Expo Router (file-based routing), Next.js App Router
- **State Management**: React Context API, Zustand (Brand Dashboard)
- **Storage**: AsyncStorage for persistence
- **UI Components**: Custom components with Linear Gradient effects (Mobile), shadcn/ui (Dashboard)
- **Icons**: Feather icons from @expo/vector-icons, Lucide icons (Dashboard)

### Directory Structure

#### Mobile App (Root)
```
app/                    # Expo Router pages
├── _layout.tsx         # Tab navigation layout
├── index.tsx           # Home screen
├── explore.tsx         # Campaign exploration
├── upload.tsx          # Content upload
├── chat.tsx            # Messages list
├── wallet.tsx          # Earnings and withdrawals
├── profile.tsx         # User profile
├── analytics.tsx       # Performance analytics
├── saved.tsx           # Saved campaigns
├── edit-profile.tsx    # Profile editing
├── notifications.tsx   # Notification center
└── conversation.tsx    # Chat conversation

src/
├── components/         # Reusable UI components
├── context/            # App context provider
├── hooks/              # Custom React hooks
├── theme/              # Colors, typography, spacing
└── types/              # TypeScript definitions
```

#### Brand Dashboard (brand-dashboard/)
```
app/
├── (auth)/             # Auth pages (login, register)
├── (dashboard)/        # Protected dashboard pages
│   ├── dashboard/      # Home/Dashboard
│   ├── instagram/      # Instagram influencer discovery
│   ├── facebook/       # Facebook influencer discovery
│   ├── youtube/        # YouTube influencer discovery
│   ├── campaigns/      # Campaign management
│   ├── messages/       # Messaging with creators
│   ├── lists/          # Influencer lists
│   ├── payments/       # Payment management
│   ├── settings/       # Account settings
│   ├── profile/        # User profile
│   └── help/           # Help & support
└── globals.css         # Global styles

components/
├── layout/             # Layout components (Sidebar, Header)
├── shared/             # Shared components (PageHeader, badges)
└── ui/                 # shadcn/ui components
```

## Design Guidelines

### Mobile App (Creator App)
- Background: #0a0a0a (near black)
- Primary: #8b5cf6 (violet/purple)
- Glass morphism effects with subtle gradients
- Consistent border radius (8-24px)
- Card-based layouts with subtle borders

### Brand Dashboard
- Background: #F7F9FC (light gray)
- Primary: #0EA5E9 (sky blue)
- Clean white cards with subtle borders
- Light theme with professional aesthetic
- Navigation: Sidebar with sections (Home, Influencer Discovery, Campaign Management, Settings)

## Key Features

### Mobile App
1. **Splash Screen**: Animated logo with premium branding on app open
2. **Auth Screen**: Login/signup with social options and skip functionality
3. **Home Dashboard**: Earnings overview, quick stats, active campaigns, quick actions
4. **Explore**: Browse and filter available brand campaigns
5. **Upload**: Submit content deliverables for campaigns
6. **Chat**: Real-time messaging with brands
7. **Wallet**: Track earnings, pending payments, withdrawal history
8. **Profile**: User settings, referral system, KYC verification
9. **Analytics**: Performance metrics, earnings charts, insights
10. **Saved Campaigns**: Bookmark campaigns for later

### Brand Dashboard
1. **Dashboard**: Stats overview, recent activity, quick actions
2. **Influencer Discovery**: Search Instagram/Facebook/YouTube influencers
3. **Campaigns**: Create and manage influencer campaigns
4. **Messages**: Real-time chat with creators
5. **Influencer Lists**: Organize creators into custom lists
6. **Payments**: Manage payment methods and transactions
7. **Settings**: Profile, team, notifications, security

## Running the Project

### Mobile App
```bash
npm run dev
```
This starts Metro bundler with Expo tunnel on port 5000.

### Brand Dashboard
```bash
cd brand-dashboard && npm run dev
```
Runs on port 3001.

## User Preferences
- Dark mode design for mobile app
- Light mode for brand dashboard
- Rupee (₹) currency format
- Mobile-first responsive design
- Smooth animations and transitions

## Demo Mode
Brand dashboard has demo mode enabled (DEMO_MODE = true in lib/api/auth.ts). Any email/password works for login.

# CreatorX - Content Creator Collaboration App

## Overview
CreatorX is a comprehensive React Native/Expo mobile application for content creators to discover brand collaboration campaigns, manage deliverables, track earnings, and communicate with brands. The app features a premium dark mode design aesthetic inspired by Linear and Stripe.

## Recent Changes
- **January 2026**: Created new splash screen matching Figma design: dark navy gradient background, dark logo box with blue X icon, "CreatorX" branding, animated loading spinner, and version display (v1.0.2)
- **January 2026**: Updated UI design system with new primary color (#1337ec blue), darker backgrounds (#050505), and modernized gradients across all screens
- **January 2026**: Redesigned Explore screen header with "Discover" title, avatar, and notification bell
- **January 2026**: Updated all gradient colors and accent highlights to match new blue color scheme
- **January 2026**: Redesigned auth flow with 3 screens: Splash (branded gradient) -> Welcome (app preview) -> Phone OTP verification
- **January 2026**: Simplified auth flow - removed social connect screen, users now login directly with phone/OTP
- **December 2024**: Added dev preview mode with "Skip for Dev Preview" button on auth screens
- **December 2024**: Added demo OTP credentials display (Phone: Any 10 digits, OTP: 123456)
- **December 2024**: Fixed splash screen timer persistence for development environment using sessionStorage
- **December 2024**: Updated expo-secure-store to version 14.0.1 for Expo compatibility
- **December 2024**: Added marketing profile screen with rate cards and engagement metrics for influencer onboarding
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
- **Framework**: React Native with Expo (Mobile App), Next.js (Brand & Admin Dashboards)
- **Navigation**: Expo Router (file-based routing), Next.js App Router
- **State Management**: React Context API, Zustand (Dashboards)
- **Storage**: AsyncStorage for persistence
- **UI Components**: Custom components with Linear Gradient effects (Mobile), shadcn/ui (Dashboards)
- **Icons**: Feather icons from @expo/vector-icons, Lucide icons (Dashboards)

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
- Background: #050505 (deep black)
- Card Background: #121212
- Primary: #1337ec (blue)
- Glass morphism effects with subtle blue gradients
- Consistent border radius (8-24px)
- Card-based layouts with subtle borders
- Modern minimal aesthetic inspired by Linear

### Brand Dashboard
- Background: #F7F9FC (light gray)
- Primary: #0EA5E9 (sky blue)
- Clean white cards with subtle borders
- Light theme with professional aesthetic
- Navigation: Sidebar with sections (Home, Influencer Discovery, Campaign Management, Settings)

## Key Features

### Mobile App
1. **Splash Screen**: Simple branded splash with gradient background and logo
2. **Welcome Screen**: App preview showcase with "Sign up or Log in" button
3. **Phone OTP Login**: Clean phone verification screen (similar to Cherry app design)
4. **Onboarding Form**: Collect creator profile details for new users
5. **Marketing Profile**: Set commercial rates and engagement metrics for brand matching
6. **Home Dashboard**: Earnings overview, quick stats, active campaigns, quick actions
7. **Explore**: Browse and filter available brand campaigns
8. **Upload**: Submit content deliverables for campaigns
9. **Chat**: Real-time messaging with brands
10. **Wallet**: Track earnings, pending payments, withdrawal history
11. **Profile**: User settings, referral system, KYC verification
12. **Analytics**: Performance metrics, earnings charts, insights
13. **Saved Campaigns**: Bookmark campaigns for later

### Brand Dashboard
1. **Dashboard**: Lifecycle progress, spend/budget health, deliverables status, quick actions
2. **Influencer Discovery**: Search + shortlist + compare creators
3. **Campaigns**: Lifecycle tabs (Draft → Open → In Review → Active → Completed) with inline previews
4. **Deliverables**: SLA-aware queue with bulk review actions
5. **Messages**: Real-time chat with creators
6. **Payments**: Balance summary + filterable transaction history
7. **Settings**: Profile, verification, notifications

### Admin Dashboard
1. **Overview**: Platform-wide stats + Work Queue summary
2. **Work Queue**: KYC, flags, disputes, GDPR with SLA badges
3. **Moderation**: Campaign Flags, Moderation Rules, Campaign Reviews
4. **Compliance**: GDPR Requests, Audit Log, Data Export
5. **Finance**: Reconciliation dashboard + export by last applied filters
6. **Monitoring**: Health metrics + audit visibility
7. **Settings**: System configuration + feature flags

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

### Admin Dashboard
```bash
cd admin-dashboard && npm run dev
```
Runs on port 3002.

## User Preferences
- Dark mode design for mobile app
- Light mode for brand dashboard
- Rupee (₹) currency format
- Mobile-first responsive design
- Smooth animations and transitions

## Demo Mode
Brand and Admin dashboards have demo mode enabled (DEMO_MODE = true in lib/api/auth.ts). Any email/password works for login.

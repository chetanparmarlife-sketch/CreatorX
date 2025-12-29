# CreatorX - Content Creator Collaboration App

## Overview
CreatorX is a comprehensive React Native/Expo mobile application for content creators to discover brand collaboration campaigns, manage deliverables, track earnings, and communicate with brands. The app features a premium dark mode design aesthetic inspired by Linear and Stripe.

## Recent Changes
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
- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context API
- **Storage**: AsyncStorage for persistence
- **UI Components**: Custom components with Linear Gradient effects
- **Icons**: Feather icons from @expo/vector-icons

### Directory Structure
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
│   ├── AnalyticsCard.tsx
│   ├── AuthScreen.tsx      # Login/signup screen with skip option
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   ├── Button.tsx
│   ├── CampaignCard.tsx
│   ├── CampaignDetailModal.tsx
│   ├── ChatItem.tsx
│   ├── EmptyState.tsx
│   ├── GlassCard.tsx
│   ├── Modal.tsx
│   ├── Skeleton.tsx
│   ├── SplashScreen.tsx    # Animated app splash screen
│   ├── StatCard.tsx
│   ├── TransactionItem.tsx
│   └── WithdrawModal.tsx
├── context/            # App context provider
├── hooks/              # Custom React hooks
├── theme/              # Colors, typography, spacing
└── types/              # TypeScript definitions
```

## Design Guidelines
The app follows a premium dark mode aesthetic with:
- Background: #0a0a0a (near black)
- Primary: #8b5cf6 (violet/purple)
- Glass morphism effects with subtle gradients
- Consistent border radius (8-24px)
- Card-based layouts with subtle borders

## Key Features
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

## Running the Project
The app runs using Expo:
```bash
npm run dev
```
This starts both the Metro bundler for mobile and web preview on port 5000.

## User Preferences
- Dark mode design by default
- Rupee (₹) currency format
- Mobile-first responsive design
- Smooth animations and transitions

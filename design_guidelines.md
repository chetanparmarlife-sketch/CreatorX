# CreatorX Design Guidelines

## Design Approach
**Reference-Based**: Drawing from Linear's premium dark UI, Stripe's sophisticated dashboards, and modern creator platforms like Patreon and Ko-fi. Glass morphism with gradient accents creates a premium, app-like experience that positions creators as professionals.

## Typography
- **Primary Font**: Inter (Google Fonts) - all weights
- **Hierarchy**:
  - Hero/Display: text-5xl to text-6xl, font-bold, tracking-tight
  - Section Headers: text-3xl to text-4xl, font-semibold
  - Card Titles: text-xl, font-semibold
  - Body: text-base, font-normal
  - Captions/Metadata: text-sm, text-gray-400

## Layout System
**Spacing Primitives**: Tailwind units of 3, 4, 6, 8, 12, 16, 20, 24
- Mobile padding: px-4, py-6 to py-8
- Section spacing: space-y-8 to space-y-12
- Card padding: p-6
- Component gaps: gap-4 to gap-6

## Core Components

### Navigation
**Top Navigation Bar**: Fixed, backdrop-blur with bg-black/50, border-b border-white/10
- Logo left, notification bell + profile avatar right
- Height: h-16, px-4

**Bottom Tab Bar** (Mobile Primary Navigation):
- Fixed bottom, 5 tabs: Discover, Campaigns, Wallet, Messages, Profile
- Icons with labels, active state: text-violet-500
- Glass effect: backdrop-blur-xl bg-black/80 border-t border-white/10

### Hero Section
**Full-width Image Hero** (100vh on mobile):
- Dynamic creator lifestyle image showing content creation/collaboration
- Gradient overlay: from-black/80 via-black/50 to-transparent
- Centered content: 
  - Platform tagline: "Earn with Your Influence"
  - Subheading highlighting creator economy value
  - Dual CTAs: "Start Creating" (violet-600 with blur-xl backdrop), "Explore Campaigns" (white/10 with blur-xl backdrop)
- Floating stats cards at bottom: Total Payouts, Active Creators, Brand Partners (glass morphism cards with white/5 bg, border white/10)

### Campaign Discovery Cards
**Grid Layout**: grid-cols-1 gap-4
- Glass morphism container: bg-gradient-to-br from-violet-600/20 to-pink-600/10, backdrop-blur, border border-white/10, rounded-2xl
- Brand logo top-left (circular, w-12)
- Campaign title (text-xl font-semibold)
- Budget display: Large text with currency, gradient text from-violet-400 to-pink-400
- Metadata row: Deadline, Category, Engagement required (text-sm icons + text)
- Bottom CTA: "Apply Now" button spanning full width

### Wallet Dashboard
**Hero Balance Card**: 
- Large gradient card bg-gradient-to-br from-violet-600 to-purple-900, p-8, rounded-3xl
- "Available Balance" label
- Massive balance display: text-5xl font-bold
- Secondary stats: Pending, Total Earned (grid-cols-2)
- Action buttons: Withdraw, View History

**Transaction List**:
- Timeline-style cards with glass effect
- Left: Brand logo + campaign name
- Right: Amount (green for credit, text-base)
- Date below in text-sm text-gray-400

### Chat Interface
**Conversation List**:
- Each chat: glass card with brand avatar left, last message preview, timestamp, unread badge (violet-500)

**Message Thread**:
- Received: bg-white/5, left-aligned
- Sent: bg-violet-600/30, right-aligned
- Timestamp beneath each

### Profile Management
**Profile Header**:
- Large circular avatar (w-24), edit icon overlay
- Username, bio, social stats (Followers, Campaigns, Earnings) in grid-cols-3

**Referral Section**:
- Gradient card with referral code (large, monospace font)
- Copy button with violet-600 bg
- Referral stats: Total Referred, Earnings from Referrals

### Deliverables Upload
**Upload Zone**:
- Dashed border card (border-2 border-dashed border-white/20)
- Large upload icon, "Drag files or click to browse"
- Progress bars: bg-white/10 with violet-600 fill

## Image Specifications

**Hero Image**: 
- Professional creator lifestyle shot (filming, photography setup, collaboration)
- High-energy, aspirational
- Must work with dark gradient overlay
- Placement: Full viewport background

**Campaign Cards**: 
- Brand logos (circular, transparent backgrounds)
- Product/campaign reference images (optional secondary)

**Profile**:
- Creator avatar placeholders (circular)
- Social platform icons

## Glass Morphism Implementation
- Background: bg-white/5 to bg-white/10
- Border: border border-white/10
- Backdrop filter: backdrop-blur-xl to backdrop-blur-2xl
- Layer on dark backgrounds (#0a0a0a, #141414)

## Gradient Accents
- Primary gradient: from-violet-600 to-purple-900
- Accent gradient: from-violet-400 via-purple-500 to-pink-500
- Apply to: Primary CTAs, earning badges, feature cards, text highlights

## Key Interactions
- Cards: Subtle scale on tap, smooth 200ms transitions
- CTAs: Active state with slight scale-95
- Navigation: Smooth tab switching with fade transitions
- Modals: Slide up from bottom with backdrop blur

**Critical**: Every section uses consistent glass morphism treatment, violet gradient accents, and maintains premium dark aesthetic throughout. Mobile-first spacing ensures thumb-friendly tap targets (min h-12 for buttons).
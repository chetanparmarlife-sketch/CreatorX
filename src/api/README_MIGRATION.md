# API Migration Quick Start

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install axios
```

### 2. Configure Environment
Create `.env` file:
```env
# The mobile app now reads the real backend from EXPO_PUBLIC_API_URL instead of the old mock base URL variable.
EXPO_PUBLIC_API_URL=YOUR_API_URL_HERE
EXPO_PUBLIC_ENV=dev
```

### 3. Enable Feature Flags
```typescript
import { featureFlags } from '@/src/config/featureFlags';

// Enable campaigns API
await featureFlags.setFlag('USE_API_CAMPAIGNS', true);
```

### 4. Use Migrated AppContext
Replace your AppContext import:
```typescript
// Before
import { useApp } from '@/src/context/AppContext';

// After
import { useApp } from '@/src/context/AppContext.migrated';
```

## 📁 File Structure

```
src/
├── api/
│   ├── adapters/          # Data transformation (backend → app format)
│   ├── hooks/             # Custom hooks for API calls
│   ├── services/          # API service modules
│   ├── utils/             # Cache, transformers
│   ├── client.ts          # Axios client with interceptors
│   ├── types.ts           # TypeScript types
│   └── errorHandler.ts   # Error handling utilities
├── config/
│   └── featureFlags.ts    # Feature flag management
└── context/
    └── AppContext.migrated.tsx  # Updated context with API support
```

## 🎯 Key Features

### Data Adapters
Transform backend responses to match your existing UI:
```typescript
import { adaptCampaign, adaptCampaignsResponse } from '@/src/api/adapters';

const response = await campaignService.getCampaigns();
const { campaigns, hasMore, total } = adaptCampaignsResponse(response);
```

### Feature Flags
Toggle between mock and real API:
```typescript
if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
  // Use real API
} else {
  // Use mock data
}
```

### Error Handling
Automatic error handling with user-friendly messages:
```typescript
import { handleApiError } from '@/src/api/errorHandler';

try {
  await campaignService.getCampaigns();
} catch (error) {
  handleApiError(error); // Shows alert automatically
}
```

### Loading States
Built-in loading and error states:
```typescript
const { campaigns, isLoading, error, refreshData } = useApp();

if (isLoading) return <Skeleton />;
if (error) return <ErrorView message={error} />;
```

## 📖 Example: Explore Screen

See `app/(tabs)/explore.migrated.tsx` for a complete example with:
- Loading states
- Error handling
- Pull-to-refresh
- Infinite scroll (pagination)
- Offline support

## 🔄 Migration Phases

1. **Phase 1**: Authentication (login/register)
2. **Phase 2**: Campaigns (read-only)
3. **Phase 3**: Applications (write)
4. **Phase 4**: Deliverables & Wallet
5. **Phase 5**: Messaging & Notifications

See `MIGRATION_STRATEGY.md` for detailed steps.

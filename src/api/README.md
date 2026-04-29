# CreatorX API Integration

This directory contains the API client and service modules for connecting the React Native app to the Spring Boot backend.

## Structure

```
src/api/
├── client.ts              # Axios client with interceptors
├── types.ts               # TypeScript types matching backend OpenAPI spec
├── services/              # API service modules
│   ├── authService.ts
│   ├── campaignService.ts
│   ├── applicationService.ts
│   ├── deliverableService.ts
│   ├── walletService.ts
│   ├── kycService.ts
│   ├── messagingService.ts
│   ├── notificationService.ts
│   ├── profileService.ts
│   ├── referralService.ts
│   └── index.ts
├── utils/
│   ├── cache.ts           # Cache utilities for offline support
│   └── transformers.ts    # Transform backend types to app types
└── index.ts               # Main exports
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install axios
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Set `EXPO_PUBLIC_API_URL` to your backend URL so the app uses the real backend instead of legacy mock configuration
   - Set `EXPO_PUBLIC_ENV` to `dev`, `staging`, or `prod`

3. **Update AppContext:**
   - Gradually migrate functions from `AppContext.tsx` to use API services
   - See `AppContext.api.tsx` for reference implementation

## Features

### API Client (`client.ts`)
- ✅ JWT token interceptor (auto-attach from AsyncStorage)
- ✅ Refresh token logic (auto-refresh on 401)
- ✅ Request/response logging (dev mode)
- ✅ Typed error handling
- ✅ File upload support (multipart/form-data)

### Service Modules
Each service module provides typed methods for API operations:
- `authService` - Authentication (login, register, refresh, logout)
- `campaignService` - Campaign operations (list, get, save, active campaigns)
- `applicationService` - Application management (submit, list, withdraw)
- `deliverableService` - Deliverable operations (submit, resubmit, history)
- `walletService` - Wallet and transactions (balance, transactions, withdrawal)
- `kycService` - KYC document submission and status
- `messagingService` - Conversations and messages
- `notificationService` - Notifications (list, mark read, unread count)
- `profileService` - User profile management
- `referralService` - Referral code and stats

### Offline-First Support
- Responses are cached in AsyncStorage
- Cache TTL: 24 hours (configurable)
- Falls back to cached data on network errors
- Optimistic updates for better UX

### Type Transformers
The `transformers.ts` utility converts backend API types to frontend app types:
- Maps backend enums to frontend enums
- Formats dates and amounts
- Transforms nested structures

## Usage Example

```typescript
import { campaignService } from '@/src/api/services';
import { transformCampaign } from '@/src/api/utils/transformers';

// Fetch campaigns
const response = await campaignService.getCampaigns({
  category: 'Fashion',
  platform: 'INSTAGRAM',
  page: 0,
  size: 20,
});

// Transform to app format
const campaigns = response.items.map(transformCampaign);
```

## Migration Guide

### Step 1: Replace Mock Data with API Calls

**Before:**
```typescript
const campaigns = defaultCampaigns;
```

**After:**
```typescript
const [campaigns, setCampaigns] = useState<Campaign[]>([]);

useEffect(() => {
  const loadCampaigns = async () => {
    try {
      const response = await campaignService.getCampaigns();
      const transformed = response.items.map(transformCampaign);
      setCampaigns(transformed);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };
  loadCampaigns();
}, []);
```

### Step 2: Add Loading and Error States

```typescript
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### Step 3: Implement Optimistic Updates

For better UX, update local state immediately, then sync with API:

```typescript
const saveCampaign = async (campaignId: string) => {
  // Optimistic update
  setSavedCampaigns([...savedCampaigns, campaignId]);
  
  try {
    await campaignService.saveCampaign(campaignId);
  } catch (error) {
    // Rollback on error
    setSavedCampaigns(savedCampaigns.filter(id => id !== campaignId));
    throw error;
  }
};
```

### Step 4: Add Offline Support

Use cache utilities to store responses:

```typescript
import { cacheUtils } from '@/src/api/utils/cache';

// Cache response
await cacheUtils.set('campaigns', campaigns);

// Retrieve from cache
const cached = await cacheUtils.get<Campaign[]>('campaigns');
```

## Error Handling

All API errors are typed as `ApiError`:

```typescript
try {
  await campaignService.getCampaigns();
} catch (error) {
  const apiError = error as ApiError;
  console.error('Status:', apiError.status);
  console.error('Message:', apiError.message);
  console.error('Details:', apiError.details);
}
```

## Authentication

The API client automatically:
1. Attaches JWT token from AsyncStorage to requests
2. Refreshes token on 401 errors
3. Clears tokens on refresh failure
4. Queues requests during token refresh

## File Uploads

For file uploads (deliverables, KYC, avatar):

```typescript
const formData = new FormData();
formData.append('file', {
  uri: file.uri,
  type: 'image/jpeg',
  name: 'photo.jpg',
} as any);

await deliverableService.submitDeliverable(deliverableId, {
  file: {
    uri: file.uri,
    type: 'image/jpeg',
    name: 'photo.jpg',
  },
});
```

## Testing

To test with mock backend:
1. Set `EXPO_PUBLIC_API_URL` to your local backend so the API client does not fall back to mock data
2. Ensure backend is running on the specified port
3. Use dev tools to inspect network requests

## Next Steps

1. Gradually migrate AppContext functions to use API services
2. Add retry logic for failed requests
3. Implement background sync for offline changes
4. Add request cancellation for component unmounts
5. Implement pagination for large lists

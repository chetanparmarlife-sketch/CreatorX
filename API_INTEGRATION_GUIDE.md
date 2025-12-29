# API Integration Guide for CreatorX React Native App

This guide explains how to integrate the Spring Boot backend API with your React Native Expo app.

## 📦 What's Been Created

### 1. API Client (`src/api/client.ts`)
- ✅ Axios instance with base URL configuration
- ✅ JWT token interceptor (auto-attaches token from AsyncStorage)
- ✅ Automatic token refresh on 401 errors
- ✅ Request/response logging (dev mode only)
- ✅ Typed error handling with `ApiError` interface

### 2. API Service Modules (`src/api/services/`)
All service modules are ready to use:
- `authService` - Login, register, refresh token, logout
- `campaignService` - Get campaigns, save/unsave, active campaigns
- `applicationService` - Submit, list, withdraw applications
- `deliverableService` - Submit deliverables, get history
- `walletService` - Wallet balance, transactions, withdrawals
- `kycService` - KYC document submission and status
- `messagingService` - Conversations, messages, mark read
- `notificationService` - Notifications, mark read, unread count
- `profileService` - Profile management, avatar upload, portfolio
- `referralService` - Referral code and statistics

### 3. Type Definitions (`src/api/types.ts`)
Complete TypeScript interfaces matching the backend OpenAPI specification:
- Request/Response types for all endpoints
- Paginated response types
- Error response types
- All enums (CampaignStatus, ApplicationStatus, etc.)

### 4. Utility Functions
- **Cache Utils** (`src/api/utils/cache.ts`) - Offline-first caching
- **Transformers** (`src/api/utils/transformers.ts`) - Convert backend types to app types

### 5. Environment Configuration (`src/config/env.ts`)
- Supports dev/staging/prod environments
- Configurable via `.env` file or environment variables

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install axios
```

### Step 2: Configure Environment

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_ENV=dev
```

For production:
```env
EXPO_PUBLIC_API_BASE_URL=https://api.creatorx.com/api/v1
EXPO_PUBLIC_ENV=prod
```

### Step 3: Update AppContext

You have two options:

#### Option A: Gradual Migration (Recommended)
Keep your existing `AppContext.tsx` and gradually replace mock data functions with API calls.

#### Option B: Full Migration
Replace `AppContext.tsx` with the updated version in `AppContext.api.tsx` (reference implementation).

## 📝 Migration Examples

### Example 1: Loading Campaigns

**Before (Mock Data):**
```typescript
const [campaigns, setCampaigns] = useState<Campaign[]>(defaultCampaigns);
```

**After (API Integration):**
```typescript
import { campaignService } from '@/src/api/services';
import { transformCampaign } from '@/src/api/utils/transformers';
import { cacheUtils } from '@/src/api/utils/cache';

const [campaigns, setCampaigns] = useState<Campaign[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      // Try cache first
      const cached = await cacheUtils.get<Campaign[]>('campaigns');
      if (cached) {
        setCampaigns(cached);
        setIsLoading(false);
      }

      // Fetch from API
      const response = await campaignService.getCampaigns({ page: 0, size: 50 });
      const transformed = response.items.map(transformCampaign);
      setCampaigns(transformed);
      
      // Cache for offline access
      await cacheUtils.set('campaigns', transformed);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      // Keep cached data if available
    } finally {
      setIsLoading(false);
    }
  };

  loadCampaigns();
}, []);
```

### Example 2: Submitting Application

**Before (Mock):**
```typescript
const applyCampaign = (campaignId: string, applicationData: ApplicationFormData) => {
  // Update local state
  const newApplication = { ...applicationData, id: Date.now().toString() };
  setApplications([...applications, newApplication]);
};
```

**After (API Integration):**
```typescript
import { applicationService } from '@/src/api/services';
import { transformApplication } from '@/src/api/utils/transformers';

const applyCampaign = async (campaignId: string, applicationData: ApplicationFormData) => {
  try {
    // Optimistic update
    const tempApplication: CampaignApplication = {
      id: 'temp-' + Date.now(),
      campaignId,
      creatorId: user.id,
      pitch: applicationData.pitch,
      expectedTimeline: applicationData.expectedTimeline,
      status: 'pending_review',
      submittedAt: new Date().toISOString(),
    };
    setApplications(prev => [...prev, tempApplication]);

    // API call
    const response = await applicationService.submitApplication({
      campaignId,
      pitchText: applicationData.pitch,
      expectedTimeline: applicationData.expectedTimeline,
    });

    // Replace temp with real data
    const transformed = transformApplication(response);
    setApplications(prev => 
      prev.map(app => app.id === tempApplication.id ? transformed : app)
    );
  } catch (error) {
    // Rollback on error
    setApplications(prev => prev.filter(app => app.id !== tempApplication.id));
    throw error;
  }
};
```

### Example 3: Submitting Deliverable (File Upload)

**Before (Mock):**
```typescript
const submitDeliverable = (activeCampaignId: string, deliverableId: string, file: File) => {
  // Update local state
  updateDeliverable(deliverableId, { status: 'brand_reviewing', submittedFile: file });
};
```

**After (API Integration):**
```typescript
import { deliverableService } from '@/src/api/services';

const submitDeliverable = async (
  activeCampaignId: string,
  deliverableId: string,
  file: { name: string; type: 'video' | 'image'; uri: string }
) => {
  try {
    // Optimistic update
    updateDeliverable(deliverableId, { 
      status: 'brand_reviewing',
      submittedFile: { name: file.name, type: file.type, uri: file.uri }
    });

    // Determine MIME type
    const mimeType = file.type === 'video' ? 'video/mp4' : 'image/jpeg';

    // API call
    await deliverableService.submitDeliverable(deliverableId, {
      file: {
        uri: file.uri,
        type: mimeType,
        name: file.name,
      },
    });
  } catch (error) {
    // Rollback on error
    updateDeliverable(deliverableId, { status: 'pending' });
    throw error;
  }
};
```

## 🔄 Offline-First Strategy

The API integration supports offline-first with these features:

1. **Caching**: All API responses are cached in AsyncStorage
2. **Cache TTL**: 24 hours (configurable)
3. **Fallback**: On network errors, use cached data
4. **Optimistic Updates**: Update UI immediately, sync in background

### Cache Usage

```typescript
import { cacheUtils } from '@/src/api/utils/cache';

// Store response
await cacheUtils.set('campaigns', campaigns, 24 * 60 * 60 * 1000); // 24 hours

// Retrieve from cache
const cached = await cacheUtils.get<Campaign[]>('campaigns');

// Clear cache
await cacheUtils.remove('campaigns');
```

## 🔐 Authentication Flow

The API client handles authentication automatically:

1. **Login/Register**: Tokens stored in AsyncStorage
2. **Request Interceptor**: Automatically attaches JWT token
3. **401 Response**: Automatically refreshes token
4. **Refresh Failure**: Clears tokens and can trigger logout

### Manual Token Management

```typescript
import { authService } from '@/src/api/services';

// Check if authenticated
const isAuth = await authService.isAuthenticated();

// Get tokens
const accessToken = await authService.getAccessToken();
const refreshToken = await authService.getRefreshToken();

// Logout
await authService.logout();
```

## 📊 Type Transformers

Backend API types are automatically transformed to match your app's types:

```typescript
import { transformCampaign, transformWallet, transformTransaction } from '@/src/api/utils/transformers';

// Transform API response to app format
const campaign = transformCampaign(apiCampaign);
const wallet = transformWallet(apiWallet);
const transaction = transformTransaction(apiTransaction);
```

Transformations include:
- Enum mapping (e.g., `DRAFT` → `open`)
- Date formatting (e.g., ISO string → "2h ago")
- Amount formatting (e.g., `15000` → `"₹15K"`)
- Status mapping

## 🎯 Best Practices

### 1. Error Handling

Always wrap API calls in try-catch:

```typescript
try {
  const campaigns = await campaignService.getCampaigns();
} catch (error) {
  const apiError = error as ApiError;
  // Show user-friendly error message
  Alert.alert('Error', apiError.message);
}
```

### 2. Loading States

Show loading indicators during API calls:

```typescript
const [isLoading, setIsLoading] = useState(false);

const loadData = async () => {
  setIsLoading(true);
  try {
    const data = await campaignService.getCampaigns();
    setCampaigns(data.items);
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Optimistic Updates

Update UI immediately, then sync with API:

```typescript
// Update UI first
setSavedCampaigns([...savedCampaigns, campaignId]);

try {
  await campaignService.saveCampaign(campaignId);
} catch (error) {
  // Rollback on error
  setSavedCampaigns(savedCampaigns.filter(id => id !== campaignId));
}
```

### 4. Pagination

Use pagination for large lists:

```typescript
const [page, setPage] = useState(0);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  if (!hasMore) return;
  
  const response = await campaignService.getCampaigns({ page, size: 20 });
  setCampaigns(prev => [...prev, ...response.items.map(transformCampaign)]);
  setHasMore(response.items.length === 20);
  setPage(prev => prev + 1);
};
```

## 🧪 Testing

### Local Development

1. Start your Spring Boot backend:
   ```bash
   cd backend
   ./gradlew bootRun
   ```

2. Update `.env`:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
   ```

3. Test API calls in your app

### Network Debugging

Enable request/response logging in dev mode (already enabled in `client.ts`):
- All requests/responses are logged to console in `__DEV__` mode
- Check Network tab in React Native Debugger

## 📚 API Documentation

Full API documentation is available in:
- `backend/openapi-auth.yaml`
- `backend/openapi-campaigns.yaml`
- `backend/openapi-applications.yaml`
- `backend/openapi-wallet-kyc.yaml`
- `backend/openapi-messaging.yaml`
- `backend/openapi-profile.yaml`

Or view in Swagger UI when backend is running:
- `http://localhost:8080/swagger-ui.html`

## 🔧 Troubleshooting

### Issue: "Network request failed"
- Check if backend is running
- Verify `EXPO_PUBLIC_API_BASE_URL` in `.env`
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For iOS simulator, `localhost` works fine

### Issue: "401 Unauthorized"
- Token might be expired
- Check if refresh token logic is working
- Verify token is stored in AsyncStorage

### Issue: "CORS errors"
- Ensure backend CORS is configured for your app's origin
- Check `SecurityConfig.java` in backend

### Issue: Type errors
- Ensure all imports use `@/src/api/types`
- Check that transformers are used for type conversion
- Verify TypeScript config includes proper libs

## 📝 Next Steps

1. ✅ Install axios: `npm install axios`
2. ✅ Create `.env` file with API URL
3. 🔄 Gradually migrate AppContext functions
4. 🔄 Add error boundaries for API errors
5. 🔄 Implement retry logic for failed requests
6. 🔄 Add background sync for offline changes
7. 🔄 Implement request cancellation

## 📞 Support

For issues or questions:
- Check API documentation in `src/api/README.md`
- Review backend OpenAPI specs
- Check console logs for detailed error messages


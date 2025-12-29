# CreatorX API Client Documentation

Complete API client implementation for the CreatorX React Native app connecting to the Spring Boot backend.

## Overview

The API client provides a complete, type-safe interface to interact with the CreatorX Spring Boot backend. It includes:

- **JWT Authentication** with automatic token refresh
- **Request/Response Interceptors** for error handling
- **Type-safe Service Modules** for all backend endpoints
- **Comprehensive Error Handling** with user-friendly messages
- **File Upload Support** with progress tracking

## Architecture

```
src/api/
├── client.ts              # Core Axios client with interceptors
├── errors.ts              # Error handling utilities
├── errorHandler.ts       # UI error handling (alerts, navigation)
├── types.ts              # TypeScript types matching backend DTOs
├── services/             # Service modules for each domain
│   ├── authService.ts
│   ├── campaignService.ts
│   ├── applicationService.ts
│   ├── deliverableService.ts
│   ├── walletService.ts
│   ├── messagingService.ts
│   ├── notificationService.ts
│   ├── profileService.ts
│   ├── kycService.ts
│   └── storageService.ts
└── index.ts              # Service exports
```

## Core API Client

### Location: `src/api/client.ts`

The core API client (`apiClient`) is a singleton Axios instance with:

#### Features

1. **Automatic JWT Token Attachment**
   - Attaches `Authorization: Bearer <token>` header to all requests
   - Skips token for public endpoints (register, login, etc.)

2. **Token Refresh on 401**
   - Automatically refreshes access token when expired
   - Queues failed requests and retries after refresh
   - Clears auth and redirects to login if refresh fails

3. **Request/Response Logging**
   - Logs all requests/responses in development mode
   - Helps with debugging

4. **Error Transformation**
   - Converts Axios errors to structured `ApiError` objects
   - Provides consistent error format across the app

#### Usage

```typescript
import { apiClient } from '@/src/api/client';

// GET request
const campaigns = await apiClient.get<Campaign[]>('/campaigns');

// POST request
const application = await apiClient.post<Application>('/applications', data);

// PUT request
const profile = await apiClient.put<UserProfile>('/profile', updates);

// DELETE request
await apiClient.delete(`/applications/${id}`);

// File upload
const formData = new FormData();
formData.append('file', { uri, type, name });
const response = await apiClient.postFormData<FileUploadResponse>('/storage/upload', formData);
```

## Authentication Flow

### Token Refresh Mechanism

```typescript
// 1. Request fails with 401
// 2. Client checks if refresh is in progress
// 3. If yes, queues request
// 4. If no, starts refresh:
//    - Gets refreshToken from AsyncStorage
//    - Calls POST /auth/refresh with refreshToken
//    - Stores new accessToken (and refreshToken if provided)
//    - Retries original request with new token
//    - Processes queued requests
// 5. If refresh fails, clears auth and redirects to login
```

### Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/verify-otp` - Verify OTP for password reset

## Service Modules

### Auth Service (`authService.ts`)

```typescript
import { authService } from '@/src/api/services';

// Register
const response = await authService.register({
  email: 'user@example.com',
  password: 'SecurePass123!',
  role: 'CREATOR',
  name: 'John Doe',
});

// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'SecurePass123!',
});

// Check authentication
const isAuth = await authService.isAuthenticated();
```

### Campaign Service (`campaignService.ts`)

```typescript
import { campaignService } from '@/src/api/services';

// Get campaigns with filters
const campaigns = await campaignService.getCampaigns({
  category: 'Fashion',
  platform: 'INSTAGRAM',
  page: 0,
  size: 20,
});

// Get campaign details
const campaign = await campaignService.getCampaignById('123');

// Save/unsave campaign
await campaignService.saveCampaign('123');
await campaignService.unsaveCampaign('123');

// Get saved campaigns
const saved = await campaignService.getSavedCampaigns();
```

### Application Service (`applicationService.ts`)

```typescript
import { applicationService } from '@/src/api/services';

// Submit application
const application = await applicationService.submitApplication({
  campaignId: '123',
  pitchText: 'I would love to work on this campaign...',
  expectedTimeline: '2 weeks',
});

// Get applications
const applications = await applicationService.getApplications(0, 20);

// Withdraw application
await applicationService.withdrawApplication('456');
```

### Wallet Service (`walletService.ts`)

```typescript
import { walletService } from '@/src/api/services';

// Get wallet balance
const wallet = await walletService.getWallet();

// Get transactions
const transactions = await walletService.getTransactions(0, 20);

// Request withdrawal
const withdrawal = await walletService.withdrawFunds({
  amount: 5000,
  bankAccountId: '789',
});

// Manage bank accounts
const accounts = await walletService.getBankAccounts();
const newAccount = await walletService.addBankAccount({
  accountHolderName: 'John Doe',
  accountNumber: '1234567890',
  ifscCode: 'SBIN0001234',
});
```

### Messaging Service (`messagingService.ts`)

```typescript
import { messagingService } from '@/src/api/services';

// Get conversations
const conversations = await messagingService.getConversations();

// Get messages
const messages = await messagingService.getMessages('conv-123', 0, 50);

// Send message (REST fallback - WebSocket preferred)
const message = await messagingService.sendMessage('conv-123', 'Hello!');

// Mark as read
await messagingService.markConversationRead('conv-123');

// Get unread count
const count = await messagingService.getUnreadCount();
```

### Profile Service (`profileService.ts`)

```typescript
import { profileService } from '@/src/api/services';

// Get profile
const profile = await profileService.getProfile();

// Update profile
const updated = await profileService.updateProfile({
  fullName: 'John Doe',
  bio: 'Content creator',
});

// Upload avatar
const { avatarUrl } = await profileService.uploadAvatar({
  uri: 'file://...',
  type: 'image/jpeg',
  name: 'avatar.jpg',
});

// Portfolio management
const portfolio = await profileService.getPortfolio();
const item = await profileService.addPortfolioItem({
  title: 'Campaign Work',
  description: 'Great results',
  file: { uri: 'file://...', type: 'image/jpeg', name: 'work.jpg' },
});
```

### Storage Service (`storageService.ts`)

```typescript
import { storageService } from '@/src/api/services';

// Upload file with progress
const upload = await storageService.uploadFile(
  'file://path/to/file.jpg',
  'avatar',
  {},
  (progress) => console.log(`Upload: ${progress}%`)
);

// Upload avatar
const avatar = await storageService.uploadAvatar('file://...', (progress) => {
  console.log(`Avatar upload: ${progress}%`);
});

// Upload KYC document
const kyc = await storageService.uploadKYCDocument(
  'file://...',
  'AADHAAR',
  (progress) => console.log(`KYC upload: ${progress}%`)
);

// Generate signed URL
const { signedUrl } = await storageService.generateSignedUrl(
  'https://...',
  3600 // expires in 1 hour
);
```

## Error Handling

### APIError Class

```typescript
import { APIError, handleAPIError } from '@/src/api/errors';

try {
  await campaignService.getCampaigns();
} catch (error) {
  const apiError = handleAPIError(error);
  console.error('Status:', apiError.status);
  console.error('Message:', apiError.message);
  console.error('Code:', apiError.code);
}
```

### Error Utilities

```typescript
import { isNetworkError, isAuthError, getErrorMessage } from '@/src/api/errors';

if (isNetworkError(error)) {
  // Handle network error
}

if (isAuthError(error)) {
  // Handle auth error (401/403)
}

const message = getErrorMessage(error); // User-friendly message
```

### UI Error Handling

```typescript
import { handleApiError } from '@/src/api/errorHandler';

try {
  await campaignService.getCampaigns();
} catch (error) {
  handleApiError(error, {
    showAlert: true,        // Show alert to user
    redirectToLogin: true,  // Redirect on 401
    onError: (apiError) => {
      // Custom error handling
    },
  });
}
```

## Type Definitions

All types are defined in `src/api/types.ts` and match the backend DTOs:

- `Campaign` - Campaign entity
- `Application` - Application entity
- `Wallet` - Wallet balance
- `Transaction` - Transaction history
- `Message` - Chat message
- `Conversation` - Chat conversation
- `Notification` - Push notification
- `UserProfile` - User profile
- `KYCDocument` - KYC document
- `PaginatedResponse<T>` - Paginated API responses

## Environment Configuration

The API client uses environment variables from `src/config/env.ts`:

```typescript
// .env.local
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws
```

The client automatically:
- Uses `localhost:8080` in development
- Uses environment variable if set
- Falls back to production URL in production builds

## Best Practices

### 1. Always Use Service Modules

❌ **Don't:**
```typescript
const response = await apiClient.get('/campaigns');
```

✅ **Do:**
```typescript
const campaigns = await campaignService.getCampaigns();
```

### 2. Handle Errors Properly

❌ **Don't:**
```typescript
try {
  await campaignService.getCampaigns();
} catch (error) {
  console.error(error);
}
```

✅ **Do:**
```typescript
try {
  await campaignService.getCampaigns();
} catch (error) {
  const apiError = handleAPIError(error);
  if (isNetworkError(apiError)) {
    // Show offline message
  } else {
    handleApiError(error, { showAlert: true });
  }
}
```

### 3. Use TypeScript Types

✅ **Do:**
```typescript
import { Campaign, Application } from '@/src/api/types';

const campaigns: Campaign[] = await campaignService.getCampaigns();
```

### 4. Handle Loading States

✅ **Do:**
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<APIError | null>(null);

try {
  setLoading(true);
  setError(null);
  const data = await campaignService.getCampaigns();
} catch (err) {
  setError(handleAPIError(err));
} finally {
  setLoading(false);
}
```

## Testing

### Mock API Client for Testing

```typescript
// In your test setup
jest.mock('@/src/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    // ... other methods
  },
}));
```

## Troubleshooting

### Token Refresh Not Working

- Check that `refreshToken` is stored in AsyncStorage
- Verify backend `/auth/refresh` endpoint is working
- Check network requests in browser DevTools

### CORS Errors

- Ensure backend CORS is configured for your domain
- Check `EXPO_PUBLIC_API_BASE_URL` is correct
- For physical devices, use IP address instead of localhost

### Network Errors

- Check backend is running: `curl http://localhost:8080/actuator/health`
- Verify network connectivity
- Check firewall settings

## Summary

The API client provides:

✅ **Complete Backend Integration** - All endpoints covered
✅ **Type Safety** - Full TypeScript support
✅ **Automatic Token Refresh** - Seamless authentication
✅ **Error Handling** - User-friendly error messages
✅ **File Uploads** - With progress tracking
✅ **Service Modules** - Organized by domain
✅ **Production Ready** - Error handling, logging, retries

All services are ready to use and fully integrated with the Spring Boot backend!



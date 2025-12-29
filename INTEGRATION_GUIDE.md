# CreatorX React Native Backend Integration Guide

## Overview

This guide documents the complete integration of the CreatorX React Native app with the Spring Boot backend services.

## Architecture

### API Client (`src/api/client.ts`)
- Axios-based HTTP client with JWT interceptors
- Automatic token refresh on 401 errors
- Request/response logging in development
- Error handling and retry logic

### Service Modules (`src/api/services/`)
All service modules follow a consistent pattern:
- Type-safe API calls
- Error handling
- Pagination support
- File upload support (FormData)

**Available Services:**
- `authService.ts` - Authentication (Supabase)
- `campaignService.ts` - Campaign CRUD, search, filters
- `applicationService.ts` - Application submission and management
- `deliverableService.ts` - Deliverable submission and review
- `walletService.ts` - Wallet balance, transactions, withdrawals
- `messagingService.ts` - Conversations and messages (REST fallback)
- `notificationService.ts` - In-app notifications
- `profileService.ts` - User, creator, and brand profiles
- `kycService.ts` - KYC document submission

### Data Adapters (`src/api/adapters/`)
Transform backend API responses to match existing app types:
- `adaptCampaign()` - Campaign transformation
- `adaptApplication()` - Application transformation
- `adaptTransaction()` - Transaction transformation
- `adaptWallet()` - Wallet transformation
- `adaptNotification()` - Notification transformation
- `adaptConversationToChatPreview()` - Conversation to chat preview

### AppContext (`src/context/AppContext.tsx`)
- Feature flags for gradual migration
- Caching strategy (AsyncStorage)
- Loading states
- Error handling
- Offline support

### WebSocket Service (`src/lib/websocket.ts`)
- STOMP over WebSocket
- Real-time messaging
- Auto-reconnection
- Message queuing

## Environment Configuration

### Development (`.env.development`)
```env
EXPO_PUBLIC_ENV=dev
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
EXPO_PUBLIC_WS_URL=ws://localhost:8080/ws
```

### Production (`.env.production`)
```env
EXPO_PUBLIC_ENV=prod
EXPO_PUBLIC_API_BASE_URL=https://api.creatorx.com/api/v1
EXPO_PUBLIC_WS_URL=wss://api.creatorx.com/ws
```

## Feature Flags

Feature flags allow gradual migration from mock to real API:

```typescript
import { featureFlags } from '@/src/config/featureFlags';

// Enable API for campaigns
await featureFlags.setFlag('USE_API_CAMPAIGNS', true);

// Check if feature is enabled
if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
  // Use real API
} else {
  // Use mock data
}
```

**Available Flags:**
- `USE_API_AUTH` - Authentication
- `USE_API_CAMPAIGNS` - Campaigns
- `USE_API_APPLICATIONS` - Applications
- `USE_API_DELIVERABLES` - Deliverables
- `USE_API_WALLET` - Wallet
- `USE_API_MESSAGING` - Messaging
- `USE_API_NOTIFICATIONS` - Notifications
- `USE_API_PROFILE` - Profile

## Integration Checklist

### ✅ Completed
- [x] API client with JWT interceptors
- [x] All service modules created
- [x] Data adapters for type transformation
- [x] Feature flags system
- [x] Environment configuration
- [x] WebSocket service
- [x] Error handling utilities

### 🔄 In Progress
- [ ] AppContext full integration
- [ ] Screen updates (Explore, Wallet, Chat, Profile)
- [ ] Push notifications setup
- [ ] Offline mode testing

### 📋 Pending
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Error boundary implementation
- [ ] Analytics integration

## Usage Examples

### Fetching Campaigns
```typescript
import { campaignService } from '@/src/api/services';
import { useApp } from '@/src/context';

const { campaigns, fetchCampaigns, isLoading } = useApp();

useEffect(() => {
  fetchCampaigns({ category: 'FASHION', page: 0 });
}, []);
```

### Submitting Application
```typescript
import { applicationService } from '@/src/api/services';

const submitApplication = async (campaignId: string, pitch: string) => {
  try {
    await applicationService.submitApplication({
      campaignId,
      pitchText: pitch,
      expectedTimeline: '2 weeks',
    });
    // Show success message
  } catch (error) {
    // Handle error
  }
};
```

### WebSocket Messaging
```typescript
import { connectWebSocket, subscribeToMessages, sendMessage } from '@/src/lib/websocket';

// Connect on app launch
await connectWebSocket(
  () => console.log('Connected'),
  () => console.log('Disconnected'),
  (error) => console.error('Error:', error)
);

// Subscribe to messages
subscribeToMessages(userId, {
  onMessage: (message) => {
    // Update UI with new message
  },
  onError: (error) => {
    // Handle error
  },
});

// Send message
sendMessage(conversationId, 'Hello!');
```

## Error Handling

### Network Errors
```typescript
import { isNetworkError, handleApiError } from '@/src/api/errorHandler';

try {
  await campaignService.getCampaigns();
} catch (error) {
  if (isNetworkError(error)) {
    // Show offline message, use cached data
  } else {
    handleApiError(error);
  }
}
```

### 401 Unauthorized
The API client automatically handles token refresh. If refresh fails, tokens are cleared and user is redirected to login.

### 500 Server Errors
Server errors are caught and displayed to the user with a retry option.

## Testing

### Manual Testing Checklist
1. **Authentication Flow**
   - [ ] Register new user
   - [ ] Login with existing user
   - [ ] Token refresh on expiry
   - [ ] Logout clears session

2. **Campaign Discovery**
   - [ ] Fetch campaigns with filters
   - [ ] Pagination works
   - [ ] Search functionality
   - [ ] Save/unsave campaigns

3. **Application Submission**
   - [ ] Submit application
   - [ ] View application status
   - [ ] Withdraw application

4. **Wallet**
   - [ ] View balance
   - [ ] View transactions
   - [ ] Request withdrawal

5. **Messaging**
   - [ ] WebSocket connection
   - [ ] Send/receive messages
   - [ ] Mark as read
   - [ ] Unread count

6. **Notifications**
   - [ ] Receive notifications
   - [ ] Mark as read
   - [ ] Push notifications (if configured)

## Troubleshooting

### WebSocket Connection Issues
- Check WS_URL in environment config
- Verify JWT token is valid
- Check network connectivity
- Review backend WebSocket logs

### API 401 Errors
- Verify token is stored in AsyncStorage
- Check token expiry
- Verify Supabase session is active

### CORS Issues (Development)
- Ensure backend CORS is configured for React Native
- Check API_BASE_URL matches backend URL

## Next Steps

1. Enable feature flags one by one
2. Test each feature thoroughly
3. Monitor error logs
4. Optimize performance
5. Add analytics tracking


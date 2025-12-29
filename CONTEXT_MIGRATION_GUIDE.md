# AppContext Migration Guide

Complete guide for migrating from mock data to real API integration in the CreatorX AppContext.

## Overview

The AppContext has been migrated to use real API calls while maintaining **100% backward compatibility** with existing screens. All screens continue to work without any changes.

## Migration Status

✅ **Completed**: `src/context/AppContext.api.tsx` - Full API integration
✅ **Feature Flags**: Toggle between mock and real API per feature
✅ **Loading States**: All operations have loading indicators
✅ **Error Handling**: Comprehensive error handling with user feedback
✅ **Offline Support**: Caching with AsyncStorage for offline access
✅ **Optimistic Updates**: Instant UI feedback with automatic rollback

## Key Features

### 1. Feature Flags

Toggle between mock and real API using feature flags:

```typescript
import { featureFlags } from '@/src/config/featureFlags';

// Enable real API for campaigns
await featureFlags.setFlag('USE_API_CAMPAIGNS', true);

// Enable real API for wallet
await featureFlags.setFlag('USE_API_WALLET', true);
```

**Default**: All flags are `false` (using mock data)

### 2. Loading States

All operations expose loading states:

```typescript
const {
  loadingCampaigns,
  loadingApplications,
  loadingWallet,
  loadingTransactions,
  loadingNotifications,
  loadingChats,
} = useApp();
```

### 3. Error Handling

Errors are automatically handled and displayed:

```typescript
const { error, fetchCampaigns } = useApp();

// Error is automatically set on failure
// Use ErrorView component to display
<ErrorView error={error} onRetry={() => fetchCampaigns()} />
```

### 4. Offline Support

Data is automatically cached and loaded when offline:

- Campaigns cached on successful fetch
- Wallet cached on successful fetch
- Notifications cached on successful fetch
- Automatically falls back to cache on network errors

### 5. Optimistic Updates

Instant UI feedback with automatic rollback:

```typescript
// Save campaign - UI updates immediately
await saveCampaign('123');

// If API call fails, UI automatically reverts
// Error is shown to user
```

## Updated AppContext Interface

### New Properties

```typescript
interface AppContextType {
  // Loading states
  loadingCampaigns: boolean;
  loadingApplications: boolean;
  loadingWallet: boolean;
  loadingTransactions: boolean;
  loadingNotifications: boolean;
  loadingChats: boolean;

  // Error state
  error: string | null;

  // Pagination
  campaignsHasMore: boolean;
  campaignsTotal: number;

  // New methods
  fetchCampaigns: (filters?: CampaignFilters, reset?: boolean) => Promise<void>;
  loadMoreCampaigns: () => Promise<void>;
  fetchApplications: () => Promise<void>;
  fetchWallet: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchConversations: () => Promise<void>;
  requestWithdrawal: (amount: number, bankAccountId: string) => Promise<void>;
}
```

### Backward Compatible Methods

All existing methods still work:

- `saveCampaign()` - Now uses API (with optimistic update)
- `unsaveCampaign()` - Now uses API (with optimistic update)
- `applyCampaign()` - Now uses API
- `sendMessage()` - Now uses API
- `markNotificationRead()` - Now uses API
- All other methods maintain backward compatibility

## Usage Examples

### Example 1: Explore Screen with Loading

```typescript
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useApp } from '@/src/context';
import { ErrorView } from '@/src/components';
import { CampaignCard } from '@/src/components';

export default function ExploreScreen() {
  const {
    campaigns,
    loadingCampaigns,
    error,
    fetchCampaigns,
    loadMoreCampaigns,
    campaignsHasMore,
  } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCampaigns({}, true); // Reset to first page
    setRefreshing(false);
  };

  const onEndReached = () => {
    if (campaignsHasMore && !loadingCampaigns) {
      loadMoreCampaigns();
    }
  };

  if (loadingCampaigns && campaigns.length === 0) {
    return <ActivityIndicator />;
  }

  if (error && campaigns.length === 0) {
    return <ErrorView error={error} onRetry={() => fetchCampaigns()} />;
  }

  return (
    <FlatList
      data={campaigns}
      renderItem={({ item }) => <CampaignCard campaign={item} />}
      keyExtractor={(item) => item.id}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingCampaigns ? <ActivityIndicator /> : null
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}
```

### Example 2: Wallet Screen with Error Handling

```typescript
import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useApp } from '@/src/context';
import { ErrorView } from '@/src/components';

export default function WalletScreen() {
  const {
    wallet,
    transactions,
    loadingWallet,
    loadingTransactions,
    error,
    fetchWallet,
    fetchTransactions,
  } = useApp();

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  if (loadingWallet) {
    return <ActivityIndicator />;
  }

  if (error && !wallet) {
    return <ErrorView error={error} onRetry={fetchWallet} />;
  }

  return (
    <View>
      <Text>Balance: ₹{wallet.balance}</Text>
      <Text>Pending: ₹{wallet.pending}</Text>
      {/* ... rest of UI */}
    </View>
  );
}
```

### Example 3: Application Submission

```typescript
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useApp } from '@/src/context';

export default function ApplicationScreen({ campaignId }: { campaignId: string }) {
  const { applyCampaign } = useApp();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (pitch: string) => {
    setSubmitting(true);
    try {
      await applyCampaign(campaignId, {
        pitch,
        expectedTimeline: '2 weeks',
      });
      Alert.alert('Success', 'Application submitted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  // ... rest of component
}
```

## Component Updates

### ErrorView Component

```typescript
import { ErrorView } from '@/src/components';

<ErrorView
  error={error}
  onRetry={() => fetchCampaigns()}
  title="Failed to load campaigns"
  showIcon={true}
/>
```

### OfflineNotice Component

```typescript
import { OfflineNotice } from '@/src/components';

// Add to root layout
<View>
  <OfflineNotice />
  {/* Your app content */}
</View>
```

### SkeletonLoader Component

```typescript
import { SkeletonLoader, CampaignCardSkeleton } from '@/src/components';

// Single skeleton
<SkeletonLoader width="100%" height={20} />

// Campaign card skeleton
<CampaignCardSkeleton />
```

## Migration Steps

### Step 1: Enable Feature Flags

```typescript
// In your app initialization or settings screen
import { featureFlags } from '@/src/config/featureFlags';

// Enable APIs one by one
await featureFlags.setFlag('USE_API_CAMPAIGNS', true);
await featureFlags.setFlag('USE_API_APPLICATIONS', true);
await featureFlags.setFlag('USE_API_WALLET', true);
await featureFlags.setFlag('USE_API_MESSAGING', true);
await featureFlags.setFlag('USE_API_NOTIFICATIONS', true);
```

### Step 2: Update AppContext Import

```typescript
// Change from:
import { AppProvider, useApp } from '@/src/context/AppContext';

// To:
import { AppProvider, useApp } from '@/src/context/AppContext.api';
```

Or update `src/context/index.ts`:

```typescript
// Export the API version
export { AppProvider, useApp } from './AppContext.api';
```

### Step 3: Add Loading States to Screens

Update screens to show loading indicators:

```typescript
const { campaigns, loadingCampaigns } = useApp();

if (loadingCampaigns && campaigns.length === 0) {
  return <ActivityIndicator />;
}
```

### Step 4: Add Error Handling

Add error views to screens:

```typescript
const { error, fetchCampaigns } = useApp();

if (error) {
  return <ErrorView error={error} onRetry={() => fetchCampaigns()} />;
}
```

### Step 5: Add Offline Notice

Add to root layout:

```typescript
import { OfflineNotice } from '@/src/components';

<AppProvider>
  <OfflineNotice />
  <AppContent />
</AppProvider>
```

## Backward Compatibility

✅ **All existing screens work without changes**

The migrated AppContext maintains:
- Same method signatures
- Same data structures
- Same behavior (with API calls)
- Automatic fallback to mock data if API fails

## Testing

### Test with Mock Data

```typescript
// All feature flags disabled (default)
// App uses mock data
```

### Test with Real API

```typescript
// Enable feature flags
await featureFlags.setFlag('USE_API_CAMPAIGNS', true);

// App uses real API
// Falls back to cache on error
```

### Test Offline Mode

1. Disable network
2. App loads from cache
3. Shows offline notice
4. Operations queue until online

## Troubleshooting

### Issue: Data not loading

**Solution:**
1. Check feature flags are enabled
2. Verify backend is running
3. Check network connectivity
4. Review error in console

### Issue: Loading state stuck

**Solution:**
1. Check if API call is hanging
2. Verify error handling is working
3. Check network timeout settings

### Issue: Cache not working

**Solution:**
1. Verify AsyncStorage permissions
2. Check cache TTL settings
3. Clear cache: `await cacheUtils.clear()`

## Summary

✅ **Complete Migration** - All features migrated to API
✅ **Backward Compatible** - No screen changes needed
✅ **Loading States** - All operations have loading indicators
✅ **Error Handling** - Comprehensive error handling
✅ **Offline Support** - Automatic caching and offline access
✅ **Optimistic Updates** - Instant UI feedback
✅ **Feature Flags** - Gradual migration support

The AppContext is now fully integrated with the Spring Boot backend while maintaining complete backward compatibility!



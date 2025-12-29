# CreatorX API Migration Strategy

This document outlines the step-by-step migration strategy from mock data to real backend integration.

## 📋 Overview

The migration is designed to be:
- **Gradual**: Migrate one feature at a time
- **Backward Compatible**: Existing UI continues to work
- **Testable**: Feature flags allow easy rollback
- **User-Friendly**: Offline support and error handling

## 🎯 Migration Phases

### Phase 1: Authentication ✅
**Status**: Ready to enable

**Feature Flag**: `USE_API_AUTH`

**What to migrate**:
- Login flow
- Registration flow
- Token storage
- Auto-login on app start

**Steps**:
1. Enable `USE_API_AUTH` flag
2. Update login/register screens to use `authService`
3. Test token refresh flow
4. Verify auto-login works

**Files to update**:
- `app/auth/login.tsx`
- `app/auth/register.tsx`
- `src/context/AppContext.tsx` (auth state)

---

### Phase 2: Campaign Discovery (Read-Only) ✅
**Status**: Ready to enable

**Feature Flag**: `USE_API_CAMPAIGNS`

**What to migrate**:
- Campaign listing (Explore screen)
- Campaign details
- Campaign search/filters
- Save/unsave campaigns

**Steps**:
1. Enable `USE_API_CAMPAIGNS` flag
2. Update Explore screen (see `explore.migrated.tsx`)
3. Add pagination support
4. Test offline mode (cached data)
5. Verify filters work

**Files to update**:
- `app/(tabs)/explore.tsx` → Use `explore.migrated.tsx` as reference
- `app/campaign-detail.tsx`
- `src/context/AppContext.tsx` (campaign loading)

**Example**:
```typescript
// In AppContext
if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
  const response = await campaignService.getCampaigns({ page: 0, size: 20 });
  const adapted = adaptCampaignsResponse(response);
  setCampaigns(adapted.campaigns);
} else {
  // Use mock data
  setCampaigns(defaultCampaigns);
}
```

---

### Phase 3: Applications (Write Operations) ✅
**Status**: Ready to enable

**Feature Flag**: `USE_API_APPLICATIONS`

**What to migrate**:
- Submit application
- View application history
- Withdraw application
- Application status updates

**Steps**:
1. Enable `USE_API_APPLICATIONS` flag
2. Update application submission flow
3. Add optimistic updates
4. Test error handling (network failures)
5. Verify application status syncs

**Files to update**:
- `app/apply/[id].tsx`
- `app/applications.tsx`
- `src/context/AppContext.tsx` (application methods)

---

### Phase 4: Deliverables & Wallet ✅
**Status**: Ready to enable

**Feature Flags**: `USE_API_DELIVERABLES`, `USE_API_WALLET`

**What to migrate**:
- Deliverable submission (file upload)
- Deliverable status tracking
- Wallet balance display
- Transaction history
- Withdrawal requests

**Steps**:
1. Enable `USE_API_DELIVERABLES` flag
2. Enable `USE_API_WALLET` flag
3. Update deliverable submission (handle file uploads)
4. Update wallet screen with real data
5. Test file upload with different formats
6. Verify transaction history pagination

**Files to update**:
- `app/(tabs)/wallet.tsx`
- `app/deliverables/[id].tsx`
- `app/active-campaigns.tsx`

---

### Phase 5: Messaging & Notifications ✅
**Status**: Ready to enable

**Feature Flags**: `USE_API_MESSAGING`, `USE_API_NOTIFICATIONS`

**What to migrate**:
- Conversation list
- Message sending/receiving
- Notification list
- Mark as read functionality

**Steps**:
1. Enable `USE_API_MESSAGING` flag
2. Enable `USE_API_NOTIFICATIONS` flag
3. Update chat screens
4. Add real-time updates (polling or WebSocket)
5. Test notification badge counts

**Files to update**:
- `app/(tabs)/chat.tsx`
- `app/conversation.tsx`
- `app/notifications.tsx`

---

## 🔧 Implementation Guide

### Step 1: Enable Feature Flags

Create a feature flag toggle screen (for testing):

```typescript
// app/settings/feature-flags.tsx
import { featureFlags } from '@/src/config/featureFlags';
import { Switch } from 'react-native';

export default function FeatureFlagsScreen() {
  const [flags, setFlags] = useState(featureFlags.getAllFlags());

  const toggleFlag = async (flag: FeatureFlag, enabled: boolean) => {
    await featureFlags.setFlag(flag, enabled);
    setFlags(featureFlags.getAllFlags());
  };

  return (
    <View>
      <Switch
        value={flags.USE_API_CAMPAIGNS}
        onValueChange={(val) => toggleFlag('USE_API_CAMPAIGNS', val)}
      />
      {/* Add more toggles */}
    </View>
  );
}
```

### Step 2: Update AppContext

Replace your existing `AppContext.tsx` with `AppContext.migrated.tsx`:

```bash
# Backup existing
mv src/context/AppContext.tsx src/context/AppContext.backup.tsx

# Use migrated version
cp src/context/AppContext.migrated.tsx src/context/AppContext.tsx
```

### Step 3: Update Screens Gradually

For each screen, follow this pattern:

1. **Add loading states**:
```typescript
const { campaigns, isLoading, error } = useApp();

if (isLoading) {
  return <Skeleton />;
}
```

2. **Add error handling**:
```typescript
if (error) {
  return <ErrorView message={error} onRetry={refreshData} />;
}
```

3. **Add pull-to-refresh**:
```typescript
<FlatList
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
  }
/>
```

4. **Add pagination** (for lists):
```typescript
const { campaigns, campaignsHasMore, loadMoreCampaigns } = useApp();

<FlatList
  onEndReached={loadMoreCampaigns}
  onEndReachedThreshold={0.5}
  ListFooterComponent={campaignsHasMore ? <LoadingSpinner /> : null}
/>
```

### Step 4: Test Each Phase

For each phase:

1. **Enable feature flag**
2. **Test happy path**: Verify data loads correctly
3. **Test offline mode**: Turn off network, verify cached data shows
4. **Test error cases**: 
   - Network failure
   - 401 (unauthorized)
   - 500 (server error)
5. **Test edge cases**:
   - Empty lists
   - Large datasets (pagination)
   - Slow network (loading states)

---

## 🛡️ Error Handling Strategy

### Network Errors
```typescript
if (isNetworkError(error)) {
  // Show cached data if available
  // Display "Offline mode" banner
  // Allow retry when network returns
}
```

### 401 Errors
```typescript
if (error.status === 401) {
  // Clear tokens
  // Redirect to login
  // Show "Session expired" message
}
```

### 500 Errors
```typescript
if (error.status >= 500) {
  // Show "Server error, please try again"
  // Allow retry
  // Log error for debugging
}
```

---

## 💾 Cache Strategy

### What to Cache
- ✅ Campaigns (24 hours)
- ✅ Wallet balance (5 minutes)
- ✅ User profile (1 hour)
- ✅ Saved campaigns (indefinite)
- ❌ Don't cache: Messages, real-time notifications

### Cache Invalidation
```typescript
// Invalidate on user actions
await cacheUtils.remove('campaigns'); // After applying to campaign

// Refresh on app foreground
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    refreshData();
  }
});
```

---

## 📊 Monitoring & Debugging

### Enable API Logging
Already enabled in `client.ts` for `__DEV__` mode. Check console for:
- Request URLs and methods
- Response status and data
- Error details

### Feature Flag Status
```typescript
import { featureFlags } from '@/src/config/featureFlags';

console.log('Current flags:', featureFlags.getAllFlags());
```

### Network Status
```typescript
import NetInfo from '@react-native-community/netinfo';

NetInfo.addEventListener(state => {
  console.log('Network state:', state.isConnected);
});
```

---

## ✅ Checklist

### Phase 1: Authentication
- [ ] Enable `USE_API_AUTH` flag
- [ ] Test login flow
- [ ] Test registration flow
- [ ] Test token refresh
- [ ] Test auto-login

### Phase 2: Campaigns
- [ ] Enable `USE_API_CAMPAIGNS` flag
- [ ] Update Explore screen
- [ ] Add pagination
- [ ] Test filters
- [ ] Test offline mode

### Phase 3: Applications
- [ ] Enable `USE_API_APPLICATIONS` flag
- [ ] Update application flow
- [ ] Test submission
- [ ] Test error handling

### Phase 4: Deliverables & Wallet
- [ ] Enable `USE_API_DELIVERABLES` flag
- [ ] Enable `USE_API_WALLET` flag
- [ ] Test file uploads
- [ ] Test wallet sync

### Phase 5: Messaging & Notifications
- [ ] Enable `USE_API_MESSAGING` flag
- [ ] Enable `USE_API_NOTIFICATIONS` flag
- [ ] Test real-time updates
- [ ] Test notification badges

---

## 🚀 Rollback Plan

If issues occur:

1. **Disable feature flag**:
```typescript
await featureFlags.setFlag('USE_API_CAMPAIGNS', false);
```

2. **Clear cache** (if needed):
```typescript
await cacheUtils.clear();
```

3. **Restart app**: App will use mock data

---

## 📝 Notes

- All API calls are wrapped in try-catch
- Optimistic updates provide instant feedback
- Cached data ensures offline functionality
- Error messages are user-friendly
- Loading states prevent confusion

---

## 🆘 Support

If you encounter issues:
1. Check console logs for API errors
2. Verify feature flags are set correctly
3. Check network connectivity
4. Verify backend is running
5. Check API base URL in `.env`


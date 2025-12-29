# Campaign & Application Services Documentation

Complete implementation of Campaign and Application API services with optimistic updates and pagination support.

## Overview

This implementation provides:
- ✅ **Type-safe API services** for Campaigns and Applications
- ✅ **Pagination hook** for infinite scroll
- ✅ **Optimistic updates** for better UX
- ✅ **Error handling** with automatic rollback
- ✅ **Usage examples** for React components

## Service Modules

### Campaign Service (`src/api/services/campaignService.ts`)

```typescript
import { campaignService } from '@/src/api/services';

// Get campaigns with filters and pagination
const campaigns = await campaignService.getCampaigns(
  {
    category: 'Fashion',
    platform: 'INSTAGRAM',
    budgetMin: 1000,
    budgetMax: 10000,
  },
  0, // page
  20  // size
);

// Search campaigns
const results = await campaignService.searchCampaigns('summer', 0, 20);

// Get campaign details
const campaign = await campaignService.getCampaignById(123);

// Save/unsave campaign
await campaignService.saveCampaign(123);
await campaignService.unsaveCampaign(123);

// Get saved campaigns
const saved = await campaignService.getSavedCampaigns();

// Get active campaigns
const active = await campaignService.getActiveCampaigns();
```

### Application Service (`src/api/services/applicationService.ts`)

```typescript
import { applicationService } from '@/src/api/services';

// Submit application
const application = await applicationService.submitApplication({
  campaignId: 123,
  pitchText: 'I would love to work on this campaign...',
  availability: 'Available immediately',
  expectedTimeline: '2 weeks',
});

// Get applications with pagination
const applications = await applicationService.getApplications(0, 20);

// Get application details
const app = await applicationService.getApplicationById(456);

// Withdraw application
await applicationService.withdrawApplication(456);
```

## Pagination Hook

### `usePagination<T>`

A reusable hook for managing paginated data with infinite scroll support.

**Location:** `src/hooks/usePagination.ts`

```typescript
import { usePagination } from '@/src/hooks/usePagination';
import { campaignService } from '@/src/api/services';
import { Campaign } from '@/src/api/types';

function ExploreScreen() {
  const {
    data: campaigns,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
  } = usePagination<Campaign>(
    (page, size) => campaignService.getCampaigns({}, page, size),
    {
      initialPage: 0,
      pageSize: 20,
      autoLoad: true,
    }
  );

  return (
    <FlatList
      data={campaigns}
      onRefresh={refresh}
      refreshing={refreshing}
      onEndReached={() => {
        if (hasMore && !loadingMore) {
          loadMore();
        }
      }}
      ListFooterComponent={
        loadingMore ? <ActivityIndicator /> : null
      }
      renderItem={({ item }) => <CampaignCard campaign={item} />}
    />
  );
}
```

**Hook API:**

```typescript
interface UsePaginationResult<T> {
  data: T[];              // All loaded items
  loading: boolean;        // Initial load
  refreshing: boolean;     // Refresh in progress
  loadingMore: boolean;   // Loading more items
  error: Error | null;    // Error state
  page: number;           // Current page
  hasMore: boolean;       // More pages available
  total: number;          // Total items
  totalPages: number;     // Total pages
  loadMore: () => Promise<void>;  // Load next page
  refresh: () => Promise<void>;   // Refresh from start
  reset: () => void;      // Reset state
}
```

## Optimistic Updates

### Utilities (`src/utils/optimisticUpdates.ts`)

Helper functions for optimistic UI updates:

```typescript
import {
  optimisticSaveCampaign,
  optimisticUnsaveCampaign,
  optimisticAddApplication,
  optimisticRemoveApplication,
} from '@/src/utils/optimisticUpdates';

// Save campaign optimistically
const { updatedState, revert } = optimisticSaveCampaign(campaigns, 123);
setCampaigns(updatedState);

try {
  await campaignService.saveCampaign(123);
} catch (error) {
  setCampaigns(revert()); // Revert on error
}
```

### Hook (`src/hooks/useOptimisticCampaign.ts`)

Pre-built hook for campaign optimistic updates:

```typescript
import { useOptimisticCampaign } from '@/src/hooks/useOptimisticCampaign';

function CampaignList() {
  const {
    campaigns,
    setCampaigns,
    saveCampaign,
    unsaveCampaign,
    isSaving,
    error,
  } = useOptimisticCampaign(initialCampaigns);

  const handleSave = async (campaignId: number) => {
    try {
      await saveCampaign(campaignId);
      // UI already updated optimistically
    } catch (err) {
      // Automatically reverted, show error
      Alert.alert('Error', 'Failed to save campaign');
    }
  };

  return (
    <View>
      {campaigns.map((campaign) => (
        <CampaignCard
          key={campaign.id}
          campaign={campaign}
          onSave={() => handleSave(Number(campaign.id))}
          isSaving={isSaving}
        />
      ))}
    </View>
  );
}
```

## Complete Usage Examples

### Example 1: Explore Screen with Pagination

```typescript
import React, { useState } from 'react';
import { View, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { usePagination } from '@/src/hooks/usePagination';
import { useOptimisticCampaign } from '@/src/hooks/useOptimisticCampaign';
import { campaignService } from '@/src/api/services';
import { Campaign } from '@/src/api/types';
import { CampaignCard } from '@/src/components';

export default function ExploreScreen() {
  const [filters, setFilters] = useState({});

  // Pagination
  const {
    data: campaigns,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
  } = usePagination<Campaign>(
    (page, size) => campaignService.getCampaigns(filters, page, size),
    { pageSize: 20 }
  );

  // Optimistic updates
  const { saveCampaign, unsaveCampaign, isSaving } = useOptimisticCampaign(campaigns);

  const handleSave = async (campaignId: number) => {
    try {
      await saveCampaign(campaignId);
    } catch (error) {
      Alert.alert('Error', 'Failed to save campaign');
    }
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <FlatList
      data={campaigns}
      renderItem={({ item }) => (
        <CampaignCard
          campaign={item}
          onSave={() => handleSave(Number(item.id))}
          isSaving={isSaving}
        />
      )}
      keyExtractor={(item) => item.id}
      onEndReached={() => {
        if (hasMore && !loadingMore) {
          loadMore();
        }
      }}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loadingMore ? <ActivityIndicator /> : null
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
    />
  );
}
```

### Example 2: Application Submission

```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { applicationService } from '@/src/api/services';
import { handleAPIError } from '@/src/api/errors';

export default function ApplicationScreen({ campaignId }: { campaignId: number }) {
  const [pitchText, setPitchText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!pitchText.trim()) {
      Alert.alert('Error', 'Please enter your pitch');
      return;
    }

    setSubmitting(true);
    try {
      const application = await applicationService.submitApplication({
        campaignId,
        pitchText,
        availability: 'Available immediately',
        expectedTimeline: '2 weeks',
      });

      Alert.alert('Success', 'Application submitted successfully!');
      // Navigate back or update UI
    } catch (error) {
      const apiError = handleAPIError(error);
      Alert.alert('Error', apiError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      <TextInput
        value={pitchText}
        onChangeText={setPitchText}
        placeholder="Enter your pitch..."
        multiline
      />
      <Button
        title={submitting ? 'Submitting...' : 'Submit Application'}
        onPress={handleSubmit}
        disabled={submitting}
      />
    </View>
  );
}
```

### Example 3: Applications List with Pagination

```typescript
import React from 'react';
import { FlatList, View, Text } from 'react-native';
import { usePagination } from '@/src/hooks/usePagination';
import { applicationService } from '@/src/api/services';
import { Application } from '@/src/api/types';
import { ApplicationCard } from '@/src/components';

export default function ApplicationsScreen() {
  const {
    data: applications,
    loading,
    refreshing,
    loadingMore,
    hasMore,
    loadMore,
    refresh,
  } = usePagination<Application>(
    (page, size) => applicationService.getApplications(page, size),
    { pageSize: 20 }
  );

  const handleWithdraw = async (applicationId: number) => {
    try {
      await applicationService.withdrawApplication(applicationId);
      refresh(); // Refresh list after withdrawal
    } catch (error) {
      Alert.alert('Error', 'Failed to withdraw application');
    }
  };

  return (
    <FlatList
      data={applications}
      renderItem={({ item }) => (
        <ApplicationCard
          application={item}
          onWithdraw={() => handleWithdraw(Number(item.id))}
        />
      )}
      keyExtractor={(item) => item.id}
      onEndReached={() => hasMore && !loadingMore && loadMore()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loadingMore ? <ActivityIndicator /> : null}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} />
      }
    />
  );
}
```

### Example 4: Campaign Details with Save/Unsave

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { campaignService } from '@/src/api/services';
import { Campaign } from '@/src/api/types';
import { useOptimisticCampaign } from '@/src/hooks/useOptimisticCampaign';

export default function CampaignDetailScreen({ campaignId }: { campaignId: number }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  const { saveCampaign, unsaveCampaign, isSaving } = useOptimisticCampaign(
    campaign ? [campaign] : []
  );

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  const loadCampaign = async () => {
    try {
      const data = await campaignService.getCampaignById(campaignId);
      setCampaign(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!campaign) return;

    try {
      if (campaign.isSaved) {
        await unsaveCampaign(campaignId);
        setCampaign({ ...campaign, isSaved: false });
      } else {
        await saveCampaign(campaignId);
        setCampaign({ ...campaign, isSaved: true });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update campaign');
    }
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!campaign) {
    return <Text>Campaign not found</Text>;
  }

  return (
    <View>
      <Text>{campaign.title}</Text>
      <Text>{campaign.description}</Text>
      <Button
        title={campaign.isSaved ? 'Unsave' : 'Save'}
        onPress={handleSave}
        disabled={isSaving}
      />
    </View>
  );
}
```

## Best Practices

### 1. Always Handle Errors

```typescript
try {
  await campaignService.saveCampaign(id);
} catch (error) {
  const apiError = handleAPIError(error);
  Alert.alert('Error', apiError.message);
}
```

### 2. Use Optimistic Updates for Better UX

```typescript
// Update UI immediately
setCampaigns(updatedCampaigns);

try {
  await campaignService.saveCampaign(id);
} catch (error) {
  // Revert on error
  setCampaigns(previousCampaigns);
}
```

### 3. Implement Proper Loading States

```typescript
const [loading, setLoading] = useState(false);
const [submitting, setSubmitting] = useState(false);

// Show loading indicators
{loading && <ActivityIndicator />}
{!loading && <Content />}
```

### 4. Use Pagination Hook for Lists

```typescript
// Instead of manual pagination
const { data, loadMore, hasMore } = usePagination(fetchFn);
```

### 5. Refresh After Mutations

```typescript
// After submitting application
await applicationService.submitApplication(data);
refresh(); // Refresh the list
```

## Type Safety

All services are fully typed:

```typescript
// Campaign types
import { Campaign, CampaignFilters, Page } from '@/src/api/types';

// Application types
import { Application, ApplicationRequest } from '@/src/api/types';
```

## Summary

✅ **Complete Services** - Campaign and Application services fully implemented
✅ **Pagination Hook** - Reusable `usePagination` hook
✅ **Optimistic Updates** - Better UX with instant feedback
✅ **Error Handling** - Automatic rollback on errors
✅ **Type Safety** - Full TypeScript support
✅ **Usage Examples** - Ready-to-use component examples

All services are production-ready and fully integrated with the Spring Boot backend!



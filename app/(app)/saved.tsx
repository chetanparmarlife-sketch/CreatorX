import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { spacing, borderRadius } from '@/src/theme';
import { CampaignDetailModal, EmptyState, Avatar, ErrorView } from '@/src/components';
import { Campaign } from '@/src/types';
import { useApp } from '@/src/context';
import { useRefresh, useTheme } from '@/src/hooks';
import { campaignService } from '@/src/api/services/campaignService';

const platformFilters = [
  { id: 'all', label: 'All' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'high_payout', label: 'High Payout' },
];

const getPlatformColors = (platform: string) => {
  switch (platform) {
    case 'instagram':
      return { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.2)', text: '#a855f7', icon: 'camera' };
    case 'tiktok':
      return { bg: 'rgba(236, 72, 153, 0.1)', border: 'rgba(236, 72, 153, 0.2)', text: '#ec4899', icon: 'music' };
    case 'youtube':
      return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: '#ef4444', icon: 'play-circle' };
    default:
      return { bg: 'rgba(107, 114, 128, 0.1)', border: 'rgba(107, 114, 128, 0.2)', text: '#6b7280', icon: 'video' };
  }
};

const getBrandGradient = (brand: string) => {
  const brandColors: Record<string, string[]> = {
    'Sephora': ['#ec4899', '#f472b6'],
    'Sony Electronics': ['#1f2937', '#111827'],
    'Gymshark': ['#06b6d4', '#3b82f6'],
    'Adobe': ['#ef4444', '#f97316'],
  };
  return brandColors[brand] || ['#6366f1', '#8b5cf6'];
};

interface SavedCampaignCardProps {
  campaign: Campaign;
  colors: any;
  isDark: boolean;
  onView: (id: string) => void;
  onUnsave: (id: string) => void;
}

const SavedCampaignCard = memo(function SavedCampaignCard({ campaign, colors, isDark, onView, onUnsave }: SavedCampaignCardProps) {
  const platformColors = getPlatformColors(campaign.platform);
  const isClosed = campaign.status === 'CLOSED';
  const cardBackground = isDark ? '#1c1f2e' : colors.card;
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.08)' : colors.cardBorder;

  return (
    <TouchableOpacity
      style={[
        styles.campaignCard,
        {
          backgroundColor: cardBackground,
          borderColor: cardBorder,
          opacity: isClosed ? 0.7 : 1,
        }
      ]}
      onPress={() => !isClosed && onView(campaign.id)}
      activeOpacity={isClosed ? 0.7 : 0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.brandRow}>
          <View style={[styles.brandAvatar, { backgroundColor: isClosed ? '#6b7280' : getBrandGradient(campaign.brand)[0] }]}>
            <Text style={styles.brandAvatarText}>{campaign.brand.charAt(0)}</Text>
          </View>
          <View style={styles.brandInfo}>
            <Text style={[styles.campaignTitle, { color: isClosed ? colors.textMuted : colors.text }]} numberOfLines={1}>
              {campaign.title}
            </Text>
            <Text style={[styles.brandName, { color: colors.textSecondary }]}>{campaign.brand}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={() => onUnsave(campaign.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="bookmark" size={22} color={isClosed ? colors.textMuted : colors.primary} style={{ opacity: 1 }} />
        </TouchableOpacity>
      </View>

      <View style={styles.tagsRow}>
        <View style={[styles.platformTag, { backgroundColor: isClosed ? 'rgba(107, 114, 128, 0.1)' : platformColors.bg, borderColor: isClosed ? 'rgba(107, 114, 128, 0.2)' : platformColors.border }]}>
          <Feather name={platformColors.icon as any} size={12} color={isClosed ? '#6b7280' : platformColors.text} />
          <Text style={[styles.platformTagText, { color: isClosed ? '#6b7280' : platformColors.text }]}>
            {campaign.platform === 'instagram' ? 'Reels' : campaign.platform.charAt(0).toUpperCase() + campaign.platform.slice(1)}
          </Text>
        </View>
        {isClosed ? (
          <View style={[styles.statusTag, { backgroundColor: 'rgba(107, 114, 128, 0.1)', borderColor: 'rgba(107, 114, 128, 0.2)' }]}>
            <Text style={[styles.statusTagText, { color: '#6b7280' }]}>Closed</Text>
          </View>
        ) : (
          <View style={[styles.statusTag, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
            <Feather name="clock" size={12} color={colors.textSecondary} />
            <Text style={[styles.statusTagText, { color: colors.textSecondary }]}>Due in 3 days</Text>
          </View>
        )}
        {campaign.hasProductExchange && !isClosed && (
          <View style={[styles.statusTag, { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <Feather name="package" size={12} color="#f59e0b" />
            <Text style={[styles.statusTagText, { color: '#f59e0b' }]}>Product Exchange</Text>
          </View>
        )}
      </View>

      <View style={[styles.divider, { backgroundColor: cardBorder }]} />

      <View style={styles.cardFooter}>
        <View style={styles.payoutSection}>
          <Text style={[styles.payoutLabel, { color: colors.textMuted }]}>PAYOUT</Text>
          <Text style={[styles.payoutValue, { color: isClosed ? colors.textMuted : colors.text }]}>
            {campaign.budget}
            {campaign.hasProductExchange && (
              <Text style={[styles.payoutExtra, { color: colors.textSecondary }]}> + Gear</Text>
            )}
          </Text>
        </View>
        {isClosed ? (
          <View style={[styles.closedButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' }]}>
            <Text style={[styles.closedButtonText, { color: colors.textMuted }]}>Closed</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.viewButton, { backgroundColor: isDark ? colors.primary : 'rgba(19, 55, 236, 0.1)' }]}
            onPress={() => onView(campaign.id)}
            activeOpacity={0.8}
          >
            <Text style={[styles.viewButtonText, { color: isDark ? '#ffffff' : colors.primary }]}>View Details</Text>
            <Feather name="arrow-right" size={14} color={isDark ? '#ffffff' : colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default function SavedScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { saveCampaign, unsaveCampaign, isCampaignSaved, addNotification } = useApp();

  const backgroundColor = isDark ? '#101322' : colors.background;
  const surfaceColor = isDark ? '#1c1f2e' : colors.card;
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : colors.cardBorder;
  const mutedText = isDark ? '#94a3b8' : colors.textMuted;

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch saved campaigns from API
  const fetchSavedCampaigns = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const savedCampaigns = await campaignService.getSavedCampaigns();
      setCampaigns(savedCampaigns);
    } catch (err: any) {
      console.error('[SavedScreen] Failed to fetch saved campaigns:', err);
      setError(err.message || 'Failed to load saved campaigns');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSavedCampaigns();
  }, [fetchSavedCampaigns]);

  const savedCampaignsList = useMemo(() => {
    let filtered = campaigns;

    if (selectedFilter === 'high_payout') {
      filtered = filtered.filter(c => {
        const budgetStr = c.budget || '';
        const budgetNum = parseFloat(budgetStr.replace(/[^0-9.]/g, ''));
        return !isNaN(budgetNum) && budgetNum >= 1500;
      });
    } else if (selectedFilter !== 'all') {
      filtered = filtered.filter(c => c.platform === selectedFilter);
    }

    return filtered;
  }, [campaigns, selectedFilter]);

  const handleRefresh = useCallback(async () => {
    await fetchSavedCampaigns();
  }, [fetchSavedCampaigns]);

  const { refreshing, handleRefresh: onRefresh } = useRefresh(handleRefresh);

  const handleApply = useCallback((id: string) => {
    addNotification({
      type: 'campaign',
      title: 'Application Submitted',
      description: 'Your application has been submitted successfully!',
      time: 'Just now',
      read: false,
    });
  }, [addNotification]);

  const handleSave = useCallback((id: string) => {
    if (isCampaignSaved(id)) {
      unsaveCampaign(id);
      // Remove from local state too
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } else {
      saveCampaign(id);
    }
  }, [isCampaignSaved, saveCampaign, unsaveCampaign]);

  const handleViewCampaign = useCallback((id: string) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (campaign) setSelectedCampaign(campaign);
  }, [campaigns]);

  const renderCampaign = useCallback(
    ({ item }: { item: Campaign }) => (
      <SavedCampaignCard
        campaign={item}
        colors={colors}
        isDark={isDark}
        onView={handleViewCampaign}
        onUnsave={unsaveCampaign}
      />
    ),
    [colors, isDark, handleViewCampaign, unsaveCampaign]
  );

  const keyExtractor = useCallback((item: Campaign) => item.id, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: borderColor, backgroundColor: backgroundColor }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.05)' }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Saved Campaigns</Text>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0,0,0,0.05)' }]}
        >
          <Feather name="sliders" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {platformFilters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilter === filter.id
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: surfaceColor, borderColor: borderColor }
              ]}
              onPress={() => setSelectedFilter(filter.id)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterChipText,
                { color: selectedFilter === filter.id ? '#ffffff' : mutedText }
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading && campaigns.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: mutedText }]}>Loading saved campaigns...</Text>
        </View>
      ) : error && campaigns.length === 0 ? (
        <ErrorView
          title="Failed to load campaigns"
          message={error}
          onRetry={fetchSavedCampaigns}
        />
      ) : (
        <FlatList
          data={savedCampaignsList}
          renderItem={renderCampaign}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="bookmark"
              title="No saved campaigns"
              subtitle="Save campaigns you're interested in to access them quickly later"
              actionLabel="Explore Campaigns"
              onAction={() => router.push('/explore')}
            />
          }
        />
      )}

      <CampaignDetailModal
        visible={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        campaign={selectedCampaign}
        onApply={handleApply}
        onSave={handleSave}
        isSaved={selectedCampaign ? isCampaignSaved(selectedCampaign.id) : false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    paddingVertical: spacing.md,
  },
  filtersScroll: {
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  campaignCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  brandAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  brandInfo: {
    flex: 1,
  },
  campaignTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '500',
  },
  bookmarkButton: {
    padding: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  platformTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  platformTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutSection: {
    gap: 2,
  },
  payoutLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  payoutValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  payoutExtra: {
    fontSize: 14,
    fontWeight: '400',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  closedButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closedButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    marginTop: spacing.md,
  },
});

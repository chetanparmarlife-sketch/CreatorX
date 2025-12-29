import { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { CampaignCard, CampaignDetailModal, EmptyState } from '@/src/components';
import { Campaign } from '@/src/types';
import { useApp } from '@/src/context';
import { useRefresh } from '@/src/hooks';

const allCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Summer Fashion Collection',
    brand: 'StyleCo',
    budget: '₹15,000',
    deadline: 'Dec 15',
    platform: 'instagram',
    category: 'Fashion',
    applicants: 45,
    status: 'open',
    description: 'Create stunning content featuring our new summer fashion line.',
  },
  {
    id: '2',
    title: 'Tech Product Review',
    brand: 'TechBrand',
    budget: '₹25,000',
    deadline: 'Dec 20',
    platform: 'youtube',
    category: 'Tech',
    applicants: 23,
    status: 'open',
    description: 'In-depth review of our latest smartphone.',
  },
  {
    id: '3',
    title: 'Food Delivery Promo',
    brand: 'FoodieApp',
    budget: '₹8,000',
    deadline: 'Dec 12',
    platform: 'instagram',
    category: 'Food',
    applicants: 67,
    status: 'open',
    description: 'Showcase your favorite meals ordered through our app.',
  },
  {
    id: '4',
    title: 'Fitness Challenge',
    brand: 'GymPro',
    budget: '₹20,000',
    deadline: 'Dec 25',
    platform: 'youtube',
    category: 'Fitness',
    applicants: 34,
    status: 'open',
    description: '30-day fitness challenge content series.',
  },
  {
    id: '5',
    title: 'Travel Adventure Series',
    brand: 'WanderLust',
    budget: '₹30,000',
    deadline: 'Jan 5',
    platform: 'youtube',
    category: 'Travel',
    applicants: 56,
    status: 'open',
    description: 'Create travel vlogs showcasing hidden gems.',
  },
  {
    id: '6',
    title: 'Beauty Product Launch',
    brand: 'GlowUp',
    budget: '₹12,000',
    deadline: 'Dec 18',
    platform: 'instagram',
    category: 'Beauty',
    applicants: 89,
    status: 'open',
    description: 'Be part of our new skincare line launch.',
  },
];

export default function SavedScreen() {
  const router = useRouter();
  const { savedCampaigns, saveCampaign, unsaveCampaign, isCampaignSaved, addNotification } = useApp();
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const savedCampaignsList = useMemo(() => {
    return allCampaigns.filter(campaign => savedCampaigns.includes(campaign.id));
  }, [savedCampaigns]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

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
    } else {
      saveCampaign(id);
    }
  }, [isCampaignSaved, saveCampaign, unsaveCampaign]);

  const handleViewCampaign = useCallback((id: string) => {
    const campaign = allCampaigns.find((c) => c.id === id);
    if (campaign) setSelectedCampaign(campaign);
  }, []);

  const renderCampaign = useCallback(
    ({ item }: { item: Campaign }) => (
      <View style={styles.campaignItem}>
        <CampaignCard
          campaign={item}
          onApply={handleApply}
          onView={handleViewCampaign}
        />
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => unsaveCampaign(item.id)}
        >
          <Feather name="x" size={14} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    ),
    [handleApply, handleViewCampaign, unsaveCampaign]
  );

  const keyExtractor = useCallback((item: Campaign) => item.id, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Saved Campaigns</Text>
          {savedCampaignsList.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{savedCampaignsList.length}</Text>
            </View>
          )}
        </View>
        <View style={{ width: 40 }} />
      </View>

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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text,
  },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  countBadgeText: {
    ...typography.xs,
    color: colors.text,
    fontWeight: '500',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  campaignItem: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});

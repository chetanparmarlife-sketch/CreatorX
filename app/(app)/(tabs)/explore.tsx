import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Avatar, CampaignApplicationModal, CampaignCardSkeleton, CampaignDetailModal, ErrorView } from '@/src/components';
import { useTheme } from '@/src/hooks';
import { useApp } from '@/src/context';
import { useRefresh } from '@/src/hooks';
import { Campaign } from '@/src/types';
import { ApplicationFormData } from '@/src/components/CampaignApplicationModal';
import { handleAPIError } from '@/src/api/errors';
import { useAuth } from '@/src/context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');
const primaryBlue = '#1337EC';

const categoryFilters = [
  { id: 'all', label: 'All' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'tech', label: 'Tech' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'gifting', label: 'Gifting Only' },
];

const featuredFallbacks = [
  {
    id: 'featured-1',
    badge: 'High Ticket',
    title: 'Samsung Galaxy Ultra Review Series',
    payout: '$2,500',
    meta: '3 Videos',
    image:
      'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?w=900',
  },
  {
    id: 'featured-2',
    badge: 'Trending',
    title: 'Zara Summer Collection Haul',
    payout: '$1,200',
    meta: '1 Reel + 2 Stories',
    image:
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900',
  },
];

const categoryImages: Record<string, string> = {
  fashion: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
  tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  fitness: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
  travel: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800',
  beauty: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800',
  lifestyle: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800',
};

const getCampaignImage = (campaign: Campaign) => {
  if (campaign.image) return campaign.image;
  return categoryImages[campaign.category?.toLowerCase()] ||
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800';
};

const getPlatforms = (campaign: Campaign) => {
  if (campaign.platforms && campaign.platforms.length > 0) return campaign.platforms;
  if (campaign.platform) return [campaign.platform];
  return [];
};

const formatBudget = (campaign: Campaign) => {
  if (campaign.budget) return campaign.budget;
  return campaign.isPaid === false ? 'Product' : '$0';
};

export default function ExploreScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { session, initialized, loading: authLoading } = useAuth();
  const {
    campaigns,
    applyCampaign,
    saveCampaign,
    unsaveCampaign,
    isCampaignSaved,
    fetchCampaigns,
    loadingCampaigns,
    error,
    getApplication,
    fetchApplications,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAuthReady = initialized && !authLoading && !!session?.access_token;

  const apiFilters = useMemo(() => ({}), []);

  const { refreshing, handleRefresh } = useRefresh(async () => {
    if (!isAuthReady) return;
    await fetchCampaigns(apiFilters, true);
  });

  useEffect(() => {
    if (!isAuthReady) return;
    fetchCampaigns(apiFilters, true);
  }, [fetchCampaigns, apiFilters, isAuthReady]);

  const openCampaigns = useMemo(() => {
    return campaigns.filter(c => c.status === 'ACTIVE');
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    let result = openCampaigns;

    if (selectedFilter === 'gifting') {
      result = result.filter(c => c.isPaid === false);
    } else if (selectedFilter !== 'all') {
      result = result.filter(c => (c.category || '').toLowerCase() === selectedFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.brand.toLowerCase().includes(query) ||
        (c.category || '').toLowerCase().includes(query)
      );
    }

    return result;
  }, [openCampaigns, selectedFilter, searchQuery]);

  const featuredCampaigns = useMemo(() => {
    if (filteredCampaigns.length >= 2) return filteredCampaigns.slice(0, 2);
    return [];
  }, [filteredCampaigns]);

  const handleCampaignPress = useCallback((campaign: Campaign) => {
    setSelectedCampaign(campaign);
  }, []);

  const handleApply = useCallback((id: string) => {
    const campaign = campaigns.find((c) => c.id === id);
    if (campaign) {
      const alreadyApplied = campaign.userState === 'APPLIED' || !!getApplication(campaign.id);
      if (alreadyApplied) {
        Alert.alert('Already Applied', 'You have already applied to this campaign.');
        return;
      }
      setSelectedCampaign(campaign);
      setShowApplicationModal(true);
    }
  }, [campaigns, getApplication]);

  const getApplyErrorMessage = useCallback((error: unknown) => {
    const apiError = handleAPIError(error);
    const code = apiError.code?.toLowerCase() || '';
    const message = apiError.message?.toLowerCase() || '';

    if (code.includes('duplicate') || message.includes('already applied')) {
      return 'You have already applied to this campaign.';
    }
    if (code.includes('deadline') || message.includes('deadline')) {
      return 'The application deadline has passed.';
    }
    if (code.includes('eligible') || message.includes('eligible')) {
      return 'You are not eligible for this campaign.';
    }
    if (apiError.status === 401 || apiError.status === 403) {
      return 'Please sign in again to apply.';
    }
    return apiError.message || 'Unable to submit application. Please try again.';
  }, []);

  const handleSubmitApplication = useCallback(async (data: ApplicationFormData) => {
    if (!selectedCampaign) return;

    setIsSubmitting(true);
    try {
      await applyCampaign(selectedCampaign.id, data);
      await Promise.all([fetchApplications(), fetchCampaigns(apiFilters, true)]);
      setShowApplicationModal(false);
      setSelectedCampaign(null);
    } catch (err) {
      Alert.alert('Application Failed', getApplyErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCampaign, applyCampaign, fetchApplications, fetchCampaigns, getApplyErrorMessage, apiFilters]);

  const handleSave = useCallback((id: string) => {
    if (isCampaignSaved(id)) {
      unsaveCampaign(id);
    } else {
      saveCampaign(id);
    }
  }, [isCampaignSaved, saveCampaign, unsaveCampaign]);

  const backgroundColor = isDark ? '#050505' : '#F6F6F8';
  const cardBackground = isDark ? '#121212' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const mutedText = isDark ? 'rgba(255,255,255,0.62)' : 'rgba(15, 23, 42, 0.6)';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor }]}> 
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7}>
            <Avatar size={36} name="User" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Discover</Text>
        </View>
        <TouchableOpacity
          style={[styles.headerBell, { backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF' }]}
          onPress={() => router.push('/notifications')}
        >
          <Feather name="bell" size={18} color={colors.text} />
          <View style={styles.headerDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
            <Feather name="search" size={18} color={mutedText} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search campaigns, brands..."
              placeholderTextColor={mutedText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity style={styles.searchFilterButton}>
              <Feather name="sliders" size={16} color={mutedText} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {categoryFilters.map((filter) => {
              const isActive = selectedFilter === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? primaryBlue : cardBackground,
                      borderColor: isActive ? primaryBlue : cardBorder,
                    },
                  ]}
                  onPress={() => setSelectedFilter(filter.id)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: isActive ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Opportunities</Text>
          <TouchableOpacity>
            <Text style={[styles.sectionAction, { color: primaryBlue }]}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredRow}
          snapToInterval={screenWidth * 0.75 + 16}
          decelerationRate="fast"
        >
          {(featuredCampaigns.length > 0 ? featuredCampaigns : featuredFallbacks).map((item) => {
            const featured = 'id' in item && typeof (item as Campaign).brand !== 'undefined';
            const campaign = featured ? (item as Campaign) : null;
            const title = campaign?.title || (item as typeof featuredFallbacks[number]).title;
            const payout = campaign?.budget || (item as typeof featuredFallbacks[number]).payout;
            const meta = campaign?.contentTypes?.join(' + ') || (item as typeof featuredFallbacks[number]).meta;
            const badge = (item as typeof featuredFallbacks[number]).badge || 'Featured';
            const image = campaign ? getCampaignImage(campaign) : (item as typeof featuredFallbacks[number]).image;

            return (
              <TouchableOpacity
                key={featured ? campaign!.id : (item as typeof featuredFallbacks[number]).id}
                style={styles.featuredCard}
                activeOpacity={0.9}
                onPress={() => campaign && handleCampaignPress(campaign)}
              >
                <Image source={{ uri: image }} style={styles.featuredImage} />
                <View style={styles.featuredOverlay} />
                <View style={styles.featuredContent}>
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>{badge}</Text>
                  </View>
                  <Text style={styles.featuredTitle} numberOfLines={2}>{title}</Text>
                  <Text style={styles.featuredPayout}>{payout} <Text style={styles.featuredMeta}>• {meta}</Text></Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>For You</Text>
        </View>

        {!isAuthReady ? (
          <View style={[styles.authCard, { backgroundColor: cardBackground, borderColor: cardBorder }]}
          >
            <Text style={[styles.authTitle, { color: colors.text }]}>Signing you in...</Text>
            <Text style={[styles.authSubtitle, { color: mutedText }]}>We’re getting your session ready.</Text>
          </View>
        ) : loadingCampaigns && filteredCampaigns.length === 0 ? (
          <View style={styles.cardsColumn}>
            <CampaignCardSkeleton />
            <CampaignCardSkeleton />
          </View>
        ) : error ? (
          <ErrorView error={error} onRetry={() => fetchCampaigns(apiFilters, true)} />
        ) : (
          <View style={styles.cardsColumn}>
            {filteredCampaigns.map((campaign) => {
              const isApplied = campaign.userState === 'APPLIED' || !!getApplication(campaign.id);
              const platforms = getPlatforms(campaign);
              return (
                <TouchableOpacity
                  key={campaign.id}
                  style={[styles.campaignCard, { backgroundColor: cardBackground, borderColor: cardBorder }]}
                  activeOpacity={0.92}
                  onPress={() => handleCampaignPress(campaign)}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardBrandRow}>
                      <View style={styles.brandLogo}>
                        <Text style={styles.brandInitial}>{campaign.brand.charAt(0)}</Text>
                      </View>
                      <View>
                        <Text style={[styles.brandName, { color: colors.text }]}>{campaign.brand}</Text>
                        <Text style={[styles.postedText, { color: mutedText }]}>Posted recently</Text>
                      </View>
                    </View>
                    <Text style={[styles.budgetText, { color: primaryBlue }]}>{formatBudget(campaign)}</Text>
                  </View>

                  <View style={styles.cardImageWrapper}>
                    <Image source={{ uri: getCampaignImage(campaign) }} style={styles.cardImage} />
                    <View style={styles.cardImageOverlay} />
                    {platforms.length > 0 && (
                      <View style={styles.platformTagRow}>
                        {platforms.slice(0, 2).map((platform, index) => (
                          <View key={`${platform}-${index}`} style={styles.platformTag}>
                            <Text style={styles.platformTagText}>{platform}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  <View style={styles.cardFooterRow}>
                    <View style={styles.cardFooterText}>
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                        {campaign.title}
                      </Text>
                      <Text style={[styles.cardSubtitle, { color: mutedText }]} numberOfLines={1}>
                        {campaign.description || 'Create content featuring this brand.'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.cardAction,
                        { backgroundColor: isApplied ? 'rgba(19,55,236,0.2)' : primaryBlue },
                      ]}
                      onPress={() => handleApply(campaign.id)}
                      disabled={isApplied}
                    >
                      <Feather name="arrow-right" size={16} color={isApplied ? primaryBlue : '#FFFFFF'} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <CampaignDetailModal
        visible={!!selectedCampaign && !showApplicationModal}
        onClose={() => setSelectedCampaign(null)}
        campaign={selectedCampaign}
        onApply={handleApply}
        onSave={handleSave}
        isSaved={selectedCampaign ? isCampaignSaved(selectedCampaign.id) : false}
      />

      <CampaignApplicationModal
        visible={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
        onSubmit={handleSubmitApplication}
        isSubmitting={isSubmitting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerBell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: primaryBlue,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  searchFilterButton: {
    padding: 6,
    borderRadius: 10,
  },
  chipRow: {
    paddingTop: 14,
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    marginTop: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '600',
  },
  featuredRow: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  featuredCard: {
    width: screenWidth * 0.75,
    height: 160,
    borderRadius: 18,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  featuredContent: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  featuredPayout: {
    color: primaryBlue,
    fontSize: 14,
    fontWeight: '700',
  },
  featuredMeta: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '500',
  },
  cardsColumn: {
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 14,
  },
  campaignCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInitial: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  brandName: {
    fontSize: 14,
    fontWeight: '700',
  },
  postedText: {
    fontSize: 10,
    marginTop: 2,
  },
  budgetText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardImageWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  cardImage: {
    width: '100%',
    height: 140,
  },
  cardImageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  platformTagRow: {
    position: 'absolute',
    left: 10,
    bottom: 8,
    flexDirection: 'row',
    gap: 6,
  },
  platformTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  platformTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardFooterText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 11,
    marginTop: 4,
  },
  cardAction: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authCard: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  authSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
});

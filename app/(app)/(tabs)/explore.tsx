import { useState, useCallback, memo, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { spacing, borderRadius } from '@/src/theme';
import { useTheme } from '@/src/hooks';
import { Avatar, CampaignDetailModal, CampaignApplicationModal, CampaignCardSkeleton, ErrorView } from '@/src/components';
import { ApplicationFormData } from '@/src/components/CampaignApplicationModal';
import { useApp } from '@/src/context';
import { Campaign } from '@/src/types';
import { useRefresh } from '@/src/hooks';
import { handleAPIError } from '@/src/api/errors';
import { useAuth } from '@/src/context/AuthContext';

const { width: screenWidth } = Dimensions.get('window');
const quickFilterCardWidth = 100;

const platformFilters = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'instagram', label: 'Instagram', icon: 'instagram' },
  { id: 'youtube', label: 'YouTube', icon: 'youtube' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
];

const headerTabs = [
  { id: 'explore', label: 'SocialX' },
  { id: 'gigx', label: 'GigX' },
  { id: 'performancex', label: 'PerformanceX' },
];

const HeaderTabButton = memo(function HeaderTabButton({
  label,
  isActive,
  onPress,
  colors,
  isDark,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  colors: any;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.headerTabButton,
        {
          backgroundColor: isActive 
            ? 'transparent' 
            : (isDark ? '#2a2a2a' : colors.card),
          borderWidth: 1.5,
          borderColor: isActive 
            ? (isDark ? 'rgba(255, 255, 255, 0.8)' : colors.text) 
            : (isDark ? '#2a2a2a' : colors.cardBorder),
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.headerTabButtonText,
        { color: isActive ? colors.text : colors.textSecondary },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const FilterChip = memo(function FilterChip({
  label,
  icon,
  isActive,
  onPress,
  colors,
}: {
  label: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
  colors: any;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
        isActive && { backgroundColor: colors.primaryLight, borderColor: colors.primaryBorder },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Feather 
        name={icon as any} 
        size={14} 
        color={isActive ? colors.primary : colors.textMuted} 
      />
      <Text style={[
        styles.filterChipText,
        { color: colors.textSecondary },
        isActive && { color: colors.primary, fontWeight: '500' },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const CampaignCard = memo(function CampaignCard({
  campaign,
  onPress,
  onApply,
  onSave,
  isSaved,
  isApplied,
  colors,
  isDark,
}: {
  campaign: Campaign;
  onPress: () => void;
  onApply: () => void;
  onSave: () => void;
  isSaved: boolean;
  isApplied: boolean;
  colors: any;
  isDark: boolean;
}) {
  const categoryImages: Record<string, string> = {
    fashion: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    tech: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    fitness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    travel: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400',
    beauty: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
    lifestyle: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400',
  };
  
  const defaultImage = categoryImages[campaign.category?.toLowerCase()] || 
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400';

  const tags = campaign.tags || [campaign.category];
  const contentTypes = campaign.contentTypes || ['Stories', 'Long video'];
  const platforms = campaign.platforms || [campaign.platform];
  const ageGroup = campaign.ageGroup || '18-24';
  const followersRange = campaign.followersRange || '10K-100K';
  const gender = campaign.gender || 'All';
  const isPaid = campaign.isPaid !== false;
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'instagram';
      case 'youtube': return 'youtube';
      case 'linkedin': return 'linkedin';
      case 'facebook': return 'facebook';
      default: return 'globe';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return '#E4405F';
      case 'youtube': return '#FF0000';
      case 'linkedin': return '#0A66C2';
      case 'facebook': return '#1877F2';
      default: return colors.textMuted;
    }
  };

  const cardStyles = {
    card: isDark ? '#161616' : '#FFFFFF',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.06)',
    middleSection: isDark ? '#1c1c1c' : '#F8F8F8',
    middleBorder: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F0F0F0',
    tagBg: isDark ? '#222222' : '#FFFFFF',
    tagBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : '#E5E5E5',
    paidBg: isDark ? '#1c1c1c' : '#F5F5F5',
    divider: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E5E5E5',
    shareBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E5E5E5',
  };
  
  const applyLabel = isApplied ? 'Applied' : 'Apply';

  return (
    <TouchableOpacity 
      style={[
        styles.campaignCard, 
        { 
          backgroundColor: cardStyles.card,
          borderWidth: 1,
          borderColor: cardStyles.cardBorder,
        }
      ]} 
      onPress={onPress} 
      activeOpacity={0.95}
    >
      <View style={styles.cardTopSection}>
        <Image 
          source={{ uri: campaign.image || defaultImage }} 
          style={styles.cardImage} 
        />
        
        <View style={styles.cardTopContent}>
          <View style={styles.cardTopHeader}>
            <View style={styles.brandRow}>
              <View style={[styles.brandLogo, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Text style={[styles.brandInitial, { color: colors.primary }]}>
                  {campaign.brand.charAt(0)}
                </Text>
              </View>
              <Text style={[styles.brandNameText, { color: colors.textSecondary }]}>{campaign.brand}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.shareButton, { borderColor: cardStyles.shareBorder, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent' }]} 
              onPress={onSave}
            >
              <Feather name={isSaved ? 'bookmark' : 'share-2'} size={16} color={isSaved ? colors.primary : (isDark ? colors.textMuted : '#666666')} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {campaign.title}
          </Text>
          
          <View style={styles.tagsRow}>
            {tags.slice(0, 2).map((tag, index) => (
              <View 
                key={index} 
                style={[
                  styles.tagChip, 
                  { backgroundColor: cardStyles.tagBg, borderColor: cardStyles.tagBorder }
                ]}
              >
                <Text style={[styles.tagText, { color: colors.textSecondary }]}>{tag}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.contentTypeRow}>
            <Text style={[styles.contentTypeText, { color: colors.textMuted }]}>{contentTypes.join(' | ')}</Text>
            <View style={styles.platformIcons}>
              {platforms.map((platform, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.platformIconCircle, 
                    { 
                      backgroundColor: getPlatformColor(platform),
                      borderColor: cardStyles.card,
                    }
                  ]}
                >
                  <Feather name={getPlatformIcon(platform) as any} size={10} color="#fff" />
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
      
      <View style={[
        styles.cardMiddleSection, 
        { 
          backgroundColor: cardStyles.middleSection,
          borderTopColor: cardStyles.middleBorder,
        }
      ]}>
        <View style={styles.statsColumn}>
          <Text style={[styles.statsLabel, { color: colors.textMuted }]}>Age group</Text>
          <Text style={[styles.statsValue, { color: colors.text }]}>{ageGroup}</Text>
        </View>
        <View style={[styles.statsDivider, { backgroundColor: cardStyles.divider }]} />
        <View style={styles.statsColumn}>
          <Text style={[styles.statsLabel, { color: colors.textMuted }]}>Followers range</Text>
          <Text style={[styles.statsValue, { color: colors.text }]}>{followersRange}</Text>
        </View>
        <View style={[styles.statsDivider, { backgroundColor: cardStyles.divider }]} />
        <View style={styles.statsColumn}>
          <Text style={[styles.statsLabel, { color: colors.textMuted }]}>Gender</Text>
          <Text style={[styles.statsValue, { color: colors.text }]}>{gender}</Text>
        </View>
      </View>
      
      <View style={styles.cardBottomSection}>
        <View style={[styles.paidBadge, { backgroundColor: cardStyles.paidBg }]}>
          <Text style={[styles.paidText, { color: colors.text, fontWeight: '600' }]}>{isPaid ? 'Paid' : 'Barter'}</Text>
          <View style={[styles.paidDivider, { backgroundColor: cardStyles.divider }]} />
          <Text style={[styles.paidAmount, { color: colors.primary, fontWeight: '600' }]}>{campaign.budget}</Text>
        </View>
        
        <Text style={[styles.endsInText, { color: colors.textSecondary }]}>
          Ends in <Text style={[styles.endsInBold, { color: colors.text }]}>{campaign.daysRemaining || 4} days</Text>
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.applyButton,
            { backgroundColor: isApplied ? 'rgba(255,255,255,0.1)' : colors.amber },
          ]}
          onPress={onApply}
          disabled={isApplied}
        >
          <Text style={[styles.applyButtonText, { color: isApplied ? colors.textMuted : '#1a1a1a', fontWeight: '600' }]}>
            {applyLabel}
          </Text>
          {!isApplied && <Feather name="arrow-right" size={14} color="#1a1a1a" />}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const SectionHeader = memo(function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  colors,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  colors: any;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

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
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedHeaderTab, setSelectedHeaderTab] = useState('explore');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const [recommendedSectionY, setRecommendedSectionY] = useState(0);
  const isAuthReady = initialized && !authLoading && !!session?.access_token;
  const apiFilters = useMemo(() => ({
    platform: selectedPlatform === 'all' ? undefined : selectedPlatform,
  }), [selectedPlatform]);
  const { refreshing, handleRefresh } = useRefresh(async () => {
    if (!isAuthReady) return;
    await fetchCampaigns(apiFilters, true);
  });

  useEffect(() => {
    if (!isAuthReady) return;
    fetchCampaigns(apiFilters, true);
  }, [fetchCampaigns, apiFilters, isAuthReady]);

  const scrollToRecommended = useCallback(() => {
    if (scrollViewRef.current && recommendedSectionY > 0) {
      scrollViewRef.current.scrollTo({ y: recommendedSectionY - 10, animated: true });
    }
  }, [recommendedSectionY]);

  const openCampaigns = useMemo(() => {
    return campaigns.filter(c => c.status === 'ACTIVE');
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    let result = openCampaigns;
    
    if (selectedPlatform !== 'all') {
      result = result.filter(c => c.platform === selectedPlatform);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.brand.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [openCampaigns, selectedPlatform, searchQuery]);

  const recommendedCampaigns = useMemo(() => {
    return filteredCampaigns.slice(0, 3);
  }, [filteredCampaigns]);

  const closingSoonCampaigns = useMemo(() => {
    return [...filteredCampaigns]
      .sort((a, b) => (a.daysRemaining || 99) - (b.daysRemaining || 99))
      .slice(0, 3);
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.stickyHeader, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7}>
          <Avatar size={30} name="User" />
        </TouchableOpacity>
        <View style={styles.headerTabsContainer}>
          {headerTabs.map((tab) => (
            <HeaderTabButton
              key={tab.id}
              label={tab.label}
              isActive={selectedHeaderTab === tab.id}
              onPress={() => setSelectedHeaderTab(tab.id)}
              colors={colors}
              isDark={isDark}
            />
          ))}
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {selectedHeaderTab === 'explore' && (
          <>
            {!isAuthReady ? (
              <View style={styles.authPendingCard}>
                <Text style={[styles.authPendingTitle, { color: colors.text }]}>Signing you in...</Text>
                <Text style={[styles.authPendingSubtitle, { color: colors.textSecondary }]}>
                  We're getting your session ready.
                </Text>
              </View>
            ) : (
              <>
            <View style={styles.searchContainer}>
              <View style={[
                styles.searchBar, 
                { 
                  backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                }
              ]}>
                <Feather name="search" size={20} color={isDark ? 'rgba(255,255,255,0.5)' : '#666666'} />
                <TextInput
                  style={[styles.searchInput, { color: isDark ? '#ffffff' : '#1a1a1a' }]}
                  placeholder="Search campaigns, brands, categories..."
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : '#999999'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Feather name="x" size={18} color={isDark ? 'rgba(255,255,255,0.5)' : '#666666'} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity 
              style={[
                styles.campaignsBanner,
                {
                  backgroundColor: isDark ? '#1a2e2a' : colors.emeraldLight,
                  borderColor: isDark ? '#2a3f3a' : colors.emeraldBorder,
                }
              ]}
              activeOpacity={0.8}
              onPress={scrollToRecommended}
            >
              <View style={[
                styles.bannerIconContainer,
                { backgroundColor: isDark ? '#1f3d36' : 'rgba(5, 150, 105, 0.2)' }
              ]}>
                <Feather name="star" size={20} color={colors.emerald} />
              </View>
              <View style={styles.bannerContent}>
                <Text style={[styles.bannerTitle, { color: colors.text }]}>New Campaigns Available</Text>
                <Text style={[styles.bannerSubtitle, { color: colors.textSecondary }]}>
                  {filteredCampaigns.length} campaigns match your profile
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.section}>
              <SectionHeader
                title="All Campaigns"
                subtitle={`${filteredCampaigns.length} opportunities available`}
                colors={colors}
              />
              <View style={styles.filtersContainer}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filtersScroll}
                >
                  {platformFilters.map((filter) => (
                    <FilterChip
                      key={filter.id}
                      label={filter.label}
                      icon={filter.icon}
                      isActive={selectedPlatform === filter.id}
                      onPress={() => setSelectedPlatform(filter.id)}
                      colors={colors}
                    />
                  ))}
                </ScrollView>
              </View>
              {loadingCampaigns && filteredCampaigns.length === 0 ? (
                <>
                  <CampaignCardSkeleton />
                  <CampaignCardSkeleton />
                  <CampaignCardSkeleton />
                </>
              ) : error ? (
                <ErrorView error={error} onRetry={() => fetchCampaigns(apiFilters, true)} />
              ) : (
                filteredCampaigns.map((campaign) => {
                  const isApplied = campaign.userState === 'APPLIED' || !!getApplication(campaign.id);
                  return (
                    <CampaignCard
                      key={campaign.id}
                      campaign={campaign}
                      onPress={() => handleCampaignPress(campaign)}
                      onApply={() => handleApply(campaign.id)}
                      onSave={() => handleSave(campaign.id)}
                      isSaved={isCampaignSaved(campaign.id)}
                      isApplied={isApplied}
                      colors={colors}
                      isDark={isDark}
                    />
                  );
                })
              )}
            </View>

            <View 
              style={styles.section}
              onLayout={(event) => {
                const { y } = event.nativeEvent.layout;
                setRecommendedSectionY(y);
              }}
            >
              <SectionHeader
                title="Recommended For You"
                subtitle="Based on your profile and interests"
                colors={colors}
              />
              {recommendedCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onPress={() => handleCampaignPress(campaign)}
                  onApply={() => handleApply(campaign.id)}
                  onSave={() => handleSave(campaign.id)}
                  isSaved={isCampaignSaved(campaign.id)}
                  isApplied={campaign.userState === 'APPLIED' || !!getApplication(campaign.id)}
                  colors={colors}
                  isDark={isDark}
                />
              ))}
            </View>
            </>
            )}
          </>
        )}

        {selectedHeaderTab === 'gigx' && (
          <View style={styles.tabContentContainer}>
            <View style={styles.tabContentIcon}>
              <Feather name="briefcase" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.tabContentTitle, { color: colors.text }]}>GigX Campaigns</Text>
            <Text style={[styles.tabContentSubtitle, { color: colors.textSecondary }]}>
              Find gig task-based campaigns and short-term opportunities
            </Text>
            <View style={[styles.comingSoonBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.comingSoonText, { color: colors.primary }]}>Coming Soon</Text>
            </View>
          </View>
        )}

        {selectedHeaderTab === 'performancex' && (
          <View style={styles.tabContentContainer}>
            <View style={styles.tabContentIcon}>
              <Feather name="trending-up" size={48} color={colors.primary} />
            </View>
            <Text style={[styles.tabContentTitle, { color: colors.text }]}>PerformanceX Campaigns</Text>
            <Text style={[styles.tabContentSubtitle, { color: colors.textSecondary }]}>
              Discover performance marketing campaigns with measurable results
            </Text>
            <View style={[styles.comingSoonBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.comingSoonText, { color: colors.primary }]}>Coming Soon</Text>
            </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.md,
    zIndex: 100,
  },
  headerTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTabButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTabButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 15,
    fontWeight: '400',
  },
  authPendingCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  authPendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  authPendingSubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  filtersContainer: {
    marginBottom: spacing.md,
  },
  filtersScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
  },
  campaignsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  bannerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionAction: {
    fontSize: 14,
    fontWeight: '500',
  },
  campaignCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTopSection: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  cardImage: {
    width: 100,
    height: 120,
    borderRadius: borderRadius.md,
    resizeMode: 'cover',
  },
  cardTopContent: {
    flex: 1,
  },
  cardTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandInitial: {
    fontSize: 10,
    fontWeight: '600',
  },
  brandNameText: {
    fontSize: 13,
    fontWeight: '400',
  },
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  tagChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '400',
  },
  contentTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentTypeText: {
    fontSize: 12,
    fontWeight: '400',
  },
  platformIcons: {
    flexDirection: 'row',
    gap: -4,
  },
  platformIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  cardMiddleSection: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderTopWidth: 1,
  },
  statsColumn: {
    flex: 1,
    alignItems: 'flex-start',
  },
  statsLabel: {
    fontSize: 11,
    marginBottom: 2,
    fontWeight: '400',
  },
  statsValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsDivider: {
    width: 1,
    marginHorizontal: spacing.sm,
  },
  cardBottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  paidText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paidDivider: {
    width: 1,
    height: 12,
  },
  paidAmount: {
    fontSize: 12,
    fontWeight: '500',
  },
  endsInText: {
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
  },
  endsInBold: {
    fontWeight: '600',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  applyButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabContentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl * 3,
  },
  tabContentIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  tabContentTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  tabContentSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  comingSoonBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  comingSoonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

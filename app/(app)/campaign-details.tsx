import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/hooks';
import { useApp } from '@/src/context';
import { useAuth } from '@/src/context/AuthContext';
import { API_BASE_URL_READY } from '@/src/config/env';
import { Campaign } from '@/src/types';

const fallbackDeliverables = [
  { id: '1', icon: 'video', title: '1x Feed Post', description: 'Main content post' },
  { id: '2', icon: 'link', title: 'Link in Bio', description: 'Add tracking link for 48 hours' },
];

const fallbackDos = ['Follow campaign guidelines', 'Submit on time'];
const fallbackDonts = ['Use competitor products', 'Miss deadlines'];

export default function CampaignDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ campaignId?: string | string[] }>();
  const campaignId = typeof params.campaignId === 'string' ? params.campaignId : params.campaignId?.[0];
  const { colors, isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const {
    getCampaignById,
    fetchCampaignById,
    saveCampaign,
    unsaveCampaign,
    isCampaignSaved,
    getApplication,
  } = useApp();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!campaignId) {
        if (isMounted) setError('Campaign not found.');
        return;
      }

      const cached = getCampaignById(campaignId);
      if (cached && isMounted) {
        setCampaign(cached);
      }

      if (!API_BASE_URL_READY) {
        if (!cached && isMounted) setError('Campaigns unavailable in degraded mode.');
        return;
      }

      if (!isAuthenticated && !cached) {
        if (isMounted) setError('Login required to view campaign.');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const fresh = await fetchCampaignById(campaignId);
        if (!isMounted) return;
        if (fresh) {
          setCampaign(fresh);
        } else if (!cached) {
          setError('Campaign not found.');
        }
      } catch (err) {
        if (isMounted) setError('Failed to load campaign.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [campaignId, fetchCampaignById, getCampaignById, isAuthenticated]);

  const handleApply = useCallback(() => {
    if (!campaign) return;
    if (!API_BASE_URL_READY) {
      Alert.alert('Unavailable', 'Campaigns are unavailable in degraded mode.');
      return;
    }
    if (!isAuthenticated) {
      Alert.alert('Login required', 'Please login to apply.');
      return;
    }

    router.push({
      pathname: '/apply-to-campaign',
      params: { campaignId: campaign.id },
    });
  }, [campaign, isAuthenticated, router]);

  const handleSave = useCallback(async () => {
    if (!campaign) return;
    if (isCampaignSaved(campaign.id)) {
      await unsaveCampaign(campaign.id);
    } else {
      await saveCampaign(campaign.id);
    }
  }, [campaign, isCampaignSaved, saveCampaign, unsaveCampaign]);

  const handleShare = useCallback(() => {}, []);

  const isApplied = campaign
    ? campaign.userState === 'APPLIED' || !!getApplication(campaign.id)
    : false;

  const deliverables = campaign?.mandatoryDeliverables?.length
    ? campaign.mandatoryDeliverables.map((item) => ({
        id: item.id,
        icon: item.type?.toLowerCase().includes('video') ? 'video' : 'file-text',
        title: `${item.quantity}x ${item.type}`,
        description: item.description,
      }))
    : fallbackDeliverables;

  if (loading && !campaign) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#101322' : colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading campaign…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !campaign) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#101322' : colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>{error || 'Campaign not found.'}</Text>
          <TouchableOpacity style={[styles.retryButton, { borderColor: colors.primary }]} onPress={() => router.back()}>
            <Text style={[styles.retryText, { color: colors.primary }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#101322' : colors.background }]}>
      <View style={[styles.header, { backgroundColor: isDark ? 'rgba(16, 19, 34, 0.85)' : 'rgba(255, 255, 255, 0.8)' }]}> 
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Feather name="share" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
            <Feather
              name={isCampaignSaved(campaign.id) ? 'bookmark' : 'bookmark'}
              size={20}
              color={isCampaignSaved(campaign.id) ? colors.primary : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: campaign.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)', isDark ? '#101322' : '#ffffff']}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <View style={[styles.brandPill, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
            >
              <View style={styles.brandAvatar}>
                <Text style={styles.brandAvatarText}>{campaign.brand.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.brandName}>{campaign.brand}</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>{campaign.title}</Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          {(campaign.tags?.length ? campaign.tags : ['Paid Partnership']).map((tag, index) => (
            <View
              key={`${tag}-${index}`}
              style={[
                styles.tag,
                tag === 'Paid Partnership'
                  ? { backgroundColor: 'rgba(19, 55, 236, 0.1)', borderColor: 'rgba(19, 55, 236, 0.2)' }
                  : { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  { color: tag === 'Paid Partnership' ? colors.primary : colors.text },
                ]}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.infoRow}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Budget</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{campaign.budget}</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Deadline</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{campaign.deadline}</Text>
          </View>
        </View>

        {(campaign.escrowStatus === 'FUNDED' || campaign.isPaid) && (
          <View style={[styles.escrowBadge, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.25)' }]}>
            <Feather name="shield" size={16} color="#10b981" />
            <Text style={styles.escrowBadgeText}>Payment Secured in Escrow</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Campaign Overview</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}
          >
            {campaign.description || campaign.brief || 'Campaign details will appear here.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Deliverables</Text>
          {deliverables.map((deliverable) => (
            <View key={deliverable.id} style={[styles.deliverableCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={[styles.deliverableIcon, { backgroundColor: 'rgba(19, 55, 236, 0.15)' }]}
              >
                <Feather name={deliverable.icon as any} size={16} color={colors.primary} />
              </View>
              <View>
                <Text style={[styles.deliverableTitle, { color: colors.text }]}>{deliverable.title}</Text>
                <Text style={[styles.deliverableSubtitle, { color: colors.textSecondary }]}
                >
                  {deliverable.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Do's</Text>
          {(campaign.requirements?.length ? campaign.requirements : fallbackDos).map((item, index) => (
            <View key={`do-${index}`} style={styles.listRow}>
              <Feather name="check-circle" size={16} color={colors.primary} />
              <Text style={[styles.listText, { color: colors.textSecondary }]}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Don'ts</Text>
          {fallbackDonts.map((item, index) => (
            <View key={`dont-${index}`} style={styles.listRow}>
              <Feather name="x-circle" size={16} color="#ef4444" />
              <Text style={[styles.listText, { color: colors.textSecondary }]}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.cardBorder, backgroundColor: isDark ? 'rgba(16, 19, 34, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}
      >
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: isApplied ? colors.cardBorder : colors.primary }]}
          onPress={isApplied ? undefined : handleApply}
          disabled={isApplied}
        >
          <Text style={styles.applyText}>{isApplied ? 'Application Submitted' : 'Apply Now'}</Text>
          {!isApplied && <Feather name="send" size={16} color="#fff" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 999,
  },
  headerRight: {
    flexDirection: 'row',
  },
  scrollContent: {
    paddingBottom: 140,
  },
  heroContainer: {
    height: 320,
    width: '100%',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  brandAvatar: {
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandAvatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  brandName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  tag: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  infoCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  deliverableCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  deliverableIcon: {
    height: 36,
    width: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliverableTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  deliverableSubtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  listRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  listText: {
    fontSize: 13,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 24,
  },
  applyButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '700',
  },
  escrowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  escrowBadgeText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '700',
  },
});

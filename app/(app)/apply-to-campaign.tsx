import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/src/hooks';
import { useApp } from '@/src/context';
import { useAuth } from '@/src/context/AuthContext';
import { API_BASE_URL_READY } from '@/src/config/env';
import { Campaign } from '@/src/types';

export default function ApplyToCampaignScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ campaignId?: string | string[] }>();
  const campaignId = typeof params.campaignId === 'string' ? params.campaignId : params.campaignId?.[0];
  const { colors, isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const {
    getCampaignById,
    fetchCampaignById,
    applyCampaign,
    fetchApplications,
    fetchCampaigns,
    getApplication,
  } = useApp();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [pitch, setPitch] = useState('');
  const [fee, setFee] = useState('');
  const [portfolio, setPortfolio] = useState('');

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
        if (isMounted) setError('Login required to apply.');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const fresh = await fetchCampaignById(campaignId);
        if (isMounted) {
          setCampaign(fresh ?? cached ?? null);
          if (!fresh && !cached) setError('Campaign not found.');
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

  const handleSubmit = async () => {
    if (!campaignId || !campaign) return;
    if (!API_BASE_URL_READY) {
      Alert.alert('Unavailable', 'Campaigns are unavailable in degraded mode.');
      return;
    }
    if (!isAuthenticated) {
      Alert.alert('Login required', 'Please login to apply.');
      return;
    }
    if (pitch.trim().length < 50) {
      setError('Pitch should be at least 50 characters.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await applyCampaign(campaignId, {
        pitch: pitch.trim(),
        expectedTimeline: 'Custom',
        extraDetails: [
          fee.trim() ? `Proposed fee: $${fee.trim()}` : null,
          portfolio.trim() ? `Portfolio: ${portfolio.trim()}` : null,
        ]
          .filter(Boolean)
          .join(' | '),
      });
      await Promise.all([fetchApplications(), fetchCampaigns({}, true)]);
      router.replace({ pathname: '/campaign-details', params: { campaignId } });
    } catch (err) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const isApplied = campaign
    ? campaign.userState === 'APPLIED' || !!getApplication(campaign.id)
    : false;

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

  if (error && !campaign) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#101322' : colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { borderColor: colors.primary }]} onPress={handleBack}>
            <Text style={[styles.retryText, { color: colors.primary }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#101322' : colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.cardBorder, backgroundColor: isDark ? 'rgba(16, 19, 34, 0.9)' : 'rgba(255, 255, 255, 0.9)' }]}
      >
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Apply to Campaign</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {campaign && (
          <View style={[styles.summaryCard, { backgroundColor: isDark ? '#1c1d27' : colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.summaryInfo}>
              <View style={styles.brandRow}>
                <View style={styles.brandAvatar}>
                  <Text style={styles.brandInitial}>{campaign.brand.charAt(0)}</Text>
                </View>
                <Text style={[styles.brandText, { color: colors.textSecondary }]}>{campaign.brand}</Text>
              </View>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>{campaign.title}</Text>
              <View style={styles.summaryTags}>
                <View style={[styles.tagPill, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}
                >
                  <Text style={[styles.tagText, { color: '#22c55e' }]}>{campaign.budget}</Text>
                </View>
                <View style={[styles.tagPill, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}
                >
                  <Text style={[styles.tagText, { color: '#a855f7' }]}>{campaign.platform}</Text>
                </View>
              </View>
            </View>
            <Image source={{ uri: campaign.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800' }} style={styles.summaryImage} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Pitch</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Why are you the perfect fit for this campaign?
          </Text>
        </View>

        <TextInput
          style={[styles.pitchInput, { backgroundColor: isDark ? '#1c1d27' : colors.card, color: colors.text }]}
          placeholder="Share a short pitch (50+ characters)"
          placeholderTextColor={colors.textMuted}
          value={pitch}
          onChangeText={setPitch}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <View style={styles.inputGrid}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Proposed Fee</Text>
            <View style={[styles.inputField, { backgroundColor: isDark ? '#1c1d27' : colors.card }]}
            >
              <Text style={[styles.inputPrefix, { color: colors.textMuted }]}>$</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                keyboardType="number-pad"
                value={fee}
                onChangeText={setFee}
                placeholder="800"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Portfolio URL</Text>
            <View style={[styles.inputField, { backgroundColor: isDark ? '#1c1d27' : colors.card }]}
            >
              <Feather name="link" size={14} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={portfolio}
                onChangeText={setPortfolio}
                placeholder="creator.x/you"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.cardBorder, backgroundColor: isDark ? 'rgba(16, 19, 34, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}
      >
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: isApplied ? colors.cardBorder : colors.primary }]}
          onPress={isApplied || submitting ? undefined : handleSubmit}
          disabled={isApplied || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitText}>{isApplied ? 'Application Submitted' : 'Submit Application'}</Text>
              {!isApplied && <Feather name="send" size={16} color="#fff" />}
            </>
          )}
        </TouchableOpacity>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}
        >
          By submitting, you agree to the <Text style={styles.footerLink}>Creator Terms</Text>.
        </Text>
      </View>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  summaryCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  summaryInfo: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  brandInitial: {
    fontWeight: '700',
    color: '#3b82f6',
  },
  brandText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tagPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  summaryImage: {
    width: 96,
    height: 96,
    borderRadius: 16,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    marginTop: 6,
    fontSize: 12,
  },
  pitchInput: {
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
    fontSize: 13,
    marginBottom: 16,
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputField: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inputPrefix: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 13,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    padding: 16,
  },
  submitButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 11,
  },
  footerLink: {
    fontWeight: '600',
    color: '#2563eb',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
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
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
    marginTop: -4,
  },
});

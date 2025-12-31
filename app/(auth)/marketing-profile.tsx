import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { colors } from '@/src/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: '@onboarding_complete_creator',
  CREATOR_PROFILE: '@creator_profile',
  MARKETING_PROFILE: '@marketing_profile',
};

interface RateCard {
  instagramPost: string;
  instagramReel: string;
  instagramStory: string;
  youtubeVideo: string;
  youtubeShort: string;
}

interface EngagementMetrics {
  avgLikes: string;
  avgComments: string;
  avgViews: string;
  engagementRate: string;
}

const DELIVERABLE_TYPES = [
  { key: 'instagramPost', label: 'Instagram Post', icon: 'image' },
  { key: 'instagramReel', label: 'Instagram Reel', icon: 'film' },
  { key: 'instagramStory', label: 'Instagram Story', icon: 'circle' },
  { key: 'youtubeVideo', label: 'YouTube Video', icon: 'youtube' },
  { key: 'youtubeShort', label: 'YouTube Short', icon: 'smartphone' },
] as const;

export default function MarketingProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [step, setStep] = useState<'rates' | 'engagement'>('rates');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [enabledDeliverables, setEnabledDeliverables] = useState<Record<string, boolean>>({
    instagramPost: true,
    instagramReel: true,
    instagramStory: false,
    youtubeVideo: false,
    youtubeShort: false,
  });

  const [rateCard, setRateCard] = useState<RateCard>({
    instagramPost: '',
    instagramReel: '',
    instagramStory: '',
    youtubeVideo: '',
    youtubeShort: '',
  });

  const [engagement, setEngagement] = useState<EngagementMetrics>({
    avgLikes: '',
    avgComments: '',
    avgViews: '',
    engagementRate: '',
  });

  const hasAtLeastOneRate = Object.entries(enabledDeliverables).some(
    ([key, enabled]) => enabled && rateCard[key as keyof RateCard]
  );

  const hasEngagementData = engagement.avgLikes || engagement.avgViews || engagement.engagementRate;

  const handleToggleDeliverable = (key: string) => {
    setEnabledDeliverables((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRateChange = (key: keyof RateCard, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setRateCard((prev) => ({ ...prev, [key]: numericValue }));
  };

  const handleEngagementChange = (key: keyof EngagementMetrics, value: string) => {
    if (key === 'engagementRate') {
      const cleaned = value.replace(/[^0-9.]/g, '');
      setEngagement((prev) => ({ ...prev, [key]: cleaned }));
    } else {
      const numericValue = value.replace(/[^0-9]/g, '');
      setEngagement((prev) => ({ ...prev, [key]: numericValue }));
    }
  };

  const handleContinueToEngagement = () => {
    if (!hasAtLeastOneRate) {
      setError('Please add at least one rate');
      return;
    }
    setError('');
    setStep('engagement');
  };

  const handleBack = () => {
    if (step === 'engagement') {
      setStep('rates');
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const activeRates: Record<string, number> = {};
      Object.entries(enabledDeliverables).forEach(([key, enabled]) => {
        if (enabled && rateCard[key as keyof RateCard]) {
          activeRates[key] = parseInt(rateCard[key as keyof RateCard], 10);
        }
      });

      const marketingProfile = {
        rateCard: activeRates,
        engagement: {
          avgLikes: engagement.avgLikes ? parseInt(engagement.avgLikes, 10) : null,
          avgComments: engagement.avgComments ? parseInt(engagement.avgComments, 10) : null,
          avgViews: engagement.avgViews ? parseInt(engagement.avgViews, 10) : null,
          engagementRate: engagement.engagementRate ? parseFloat(engagement.engagementRate) : null,
        },
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.MARKETING_PROFILE, JSON.stringify(marketingProfile));

      const existingProfile = await AsyncStorage.getItem(STORAGE_KEYS.CREATOR_PROFILE);
      if (existingProfile) {
        const profile = JSON.parse(existingProfile);
        profile.marketingProfile = marketingProfile;
        await AsyncStorage.setItem(STORAGE_KEYS.CREATOR_PROFILE, JSON.stringify(profile));
      }

      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, '1');

      await new Promise((resolve) => setTimeout(resolve, 300));

      router.replace('/(app)/(tabs)/explore');
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    if (!value) return '';
    return `₹${parseInt(value, 10).toLocaleString('en-IN')}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Feather name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, step === 'rates' && styles.stepDotActive]} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, step === 'engagement' && styles.stepDotActive]} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {step === 'rates' ? (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Set Your Rates</Text>
                <Text style={styles.subtitle}>
                  Tell brands what you charge for different content types
                </Text>
              </View>

              <View style={styles.form}>
                {DELIVERABLE_TYPES.map((item) => (
                  <View key={item.key} style={styles.rateItem}>
                    <View style={styles.rateHeader}>
                      <View style={styles.rateLabel}>
                        <Feather name={item.icon as any} size={18} color={colors.textSecondary} />
                        <Text style={styles.rateLabelText}>{item.label}</Text>
                      </View>
                      <Switch
                        value={enabledDeliverables[item.key]}
                        onValueChange={() => handleToggleDeliverable(item.key)}
                        trackColor={{ false: colors.border, true: colors.primaryLight }}
                        thumbColor={enabledDeliverables[item.key] ? colors.primary : colors.textMuted}
                      />
                    </View>
                    {enabledDeliverables[item.key] && (
                      <View style={styles.rateInputContainer}>
                        <Text style={styles.currencyPrefix}>₹</Text>
                        <TextInput
                          style={styles.rateInput}
                          placeholder="Enter rate"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="number-pad"
                          value={rateCard[item.key as keyof RateCard]}
                          onChangeText={(v) => handleRateChange(item.key as keyof RateCard, v)}
                        />
                      </View>
                    )}
                  </View>
                ))}

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={[styles.submitButton, !hasAtLeastOneRate && styles.disabledButton]}
                  onPress={handleContinueToEngagement}
                  disabled={!hasAtLeastOneRate}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.violet]}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.submitText}>Continue</Text>
                    <Feather name="arrow-right" size={20} color={colors.text} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Engagement Stats</Text>
                <Text style={styles.subtitle}>
                  Help brands understand your reach and impact
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Average Likes per Post</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 5000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={engagement.avgLikes}
                    onChangeText={(v) => handleEngagementChange('avgLikes', v)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Average Comments per Post</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 200"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={engagement.avgComments}
                    onChangeText={(v) => handleEngagementChange('avgComments', v)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Average Views (Reels/Videos)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 50000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={engagement.avgViews}
                    onChangeText={(v) => handleEngagementChange('avgViews', v)}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Engagement Rate (%)</Text>
                  <View style={styles.percentInputContainer}>
                    <TextInput
                      style={styles.percentInput}
                      placeholder="e.g. 4.5"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      value={engagement.engagementRate}
                      onChangeText={(v) => handleEngagementChange('engagementRate', v)}
                    />
                    <Text style={styles.percentSuffix}>%</Text>
                  </View>
                  <Text style={styles.helperText}>
                    Engagement Rate = (Likes + Comments) / Followers × 100
                  </Text>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.violet]}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.text} />
                    ) : (
                      <>
                        <Text style={styles.submitText}>Complete Profile</Text>
                        <Feather name="check" size={20} color={colors.text} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipButton} onPress={handleSubmit} disabled={loading}>
                  <Text style={styles.skipText}>Skip for now</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 70,
    gap: 8,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    gap: 16,
  },
  rateItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
  },
  rateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rateLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rateLabelText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  rateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyPrefix: {
    paddingLeft: 12,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  rateInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
  },
  percentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  percentInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
  },
  percentSuffix: {
    paddingRight: 16,
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  errorText: {
    color: colors.red,
    fontSize: 14,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

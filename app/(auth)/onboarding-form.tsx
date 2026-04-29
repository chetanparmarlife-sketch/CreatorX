import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { colors } from '@/src/theme';
type PlatformId = 'instagram' | 'youtube' | 'linkedin' | 'facebook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '@/src/api/client';

const STORAGE_KEYS = {
  CREATOR_PROFILE: '@creator_profile',
};

const PLATFORM_LABELS: Record<PlatformId, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
};

const CATEGORIES = [
  'Fashion & Lifestyle',
  'Tech & Gaming',
  'Beauty & Skincare',
  'Food & Cooking',
  'Travel',
  'Fitness & Health',
  'Entertainment',
  'Education',
  'Business',
  'Other',
];

export default function OnboardingFormScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    platform: string;
    followerCount: string;
    handle: string;
  }>();

  const resolvedPlatform = (params.platform as PlatformId) || 'instagram';
  const followerCount = params.followerCount || '0';
  const initialHandle = params.handle || '';

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [socialHandle, setSocialHandle] = useState(initialHandle);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>(resolvedPlatform);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = fullName.trim() && phoneNumber.length >= 10 && selectedCategories.length > 0;

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, category];
    });
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    setError('');

    try {
      const creatorProfile = {
        fullName,
        phoneNumber,
        city: city || null,
        category: selectedCategories.join(', '),
        primaryPlatform: selectedPlatform,
        socialHandle: socialHandle || initialHandle,
        followerCount: parseInt(followerCount, 10),
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.CREATOR_PROFILE, JSON.stringify(creatorProfile));

      try {
        // Save onboarding profile to backend so data persists across devices and reinstalls.
        // This was previously saving to AsyncStorage only, so data was lost on reinstall.
        await apiClient.put('/profile', {
          fullName: creatorProfile.fullName,
          displayName: creatorProfile.fullName,
          bio,
          location: creatorProfile.city,
          city: creatorProfile.city,
          phone: creatorProfile.phoneNumber,
          phoneNumber: creatorProfile.phoneNumber,
          niche: creatorProfile.category,
          category: creatorProfile.category,
          primaryPlatform: creatorProfile.primaryPlatform,
          socialHandle: creatorProfile.socialHandle,
          followerCount: creatorProfile.followerCount,
        });
      } catch (error) {
        // Non-fatal: local cache still lets onboarding continue and profile can sync on next edit.
        console.error('Onboarding profile sync failed:', error);
      }

      router.push('/(auth)/onboarding-social');
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    router.push('/(auth)/onboarding-social');
  };

  const getPlatformDisplayName = (platform: PlatformId) => PLATFORM_LABELS[platform] ?? platform;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0c0f1c', '#101322', '#0a0c16']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.stepText}>Step 1 of 3</Text>
        <TouchableOpacity style={styles.skipButtonHeader} onPress={handleSkip}>
          <Text style={styles.skipTextHeader}>Skip</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.progressRow}>
        <View style={[styles.progressPill, styles.progressActive]} />
        <View style={styles.progressPill} />
        <View style={styles.progressPill} />
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
          <View style={styles.intro}>
            <Text style={styles.title}>
              Let's define <Text style={styles.titleHighlight}>your style.</Text>
            </Text>
            <Text style={styles.subtitle}>
              Select the categories that best describe your content. This helps brands find you for relevant campaigns.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Niche (Max 3)</Text>
            <View style={styles.chipsRow}>
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategories.includes(category);
                return (
                  <TouchableOpacity
                    key={category}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => toggleCategory(category)}
                    activeOpacity={0.85}
                  >
                    {isSelected && <Feather name="check" size={14} color={colors.primary} />}
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Primary Platforms</Text>
              <Feather name="info" size={16} color={colors.textMuted} />
            </View>
            <View style={styles.platformList}>
              {([
                { id: 'instagram', label: 'Instagram', icon: 'instagram' },
                { id: 'youtube', label: 'YouTube', icon: 'youtube' },
                { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
              ] as const).map((platform) => {
                const isSelected = selectedPlatform === platform.id;
                const handleSelect = () => {
                  if (platform.id === 'youtube') {
                    Alert.alert('Coming soon', 'YouTube connection will be available soon.');
                    return;
                  }
                  setSelectedPlatform(platform.id);
                };
                return (
                  <TouchableOpacity
                    key={platform.id}
                    style={[styles.platformCard, isSelected && styles.platformCardActive]}
                    onPress={handleSelect}
                    activeOpacity={0.85}
                  >
                    <View style={styles.platformInfo}>
                      <View style={[styles.platformIcon, isSelected && styles.platformIconActive]}>
                        <Feather name={platform.icon} size={18} color={isSelected ? colors.primary : colors.textSecondary} />
                      </View>
                      <View>
                        <Text style={styles.platformTitle}>{platform.label}</Text>
                        <Text style={styles.platformSubtitle}>
                          {isSelected ? 'Connected' : 'Connect account'}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.platformCheck, isSelected && styles.platformCheckActive]}>
                      {isSelected && <Feather name="check" size={14} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Short Bio</Text>
            <Text style={styles.sectionSubtitle}>A one-liner to introduce yourself to brands.</Text>
            <TextInput
              style={styles.bioInput}
              placeholder="e.g. Creating daily tech reviews for Gen Z..."
              placeholderTextColor={colors.textMuted}
              value={bio}
              onChangeText={setBio}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Details</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.phoneContainer}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Phone number"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  maxLength={10}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>City (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your city"
                placeholderTextColor={colors.textMuted}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Social Handle</Text>
              <TextInput
                style={styles.input}
                placeholder={`Your ${getPlatformDisplayName(selectedPlatform)} handle`}
                placeholderTextColor={colors.textMuted}
                value={socialHandle}
                onChangeText={setSocialHandle}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <LinearGradient
            colors={['rgba(16,19,34,0)', '#101322', '#101322']}
            style={styles.footerGradient}
          />
          <TouchableOpacity
            style={[styles.submitButton, !isValid && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading || !isValid}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitText}>Continue</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  skipButtonHeader: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  skipTextHeader: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  progressPill: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressActive: {
    backgroundColor: colors.primary,
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
    paddingBottom: 160,
  },
  intro: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  titleHighlight: {
    color: colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(19, 55, 236, 0.15)',
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 12,
  },
  platformList: {
    gap: 12,
  },
  platformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  platformCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(19, 55, 236, 0.12)',
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginRight: 12,
  },
  platformIconActive: {
    backgroundColor: 'rgba(19, 55, 236, 0.18)',
  },
  platformTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  platformSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  platformCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformCheckActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  bioInput: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 14,
  },
  inputGroup: {
    gap: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 14,
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCode: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  countryCodeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 14,
  },
  errorText: {
    color: colors.red,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 24,
  },
  footerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -40,
    height: 120,
  },
  submitButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  disabledButton: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { colors } from '@/src/theme';
import { getPlatformDisplayName, SocialPlatform } from '@/src/services/socialConnectMock';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: '@onboarding_complete_creator',
  CREATOR_PROFILE: '@creator_profile',
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

  const platform = params.platform as SocialPlatform;
  const followerCount = params.followerCount || '0';
  const initialHandle = params.handle || '';

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [socialHandle, setSocialHandle] = useState(initialHandle);
  const [showCategories, setShowCategories] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isValid = fullName.trim() && phoneNumber.length >= 10 && category;

  const handleSubmit = async () => {
    if (!isValid) return;

    setLoading(true);
    setError('');

    try {
      const creatorProfile = {
        fullName,
        phoneNumber,
        city: city || null,
        category,
        primaryPlatform: platform,
        socialHandle: socialHandle || initialHandle,
        followerCount: parseInt(followerCount, 10),
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEYS.CREATOR_PROFILE, JSON.stringify(creatorProfile));

      await new Promise((resolve) => setTimeout(resolve, 300));

      router.push('/(auth)/marketing-profile');
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
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
          <View style={styles.header}>
            <Text style={styles.title}>Complete your profile</Text>
            <Text style={styles.subtitle}>
              Tell us more about yourself to get started
            </Text>
          </View>

          <View style={styles.connectedBadge}>
            <Feather name="check-circle" size={16} color={colors.emerald} />
            <Text style={styles.connectedText}>
              {getPlatformDisplayName(platform)} connected
            </Text>
          </View>

          <View style={styles.form}>
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
              <Text style={styles.label}>Category / Niche *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowCategories(!showCategories)}
              >
                <Text style={category ? styles.selectText : styles.selectPlaceholder}>
                  {category || 'Select your niche'}
                </Text>
                <Feather
                  name={showCategories ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
              {showCategories && (
                <View style={styles.dropdown}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.dropdownItem, category === cat && styles.dropdownItemSelected]}
                      onPress={() => {
                        setCategory(cat);
                        setShowCategories(false);
                      }}
                    >
                      <Text style={[styles.dropdownText, category === cat && styles.dropdownTextSelected]}>
                        {cat}
                      </Text>
                      {category === cat && (
                        <Feather name="check" size={18} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Social Handle</Text>
              <TextInput
                style={styles.input}
                placeholder={`Your ${getPlatformDisplayName(platform)} handle`}
                placeholderTextColor={colors.textMuted}
                value={socialHandle}
                onChangeText={setSocialHandle}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.submitButton, !isValid && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading || !isValid}
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
                    <Text style={styles.submitText}>Complete Setup</Text>
                    <Feather name="arrow-right" size={20} color={colors.text} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
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
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.emeraldLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  connectedText: {
    color: colors.emerald,
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    gap: 20,
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
  phoneContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  countryCode: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  countryCodeText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectText: {
    color: colors.text,
    fontSize: 16,
  },
  selectPlaceholder: {
    color: colors.textMuted,
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: colors.primaryLight,
  },
  dropdownText: {
    color: colors.text,
    fontSize: 16,
  },
  dropdownTextSelected: {
    color: colors.primary,
    fontWeight: '500',
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
});

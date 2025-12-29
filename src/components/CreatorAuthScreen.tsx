import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Animated, ActivityIndicator, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, borderRadius } from '@/src/theme';
import { SocialAccount, CreatorProfile, AudienceStats, PricingInfo } from '@/src/types';

type AuthStep = 'login' | 'verifying' | 'eligible' | 'ineligible' | 'profile';
type SocialPlatform = 'instagram' | 'youtube' | 'linkedin';

interface CreatorAuthScreenProps {
  onAuthenticate: (profile: CreatorProfile) => void;
  onSkip: () => void;
}

const MINIMUM_FOLLOWERS = 1000;

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
      fill="#fff"
    />
  </Svg>
);

const YouTubeIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
      fill="#fff"
    />
  </Svg>
);

const LinkedInIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      fill="#fff"
    />
  </Svg>
);

const renderPlatformIcon = (platform: SocialPlatform, size: number = 20) => {
  switch (platform) {
    case 'instagram':
      return <InstagramIcon size={size} />;
    case 'youtube':
      return <YouTubeIcon size={size} />;
    case 'linkedin':
      return <LinkedInIcon size={size} />;
  }
};

export function CreatorAuthScreen({ onAuthenticate, onSkip }: CreatorAuthScreenProps) {
  const [step, setStep] = useState<AuthStep>('login');
  const [connectedAccounts, setConnectedAccounts] = useState<SocialAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState<SocialPlatform | null>(null);
  const [verificationResult, setVerificationResult] = useState<{ eligible: boolean; followers: number } | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const simulateOAuthAndGetFollowers = async (platform: SocialPlatform): Promise<SocialAccount> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockData: Record<SocialPlatform, { username: string; followers: number }> = {
      instagram: { username: '@creator_handle', followers: Math.floor(Math.random() * 50000) + 1500 },
      youtube: { username: 'Creator Channel', followers: Math.floor(Math.random() * 80000) + 2000 },
      linkedin: { username: 'Creator Name', followers: Math.floor(Math.random() * 10000) + 500 },
    };
    
    return {
      platform,
      username: mockData[platform].username,
      followers: mockData[platform].followers,
      connected: true,
    };
  };

  const handleSocialConnect = async (platform: SocialPlatform) => {
    if (connectedAccounts.find(a => a.platform === platform)) {
      return;
    }

    setIsConnecting(platform);
    
    try {
      const account = await simulateOAuthAndGetFollowers(platform);
      const newAccounts = [...connectedAccounts, account];
      setConnectedAccounts(newAccounts);
      
      setStep('verifying');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const totalFollowers = newAccounts.reduce((sum, a) => sum + a.followers, 0);
      const isEligible = totalFollowers >= MINIMUM_FOLLOWERS;
      
      setVerificationResult({ eligible: isEligible, followers: totalFollowers });
      setStep(isEligible ? 'eligible' : 'ineligible');
      
    } catch (error) {
      Alert.alert('Connection Failed', 'Unable to connect to the platform. Please try again.');
    } finally {
      setIsConnecting(null);
    }
  };

  const handleContinueToProfile = () => {
    setStep('profile');
  };

  const handleProfileComplete = (profile: CreatorProfile) => {
    onAuthenticate(profile);
  };

  const renderSocialButton = (platform: SocialPlatform, label: string) => {
    const isConnected = connectedAccounts.find(a => a.platform === platform);
    const isLoading = isConnecting === platform;
    
    const buttonContent = (
      <>
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <View style={styles.brandIconContainer}>
              {renderPlatformIcon(platform, 22)}
            </View>
            <Text style={styles.socialButtonText}>
              {isConnected ? `${isConnected.followers.toLocaleString()} followers` : label}
            </Text>
            {isConnected && (
              <View style={styles.connectedCheckContainer}>
                <Feather name="check-circle" size={20} color="#fff" />
              </View>
            )}
          </>
        )}
      </>
    );

    if (platform === 'instagram') {
      return (
        <TouchableOpacity
          key={platform}
          style={[styles.socialButton, isConnected && styles.socialButtonConnected]}
          onPress={() => handleSocialConnect(platform)}
          disabled={!!isConnected || !!isConnecting}
          activeOpacity={0.8}
          data-testid={`button-connect-${platform}`}
        >
          <LinearGradient
            colors={isConnected ? [colors.emerald, '#059669'] : ['#833AB4', '#FD1D1D', '#F77737', '#FCAF45']}
            style={styles.socialButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {buttonContent}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    const bgColor = platform === 'youtube' ? '#FF0000' : '#0077B5';
    
    return (
      <TouchableOpacity
        key={platform}
        style={[styles.socialButton, isConnected && styles.socialButtonConnected]}
        onPress={() => handleSocialConnect(platform)}
        disabled={!!isConnected || !!isConnecting}
        activeOpacity={0.8}
        data-testid={`button-connect-${platform}`}
      >
        <View style={[styles.socialButtonInner, { backgroundColor: isConnected ? colors.emerald : bgColor }]}>
          {buttonContent}
        </View>
      </TouchableOpacity>
    );
  };

  const renderLoginStep = () => (
    <>
      <View style={styles.header}>
        <LinearGradient
          colors={[colors.primary, colors.violet]}
          style={styles.logoGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name="zap" size={28} color={colors.text} />
        </LinearGradient>
        <Text style={styles.title}>Join CreatorX</Text>
        <Text style={styles.subtitle}>Connect your social account to get started</Text>
      </View>

      <View style={styles.form}>
        {renderSocialButton('instagram', 'Instagram')}
        {renderSocialButton('youtube', 'YouTube')}
        {renderSocialButton('linkedin', 'LinkedIn')}

        <View style={styles.requirementNote}>
          <Feather name="info" size={14} color={colors.textMuted} />
          <Text style={styles.requirementText}>
            Minimum {MINIMUM_FOLLOWERS.toLocaleString()} followers required to join
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Choose a platform to connect</Text>
      </View>
    </>
  );

  const renderVerifyingStep = () => (
    <View style={styles.centerContent}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.verifyingTitle}>Verifying Your Account</Text>
      <Text style={styles.verifyingSubtitle}>Checking your follower count...</Text>
    </View>
  );

  const renderEligibleStep = () => (
    <View style={styles.centerContent}>
      <LinearGradient
        colors={[colors.emerald, '#059669']}
        style={styles.resultIcon}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Feather name="check" size={40} color="#fff" />
      </LinearGradient>
      <Text style={styles.eligibleTitle}>You're Eligible!</Text>
      <Text style={styles.eligibleSubtitle}>
        With {verificationResult?.followers.toLocaleString()} followers, you qualify for brand collaborations.
      </Text>
      
      <View style={styles.connectedAccountsContainer}>
        {connectedAccounts.map(account => (
          <View key={account.platform} style={styles.connectedAccountBadge}>
            <View style={styles.smallPlatformIcon}>
              {renderPlatformIcon(account.platform, 14)}
            </View>
            <Text style={styles.connectedAccountText}>
              {account.followers.toLocaleString()} followers
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinueToProfile}
        activeOpacity={0.8}
        data-testid="button-continue-profile"
      >
        <LinearGradient
          colors={[colors.primary, colors.violet]}
          style={styles.continueButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.continueButtonText}>Create Your Profile</Text>
          <Feather name="arrow-right" size={20} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderIneligibleStep = () => (
    <View style={styles.centerContent}>
      <View style={styles.ineligibleIcon}>
        <Feather name="x" size={40} color={colors.red} />
      </View>
      <Text style={styles.ineligibleTitle}>You're not eligible for collaborations yet.</Text>
      <Text style={styles.ineligibleSubtitle}>
        You currently have {verificationResult?.followers.toLocaleString()} followers. 
        You need at least {MINIMUM_FOLLOWERS.toLocaleString()} followers to access brand collaborations.
      </Text>
      
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>How to qualify:</Text>
        <View style={styles.tipItem}>
          <Feather name="trending-up" size={16} color={colors.primary} />
          <Text style={styles.tipText}>Grow your following across platforms</Text>
        </View>
        <View style={styles.tipItem}>
          <Feather name="users" size={16} color={colors.primary} />
          <Text style={styles.tipText}>Connect additional social accounts</Text>
        </View>
        <View style={styles.tipItem}>
          <Feather name="refresh-cw" size={16} color={colors.primary} />
          <Text style={styles.tipText}>Come back when you reach 1,000 followers</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.tryAgainButton}
        onPress={() => {
          setStep('login');
          setConnectedAccounts([]);
          setVerificationResult(null);
        }}
        activeOpacity={0.8}
        data-testid="button-try-again"
      >
        <Text style={styles.tryAgainButtonText}>Connect Another Account</Text>
      </TouchableOpacity>
    </View>
  );

  const renderProfileStep = () => (
    <ProfileCreationForm 
      onComplete={handleProfileComplete}
      connectedAccounts={connectedAccounts}
      totalFollowers={verificationResult?.followers || 0}
    />
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 'login' && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={onSkip}
              activeOpacity={0.7}
              data-testid="button-skip-auth"
            >
              <Text style={styles.skipText}>Skip</Text>
              <Feather name="arrow-right" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {step === 'login' && renderLoginStep()}
            {step === 'verifying' && renderVerifyingStep()}
            {step === 'eligible' && renderEligibleStep()}
            {step === 'ineligible' && renderIneligibleStep()}
            {step === 'profile' && renderProfileStep()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

interface ProfileCreationFormProps {
  onComplete: (profile: CreatorProfile) => void;
  connectedAccounts: SocialAccount[];
  totalFollowers: number;
}

const niches = ['Fashion', 'Tech', 'Food', 'Fitness', 'Travel', 'Beauty', 'Lifestyle', 'Entertainment', 'Education', 'Business'];

function ProfileCreationForm({ onComplete, connectedAccounts, totalFollowers }: ProfileCreationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('');
  const [postRate, setPostRate] = useState('');
  const [storyRate, setStoryRate] = useState('');
  const [videoRate, setVideoRate] = useState('');
  const [engagementRate, setEngagementRate] = useState('');
  const [ageRange, setAgeRange] = useState('18-34');
  const [gender, setGender] = useState('Mixed');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (step === 1) {
      if (!name.trim()) newErrors.name = 'Name is required';
      if (!bio.trim()) newErrors.bio = 'Bio is required';
      if (!niche) newErrors.niche = 'Please select a niche';
      if (!city.trim()) newErrors.city = 'City is required';
    }
    
    if (step === 2) {
      if (!postRate.trim()) newErrors.postRate = 'Post rate is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const profile: CreatorProfile = {
      name,
      bio,
      niche,
      city,
      audienceStats: {
        ageRange,
        gender,
        topLocations: [city],
        engagementRate: engagementRate || '3.5%',
      },
      pricing: {
        postRate,
        storyRate: storyRate || 'N/A',
        videoRate: videoRate || 'N/A',
      },
      sampleContent: [],
      socialAccounts: connectedAccounts,
      totalFollowers,
    };
    
    onComplete(profile);
  };

  const renderStep1 = () => (
    <>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Basic Information</Text>
        <Text style={styles.formSubtitle}>Tell brands about yourself</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Display Name</Text>
        <View style={[styles.inputContainer, errors.name && styles.inputContainerError]}>
          <Feather name="user" size={18} color={errors.name ? colors.red : colors.textMuted} />
          <TextInput
            style={styles.textInputField}
            placeholder="Enter your display name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={(text) => { setName(text); if (errors.name) setErrors({...errors, name: ''}); }}
            autoCapitalize="words"
            data-testid="input-name"
          />
        </View>
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Bio</Text>
        <View style={[styles.inputContainer, styles.bioInput, errors.bio && styles.inputContainerError]}>
          <Feather name="file-text" size={18} color={errors.bio ? colors.red : colors.textMuted} style={{ marginTop: 2 }} />
          <TextInput
            style={[styles.textInputField, styles.bioTextInput]}
            placeholder="Share your content niche and style..."
            placeholderTextColor={colors.textMuted}
            value={bio}
            onChangeText={(text) => { setBio(text); if (errors.bio) setErrors({...errors, bio: ''}); }}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            data-testid="input-bio"
          />
        </View>
        {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Content Niche</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.nicheScroll}>
          <View style={styles.nicheContainer}>
            {niches.map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.nicheChip, niche === n && styles.nicheChipActive]}
                onPress={() => { setNiche(n); if (errors.niche) setErrors({...errors, niche: ''}); }}
                data-testid={`button-niche-${n.toLowerCase()}`}
              >
                <Text style={[styles.nicheChipText, niche === n && styles.nicheChipTextActive]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {errors.niche && <Text style={styles.errorText}>{errors.niche}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>City</Text>
        <View style={[styles.inputContainer, errors.city && styles.inputContainerError]}>
          <Feather name="map-pin" size={18} color={errors.city ? colors.red : colors.textMuted} />
          <TextInput
            style={styles.textInputField}
            placeholder="Your city"
            placeholderTextColor={colors.textMuted}
            value={city}
            onChangeText={(text) => { setCity(text); if (errors.city) setErrors({...errors, city: ''}); }}
            data-testid="input-city"
          />
        </View>
        {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Pricing & Stats</Text>
        <Text style={styles.formSubtitle}>Set your rates for collaborations</Text>
      </View>

      <View style={styles.connectedSection}>
        <Text style={styles.connectedTitle}>Connected Accounts</Text>
        {connectedAccounts.map(account => (
          <View key={account.platform} style={styles.connectedItem}>
            <View style={styles.smallPlatformIcon}>
              {renderPlatformIcon(account.platform, 14)}
            </View>
            <Text style={styles.connectedItemText}>{account.username}</Text>
            <Text style={styles.connectedFollowers}>{account.followers.toLocaleString()}</Text>
            <Feather name="check-circle" size={16} color={colors.emerald} />
          </View>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Rate per Post</Text>
        <View style={[styles.inputContainer, errors.postRate && styles.inputContainerError]}>
          <Text style={styles.currencySymbol}>₹</Text>
          <TextInput
            style={styles.textInputField}
            placeholder="e.g., 5000"
            placeholderTextColor={colors.textMuted}
            value={postRate}
            onChangeText={(text) => { setPostRate(text); if (errors.postRate) setErrors({...errors, postRate: ''}); }}
            keyboardType="numeric"
            data-testid="input-post-rate"
          />
        </View>
        {errors.postRate && <Text style={styles.errorText}>{errors.postRate}</Text>}
      </View>

      <View style={styles.ratesRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
          <Text style={styles.inputLabel}>Story Rate</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.textInputField}
              placeholder="Optional"
              placeholderTextColor={colors.textMuted}
              value={storyRate}
              onChangeText={setStoryRate}
              keyboardType="numeric"
              data-testid="input-story-rate"
            />
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Video Rate</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.textInputField}
              placeholder="Optional"
              placeholderTextColor={colors.textMuted}
              value={videoRate}
              onChangeText={setVideoRate}
              keyboardType="numeric"
              data-testid="input-video-rate"
            />
          </View>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Engagement Rate</Text>
        <View style={styles.inputContainer}>
          <Feather name="trending-up" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.textInputField}
            placeholder="e.g., 3.5%"
            placeholderTextColor={colors.textMuted}
            value={engagementRate}
            onChangeText={setEngagementRate}
            data-testid="input-engagement-rate"
          />
        </View>
      </View>

      <View style={styles.audienceRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
          <Text style={styles.inputLabel}>Audience Age</Text>
          <View style={styles.inputContainer}>
            <Feather name="users" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.textInputField}
              placeholder="18-34"
              placeholderTextColor={colors.textMuted}
              value={ageRange}
              onChangeText={setAgeRange}
              data-testid="input-age-range"
            />
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.inputLabel}>Gender Split</Text>
          <View style={styles.inputContainer}>
            <Feather name="pie-chart" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.textInputField}
              placeholder="Mixed"
              placeholderTextColor={colors.textMuted}
              value={gender}
              onChangeText={setGender}
              data-testid="input-gender"
            />
          </View>
        </View>
      </View>
    </>
  );

  return (
    <>
      <View style={styles.header}>
        <LinearGradient
          colors={[colors.primary, colors.violet]}
          style={styles.logoGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name="user" size={28} color={colors.text} />
        </LinearGradient>
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]} />
        </View>
      </View>

      <View style={styles.form}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}

        <View style={styles.formActions}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentStep(currentStep - 1)}
              activeOpacity={0.8}
              data-testid="button-back"
            >
              <Feather name="arrow-left" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.continueButton, currentStep > 1 && { flex: 1 }]}
            onPress={currentStep === 2 ? handleSubmit : handleNext}
            disabled={isSubmitting}
            activeOpacity={0.8}
            data-testid={currentStep === 2 ? "button-complete-profile" : "button-next-step"}
          >
            <LinearGradient
              colors={[colors.primary, colors.violet]}
              style={styles.continueButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.continueButtonText}>
                    {currentStep === 2 ? 'Complete Profile' : 'Continue'}
                  </Text>
                  <Feather name={currentStep === 2 ? "check" : "arrow-right"} size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.full,
    gap: 6,
  },
  skipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoGradient: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  formHeader: {
    marginBottom: spacing.lg,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  socialButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  },
  socialButtonConnected: {
    opacity: 0.9,
  },
  socialButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    height: 56,
    gap: spacing.sm,
  },
  socialButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    height: 56,
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  brandIconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectedCheckContainer: {
    marginLeft: spacing.xs,
  },
  smallPlatformIcon: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  socialButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  requirementNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  requirementText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  verifyingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xl,
  },
  verifyingSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  resultIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  eligibleTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  eligibleSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  connectedAccountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  connectedAccountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  connectedAccountText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  continueButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing.lg,
    flex: 1,
  },
  continueButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    height: 52,
    gap: spacing.sm,
  },
  continueButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  ineligibleIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.redLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  ineligibleTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  ineligibleSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    lineHeight: 22,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.xl,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  tryAgainButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
  },
  tryAgainButtonText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: spacing.md,
    height: 52,
    gap: spacing.sm,
  },
  inputContainerError: {
    borderColor: colors.red,
  },
  textInputField: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  bioInput: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  bioTextInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: colors.red,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  nicheScroll: {
    marginHorizontal: -spacing.lg,
  },
  nicheContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  nicheChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  nicheChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  nicheChipText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  nicheChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  connectedSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  connectedTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  connectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  connectedItemText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  connectedFollowers: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  currencySymbol: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '600',
  },
  ratesRow: {
    flexDirection: 'row',
  },
  audienceRow: {
    flexDirection: 'row',
  },
  formActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  backButton: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

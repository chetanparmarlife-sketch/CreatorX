import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, Alert, StyleSheet, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, borderRadius } from '@/src/theme';
import { Avatar } from '@/src/components';
import { useApp } from '@/src/context';
import { useRefresh, useTheme } from '@/src/hooks';
import { useAuth } from '@/src/context/AuthContext';
import { API_BASE_URL_READY } from '@/src/config/env';
import { openExternalUrl } from '@/src/utils/openExternalUrl';
import { SocialProvider } from '@/src/api/services/socialConnectService';
import { profileService } from '@/src/api/services/profileService';
import { featureFlags } from '@/src/config/featureFlags';

const PREFERENCES_STORAGE_KEY = '@profile_preferences';

const baseSocialAccounts = [
  {
    id: 'instagram' as const,
    platform: 'Instagram',
    gradient: ['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888'] as const,
    icon: 'camera' as const,
  },
  {
    id: 'facebook' as const,
    platform: 'Facebook',
    bgColor: '#1877f2',
    icon: 'facebook' as const,
  },
  {
    id: 'linkedin' as const,
    platform: 'LinkedIn',
    bgColor: '#0a66c2',
    icon: 'linkedin' as const,
  },
];

const creatorToolkit = [
  { icon: 'file-text', label: 'Media Kit', subtitle: 'Your profile, socials & pricing', action: 'media-kit', iconBg: 'rgba(37, 99, 235, 0.12)', iconColor: '#2563eb' },
  { icon: 'gift', label: 'Refer and Earn', subtitle: 'Invite creators & earn bonuses', action: 'refer', iconBg: 'rgba(236, 72, 153, 0.1)', iconColor: '#ec4899' },
  { icon: 'bookmark', label: 'Saved Campaigns', subtitle: 'View your bookmarked briefs', action: 'saved', iconBg: 'rgba(249, 115, 22, 0.1)', iconColor: '#f97316' },
  { icon: 'folder', label: 'My Docs', subtitle: 'Contracts, Tax forms & Invoices', action: 'documents', iconBg: 'rgba(6, 182, 212, 0.1)', iconColor: '#06b6d4' },
];

const appPreferences = [
  { icon: 'bell', label: 'Push Notifications', subtitle: 'Campaign updates & messages', key: 'pushNotifications', iconBg: 'rgba(59, 130, 246, 0.1)', iconColor: '#3b82f6' },
  { icon: 'mail', label: 'Email Digest', subtitle: 'Weekly earnings summary', key: 'emailDigest', iconBg: 'rgba(168, 85, 247, 0.1)', iconColor: '#a855f7' },
  { icon: 'eye', label: 'Profile Visibility', subtitle: 'Visible to brands', key: 'profileVisibility', iconBg: 'rgba(16, 185, 129, 0.1)', iconColor: '#10b981' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    darkMode,
    toggleDarkMode,
    socialAccounts,
    socialAccountsError,
    fetchSocialAccounts,
    refreshSocialAccount,
    disconnectSocialAccount,
    getSocialConnectUrl,
  } = useApp();
  const { isAuthenticated, signOut } = useAuth();
  const { colors, isDark } = useTheme();

  const backgroundColor = isDark ? '#000000' : colors.background;
  const cardColor = isDark ? '#121212' : colors.card;
  const surfaceColor = isDark ? '#1E1E1E' : colors.card;
  const borderColor = isDark ? '#272727' : colors.cardBorder;
  const mutedText = isDark ? '#94a3b8' : colors.textMuted;
  const secondaryText = isDark ? '#9ca3af' : colors.textSecondary;

  const [fullName, setFullName] = useState(user.name);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('Digital creator focused on lifestyle, tech, and modern living. Creating content that inspires.');
  const [email, setEmail] = useState('alex@creatorx.com');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [socialHandle, setSocialHandle] = useState('');
  const [followerCount, setFollowerCount] = useState('');
  const [pricing, setPricing] = useState({
    reel: '',
    story: '',
    post: '',
    youtube: '',
    short: '',
    live: '',
  });

  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    emailDigest: false,
    profileVisibility: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const togglePreference = async (key: string) => {
    const newPreferences = { ...preferences, [key]: !preferences[key as keyof typeof preferences] };
    setPreferences(newPreferences);
    // Persist to AsyncStorage
    try {
      await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(newPreferences));
    } catch (error) {
      console.warn('[Profile] Failed to save preferences:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (featureFlags.isEnabled('USE_API_PROFILE')) {
        // Save to backend API
        await profileService.updateProfile({
          fullName: fullName.trim(),
          bio: bio.trim(),
          location: city.trim(),
          phone: phoneNumber.trim(),
        });
      }
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (error: any) {
      console.error('[Profile] Save failed:', error);
      Alert.alert('Save Failed', error.message || 'Unable to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const hydrateProfile = async () => {
      setIsLoading(true);
      try {
        // Load preferences from AsyncStorage
        const storedPrefs = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
        if (storedPrefs && isMounted) {
          setPreferences(JSON.parse(storedPrefs));
        }

        if (featureFlags.isEnabled('USE_API_PROFILE') && isAuthenticated) {
          // Fetch from backend API
          const profile = await profileService.getProfile();
          if (!isMounted) return;

          setFullName(profile.fullName || user.name);
          setPhoneNumber(profile.phone || '');
          setCity(profile.location || '');
          setBio(profile.bio || '');
          setEmail(profile.email || '');
        } else {
          // Use context user data as fallback
          setFullName(user.name);
          setBio(user.bio || '');
          setEmail(user.email || '');
        }
      } catch (error) {
        console.warn('[Profile] Failed to load from API:', error);
        // Fall back to context data
        setFullName(user.name);
        setBio(user.bio || '');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    hydrateProfile();

    return () => {
      isMounted = false;
    };
  }, [user.name, isAuthenticated]);

  // Handle avatar upload
  const handleAvatarPress = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        setIsLoading(true);
        if (featureFlags.isEnabled('USE_API_PROFILE')) {
          await profileService.uploadAvatar({
            uri: result.assets[0].uri,
            type: result.assets[0].mimeType || 'image/jpeg',
            name: result.assets[0].fileName || `avatar_${Date.now()}.jpg`,
          });
          Alert.alert('Success', 'Avatar updated successfully!');
        }
      } catch (error: any) {
        console.error('[Profile] Avatar upload failed:', error);
        Alert.alert('Upload Failed', error.message || 'Unable to upload avatar.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const { refreshing, handleRefresh } = useRefresh(async () => {
    if (!isAuthenticated || !API_BASE_URL_READY) return;
    await fetchSocialAccounts();
  });

  const formatFollowers = useCallback((count?: number) => {
    if (count === undefined || count === null) return '';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return `${count}`;
  }, []);

  const formatEngagement = useCallback((rate?: number) => {
    if (rate === undefined || rate === null) return '';
    const percent = rate > 1 ? rate : rate * 100;
    return `${percent.toFixed(1)}% ER`;
  }, []);

  const connectedAccounts = useMemo(() => {
    return baseSocialAccounts.map((base) => {
      const match = socialAccounts.find((item) => item.provider === base.id);
      const connected = match?.status === 'CONNECTED';
      const needsReconnect = match?.status === 'NEEDS_RECONNECT';
      const followers = formatFollowers(match?.followers);
      const engagement = formatEngagement(match?.engagementRate);
      const metrics = [followers ? `${followers} followers` : '', engagement].filter(Boolean).join(' • ');
      const handle = match?.username ? `@${match.username}` : undefined;
      const subtitle =
        connected && handle
          ? `${handle}${metrics ? ` • ${metrics}` : ''}`
          : needsReconnect
            ? 'Reconnect required'
            : !isAuthenticated
              ? 'Login required'
              : base.id === 'linkedin'
                ? 'Coming soon'
                : 'Not connected';

      return {
        ...base,
        connected,
        needsReconnect,
        handle: subtitle,
      };
    });
  }, [socialAccounts, formatFollowers, formatEngagement, isAuthenticated, API_BASE_URL_READY]);

  useEffect(() => {
    if (!isAuthenticated || !API_BASE_URL_READY) return;
    fetchSocialAccounts();
  }, [fetchSocialAccounts, isAuthenticated, API_BASE_URL_READY]);

  const handleAccountAction = useCallback(
    async (account: (typeof connectedAccounts)[number]) => {
      const provider = account.id as SocialProvider;

      if (!API_BASE_URL_READY) {
        Alert.alert('Unavailable', 'Social connect is unavailable in degraded mode.');
        return;
      }

      if (!isAuthenticated) {
        Alert.alert('Login required', 'Please login to manage your social accounts.');
        return;
      }

      if (provider === 'linkedin') {
        Alert.alert('Coming soon', 'LinkedIn connect will be available soon.');
        return;
      }

      if (account.connected) {
        await disconnectSocialAccount(provider);
        return;
      }

      const url = getSocialConnectUrl(provider);
      if (!url) {
        Alert.alert('Unavailable', 'Social connect is not configured.');
        return;
      }

      try {
        await openExternalUrl(url);
      } catch (error) {
        Alert.alert('Unable to open', 'Please try again.');
      }
    },
    [disconnectSocialAccount, getSocialConnectUrl, isAuthenticated, API_BASE_URL_READY]
  );

  const handleRefreshMetrics = useCallback(
    async (provider: SocialProvider) => {
      if (!API_BASE_URL_READY || !isAuthenticated) {
        return;
      }
      await refreshSocialAccount(provider);
    },
    [refreshSocialAccount, isAuthenticated, API_BASE_URL_READY]
  );

  useEffect(() => {
    if (!socialAccountsError) return;
    Alert.alert('Social connect', socialAccountsError);
  }, [socialAccountsError]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await signOut();
        router.replace('/(auth)/login');
      } },
    ]);
  };

  const handleToolkitPress = (action: string) => {
    switch (action) {
      case 'media-kit':
        router.push('/media-kit');
        break;
      case 'refer':
        router.push('/refer-earn');
        break;
      case 'saved':
        router.push('/saved');
        break;
      case 'documents':
        router.push('/documents');
        break;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: borderColor, backgroundColor: backgroundColor }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)' }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile & Settings</Text>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.7} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveButton, { color: colors.primary }]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={['#1337ec', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <View style={[styles.avatarInner, { backgroundColor: cardColor, borderColor: backgroundColor }]}>
                <Avatar size={88} name={fullName || user.name} imageUrl={user.avatarUri} />
              </View>
            </LinearGradient>
            <TouchableOpacity
              style={[styles.editAvatarButton, { backgroundColor: colors.primary, borderColor: backgroundColor }]}
              activeOpacity={0.8}
              onPress={handleAvatarPress}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Feather name="edit-2" size={14} color="#ffffff" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{fullName || user.name}</Text>
          <Text style={[styles.userHandle, { color: secondaryText }]}>{socialHandle || user.username}</Text>
        </View>

        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
            <Text style={[styles.sectionLabel, { color: mutedText }]}>PERSONAL INFO</Text>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: secondaryText }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: surfaceColor, color: colors.text }]}
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor={mutedText}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: secondaryText }]}>Phone Number</Text>
              <TextInput
                style={[styles.input, { backgroundColor: surfaceColor, color: colors.text }]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone"
                placeholderTextColor={mutedText}
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: secondaryText }]}>City</Text>
              <TextInput
                style={[styles.input, { backgroundColor: surfaceColor, color: colors.text }]}
                value={city}
                onChangeText={setCity}
                placeholder="Enter your city"
                placeholderTextColor={mutedText}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: secondaryText }]}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: surfaceColor, color: colors.text }]}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor={mutedText}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: secondaryText }]}>Email Address</Text>
              <View style={[styles.inputWithIcon, { backgroundColor: surfaceColor }]}>
                <Feather name="mail" size={18} color={mutedText} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputInner, { color: colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  placeholderTextColor={mutedText}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: mutedText }]}>CONNECTED ACCOUNTS</Text>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
            {connectedAccounts.map((account, index) => (
              <View
                key={account.id}
                style={[
                  styles.accountItem,
                  index < connectedAccounts.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }
                ]}
              >
                <View style={styles.accountLeft}>
                  <View style={[
                    styles.accountIcon,
                    account.gradient
                      ? {}
                      : { backgroundColor: account.bgColor }
                  ]}>
                    {account.gradient ? (
                      <LinearGradient
                        colors={account.gradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.accountIconGradient}
                      >
                        <Feather name="camera" size={18} color="#ffffff" />
                      </LinearGradient>
                    ) : (
                      <Feather name={account.icon} size={18} color="#ffffff" />
                    )}
                  </View>
                  <View>
                    <Text style={[styles.accountPlatform, { color: colors.text }]}>{account.platform}</Text>
                    <Text style={[styles.accountHandle, { color: secondaryText }]}>
                      {account.connected ? `Connected as ${account.handle}` : account.handle}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleAccountAction(account)}
                  onLongPress={() => account.connected && handleRefreshMetrics(account.id as SocialProvider)}
                >
                  <Text style={[
                    styles.accountAction,
                    account.connected
                      ? { color: mutedText }
                      : { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {account.connected ? 'Disconnect' : account.id === 'linkedin' ? 'Coming soon' : 'Connect'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: mutedText }]}>CREATOR TOOLKIT</Text>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
            {creatorToolkit.map((item, index) => (
              <TouchableOpacity
                key={item.action}
                style={[
                  styles.menuItem,
                  index < creatorToolkit.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }
                ]}
                onPress={() => handleToolkitPress(item.action)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuItemIcon, { backgroundColor: item.iconBg }]}>
                    <Feather name={item.icon as any} size={18} color={item.iconColor} />
                  </View>
                  <View>
                    <Text style={[styles.menuItemLabel, { color: colors.text }]}>{item.label}</Text>
                    <Text style={[styles.menuItemSubtitle, { color: secondaryText }]}>{item.subtitle}</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: mutedText }]}>APP PREFERENCES</Text>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
            {appPreferences.map((pref, index) => (
              <View
                key={pref.key}
                style={[
                  styles.preferenceItem,
                  index < appPreferences.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }
                ]}
              >
                <View style={styles.preferenceLeft}>
                  <View style={[styles.menuItemIcon, { backgroundColor: pref.iconBg }]}>
                    <Feather name={pref.icon as any} size={18} color={pref.iconColor} />
                  </View>
                  <View>
                    <Text style={[styles.menuItemLabel, { color: colors.text }]}>{pref.label}</Text>
                    <Text style={[styles.menuItemSubtitle, { color: secondaryText }]}>{pref.subtitle}</Text>
                  </View>
                </View>
                <Switch
                  value={preferences[pref.key as keyof typeof preferences]}
                  onValueChange={() => togglePreference(pref.key)}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={preferences[pref.key as keyof typeof preferences] ? colors.primary : colors.textMuted}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor: borderColor }]}>
            <TouchableOpacity
              style={[styles.simpleMenuItem, { borderBottomWidth: 1, borderBottomColor: borderColor }]}
              onPress={() => router.push('/wallet')}
              activeOpacity={0.7}
            >
              <Text style={[styles.simpleMenuLabel, { color: colors.text }]}>Payment Methods</Text>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.simpleMenuItem, { borderBottomWidth: 1, borderBottomColor: borderColor }]}
              onPress={() => router.push('/help')}
              activeOpacity={0.7}
            >
              <Text style={[styles.simpleMenuLabel, { color: colors.text }]}>Help & Support</Text>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.simpleMenuItem}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={[styles.simpleMenuLabel, { color: '#ef4444' }]}>Log Out</Text>
              <Feather name="log-out" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: mutedText }]}>Version 2.4.0 (Build 1024)</Text>
        </View>
      </ScrollView>
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
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    borderWidth: 2,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
  },
  userHandle: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '500',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '500',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  accountIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tiktokText: {
    fontSize: 12,
    fontWeight: '700',
  },
  accountPlatform: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountHandle: {
    fontSize: 12,
    marginTop: 2,
  },
  accountAction: {
    fontSize: 12,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuItemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  simpleMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  simpleMenuLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  versionText: {
    fontSize: 12,
  },
});

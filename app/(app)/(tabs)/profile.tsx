import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, Alert, StyleSheet, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, borderRadius } from '@/src/theme';
import { Avatar } from '@/src/components';
import { useApp } from '@/src/context';
import { useRefresh, useTheme } from '@/src/hooks';
import { useAuth } from '@/src/context/AuthContext';
import { API_BASE_URL_READY } from '@/src/config/env';
import { openExternalUrl } from '@/src/utils/openExternalUrl';
import { SocialProvider } from '@/src/api/services/socialConnectService';

const STORAGE_KEYS = {
  CREATOR_PROFILE: '@creator_profile',
  COMMERCIAL_PROFILE: '@creator_commercial_profile',
};

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
  const { isAuthenticated } = useAuth();
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

  const togglePreference = (key: string) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSave = async () => {
    const creatorProfile = {
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      city: city.trim(),
      bio: bio.trim(),
      email: email.trim(),
      category: selectedCategories.join(', '),
      primaryPlatform: selectedPlatform,
      socialHandle: socialHandle.trim(),
      followerCount: followerCount.trim() ? parseInt(followerCount, 10) : 0,
      updatedAt: new Date().toISOString(),
    };

    const commercialProfile = {
      reelRate: pricing.reel.trim() || null,
      storyRate: pricing.story.trim() || null,
      postRate: pricing.post.trim() || null,
      youtubeRate: pricing.youtube.trim() || null,
      shortRate: pricing.short.trim() || null,
      liveRate: pricing.live.trim() || null,
    };

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.CREATOR_PROFILE, JSON.stringify(creatorProfile)),
      AsyncStorage.setItem(STORAGE_KEYS.COMMERCIAL_PROFILE, JSON.stringify(commercialProfile)),
    ]);

    Alert.alert('Saved', 'Your profile has been updated.');
  };

  useEffect(() => {
    let isMounted = true;

    const hydrateProfile = async () => {
      const [creatorRaw, commercialRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CREATOR_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.COMMERCIAL_PROFILE),
      ]);

      if (!isMounted) return;

      if (creatorRaw) {
        const creator = JSON.parse(creatorRaw);
        setFullName(creator.fullName || user.name);
        setPhoneNumber(creator.phoneNumber || '');
        setCity(creator.city || '');
        setBio(creator.bio || bio);
        setEmail(creator.email || email);
        setSelectedCategories(
          typeof creator.category === 'string' && creator.category.length
            ? creator.category.split(',').map((item: string) => item.trim()).filter(Boolean)
            : []
        );
        setSelectedPlatform(creator.primaryPlatform || 'instagram');
        setSocialHandle(creator.socialHandle || '');
        setFollowerCount(creator.followerCount ? String(creator.followerCount) : '');
      }

      if (commercialRaw) {
        const commercial = JSON.parse(commercialRaw);
        setPricing({
          reel: commercial.reelRate || '',
          story: commercial.storyRate || '',
          post: commercial.postRate || '',
          youtube: commercial.youtubeRate || '',
          short: commercial.shortRate || '',
          live: commercial.liveRate || '',
        });
      }

    };

    hydrateProfile();

    return () => {
      isMounted = false;
    };
  }, [user.name]);

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
      { text: 'Logout', style: 'destructive', onPress: () => {} },
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
        <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
          <Text style={[styles.saveButton, { color: colors.primary }]}>Save</Text>
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
            >
              <Feather name="edit-2" size={14} color="#ffffff" />
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

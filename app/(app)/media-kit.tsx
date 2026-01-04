import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRefresh, useTheme } from '@/src/hooks';
import { useApp } from '@/src/context';
import { useAuth } from '@/src/context/AuthContext';
import { API_BASE_URL_READY } from '@/src/config/env';
import { SocialProvider } from '@/src/api/services/socialConnectService';
import { spacing, borderRadius } from '@/src/theme';

const STORAGE_KEYS = {
  CREATOR_PROFILE: '@creator_profile',
  COMMERCIAL_PROFILE: '@creator_commercial_profile',
};

export default function MediaKitScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isAuthenticated } = useAuth();
  const {
    socialAccounts,
    socialAccountsError,
    fetchSocialAccounts,
  } = useApp();
  const [profile, setProfile] = useState<any>(null);
  const [pricing, setPricing] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const [creatorRaw, commercialRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CREATOR_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.COMMERCIAL_PROFILE),
      ]);

      if (!isMounted) return;

      if (creatorRaw) {
        setProfile(JSON.parse(creatorRaw));
      }
      if (commercialRaw) {
        setPricing(JSON.parse(commercialRaw));
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

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

  const socials = useMemo(() => {
    const baseProviders: SocialProvider[] = ['instagram', 'facebook', 'linkedin'];
    return baseProviders.map((provider) => {
      const match = socialAccounts.find((item) => item.provider === provider);
      const connected = match?.status === 'CONNECTED';
      const needsReconnect = match?.status === 'NEEDS_RECONNECT';
      const followers = formatFollowers(match?.followers);
      const engagement = formatEngagement(match?.engagementRate);
      const metrics = [followers ? `${followers} followers` : '', engagement].filter(Boolean).join(' • ');
      const handle = match?.username ? `@${match.username}` : '';
      const statusText = connected
        ? `${handle}${metrics ? ` • ${metrics}` : ''}`.trim()
        : needsReconnect
          ? 'Reconnect required'
          : !API_BASE_URL_READY
            ? 'Unavailable'
            : !isAuthenticated
              ? 'Login required'
              : provider === 'linkedin'
                ? 'Coming soon'
                : 'Not connected';

      return {
        id: provider,
        name: provider === 'facebook' ? 'Facebook' : provider[0].toUpperCase() + provider.slice(1),
        status: connected ? 'connected' : 'disconnected',
        handle: statusText,
      };
    });
  }, [socialAccounts, formatFollowers, formatEngagement, isAuthenticated, API_BASE_URL_READY]);

  useEffect(() => {
    if (!isAuthenticated || !API_BASE_URL_READY) return;
    fetchSocialAccounts();
  }, [fetchSocialAccounts, isAuthenticated, API_BASE_URL_READY]);

  useEffect(() => {
    if (!socialAccountsError) return;
    Alert.alert('Social connect', socialAccountsError);
  }, [socialAccountsError]);

  const cardColor = isDark ? '#121212' : colors.card;
  const borderColor = isDark ? '#272727' : colors.cardBorder;
  const mutedText = isDark ? '#94a3b8' : colors.textMuted;
  const secondaryText = isDark ? '#9ca3af' : colors.textSecondary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: borderColor, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Media Kit</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
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
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: mutedText }]}>CREATOR PROFILE</Text>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            {[
              { label: 'Full Name', value: profile?.fullName || '-' },
              { label: 'Phone', value: profile?.phoneNumber || '-' },
              { label: 'City', value: profile?.city || '-' },
              { label: 'Bio', value: profile?.bio || '-', multiline: true },
              { label: 'Email', value: profile?.email || '-' },
              { label: 'Primary Platform', value: profile?.primaryPlatform || '-' },
              { label: 'Social Handle', value: profile?.socialHandle || '-' },
              { label: 'Follower Count', value: profile?.followerCount ? String(profile.followerCount) : '-' },
              { label: 'Categories', value: profile?.category || '-', multiline: true },
            ].map((row, index, arr) => (
              <InfoRow
                key={row.label}
                label={row.label}
                value={row.value}
                color={colors.text}
                muted={secondaryText}
                multiline={row.multiline}
                borderColor={borderColor}
                showDivider={index < arr.length - 1}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: mutedText }]}>CONNECTED ACCOUNTS</Text>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            {socials.length === 0 ? (
              <Text style={[styles.emptyText, { color: mutedText }]}>No accounts linked yet.</Text>
            ) : (
              socials.map((account, index) => (
                <View
                  key={account.id || account.platform}
                  style={[
                    styles.socialRow,
                    index < socials.length - 1 && { borderBottomWidth: 1, borderBottomColor },
                  ]}
                >
                  <Text style={[styles.socialName, { color: colors.text }]}>{account.name || account.platform}</Text>
                  <Text style={[styles.socialStatus, { color: account.status === 'connected' ? colors.primary : mutedText }]}>
                    {account.status === 'connected' ? account.handle || 'Connected' : account.handle || 'Not connected'}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: mutedText }]}>PRICING</Text>
          <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
            {[
              { label: 'Instagram Reel (30-60s)', value: pricing?.reelRate || '-' },
              { label: 'Instagram Story (3 frames)', value: pricing?.storyRate || '-' },
              { label: 'Instagram Post (static)', value: pricing?.postRate || '-' },
              { label: 'YouTube Video', value: pricing?.youtubeRate || '-' },
              { label: 'Shorts / Reels Cross-post', value: pricing?.shortRate || '-' },
              { label: 'Live Session (30 min)', value: pricing?.liveRate || '-' },
            ].map((row, index, arr) => (
              <InfoRow
                key={row.label}
                label={row.label}
                value={row.value}
                color={colors.text}
                muted={secondaryText}
                borderColor={borderColor}
                showDivider={index < arr.length - 1}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  color,
  muted,
  multiline = false,
  borderColor,
  showDivider,
}: {
  label: string;
  value: string;
  color: string;
  muted: string;
  multiline?: boolean;
  borderColor: string;
  showDivider: boolean;
}) {
  return (
    <View style={[styles.infoRow, showDivider && { borderBottomWidth: 1, borderBottomColor: borderColor }]}>
      <Text style={[styles.infoLabel, { color: muted }]}>{label}</Text>
      <Text style={[styles.infoValue, { color }]} numberOfLines={multiline ? 3 : 1}>
        {value}
      </Text>
    </View>
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
  placeholder: {
    width: 40,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  section: {
    marginBottom: spacing.lg,
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
  },
  infoRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  socialName: {
    fontSize: 14,
    fontWeight: '600',
  },
  socialStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
});

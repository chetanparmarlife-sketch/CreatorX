import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius } from '@/src/theme';
import { useTheme } from '@/src/hooks';

type SocialAccount = {
  id: string;
  name: string;
  status: 'connected' | 'disconnected';
  handle?: string;
  accent: string;
  icon: keyof typeof Feather.glyphMap;
};

const initialAccounts: SocialAccount[] = [
  { id: 'instagram', name: 'Instagram', status: 'disconnected', accent: '#d62976', icon: 'camera' },
  { id: 'tiktok', name: 'TikTok', status: 'disconnected', accent: '#111111', icon: 'music' },
  { id: 'youtube', name: 'YouTube', status: 'connected', handle: '@creator_official', accent: '#ff0000', icon: 'video' },
  { id: 'twitter', name: 'Twitter', status: 'disconnected', accent: '#0f172a', icon: 'at-sign' },
];

const STORAGE_KEYS = {
  SOCIAL_ACCOUNTS: '@creator_social_accounts',
};

export default function OnboardingSocialScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const [accounts, setAccounts] = useState(initialAccounts);

  const toggleConnect = (id: string) => {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id
          ? {
              ...account,
              status: account.status === 'connected' ? 'disconnected' : 'connected',
              handle: account.status === 'connected' ? undefined : account.handle || '@creator_official',
            }
          : account
      )
    );
  };

  const handleContinue = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_ACCOUNTS, JSON.stringify(accounts));
    router.push('/(auth)/onboarding-commercial');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_ACCOUNTS, JSON.stringify(accounts));
    router.push('/(auth)/onboarding-commercial');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={['#0c0f1c', '#101322', '#0a0c16']}
        style={styles.background}
      />
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.progressRow}>
          <View style={styles.progressPill} />
          <View style={[styles.progressPill, styles.progressActive]} />
          <View style={styles.progressPill} />
        </View>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Link your profiles</Text>
          <Text style={styles.subtitle}>
            Connect your social accounts to verify your audience and unlock exclusive campaigns suited for you.
          </Text>
        </View>

        <View style={styles.list}>
          {accounts.map((account) => (
            <View key={account.id} style={[styles.card, account.status === 'connected' && styles.cardActive]}>
              <View style={styles.cardLeft}>
                <View style={[styles.iconCircle, { backgroundColor: account.accent }]}>
                  <Feather name={account.icon} size={22} color="#ffffff" />
                </View>
                <View>
                  <Text style={styles.cardTitle}>{account.name}</Text>
                  <Text style={[styles.cardSubtitle, account.status === 'connected' && styles.cardSubtitleActive]}>
                    {account.status === 'connected' ? account.handle : 'Not connected'}
                  </Text>
                </View>
              </View>
              {account.status === 'connected' ? (
                <TouchableOpacity style={styles.disconnectButton} onPress={() => toggleConnect(account.id)}>
                  <Feather name="x" size={18} color={isDark ? '#94a3b8' : '#64748b'} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.connectButton} onPress={() => toggleConnect(account.id)}>
                  <Text style={styles.connectText}>Connect</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          We never post without your permission. <Text style={styles.footerLink}>Read Data Policy</Text>.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
          <Text style={styles.primaryButtonText}>Continue</Text>
          <Feather name="arrow-right" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#101322',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressPill: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  skipButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  skipText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 140,
  },
  titleWrap: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.6)',
  },
  list: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  cardActive: {
    borderColor: 'rgba(19,55,236,0.7)',
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  cardSubtitleActive: {
    color: colors.primary,
  },
  connectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  connectText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  disconnectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
    backgroundColor: 'rgba(16,19,34,0.9)',
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  footerLink: {
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'underline',
  },
  primaryButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});

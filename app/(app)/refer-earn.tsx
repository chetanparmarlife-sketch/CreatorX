import { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Clipboard, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { spacing, borderRadius } from '@/src/theme';
import { useTheme, useRefresh } from '@/src/hooks';
import { Avatar } from '@/src/components';

const stats = [
  { id: 'earned', label: 'Earned', value: '$150' },
  { id: 'sent', label: 'Sent', value: '12' },
  { id: 'pending', label: 'Pending', value: '1' },
];

const steps = [
  { id: '1', icon: 'users', title: 'Invite friends', description: 'Share your unique link via SMS, Email, or Social Media.' },
  { id: '2', icon: 'check-circle', title: 'They join & complete a campaign', description: 'Your friend signs up and submits their first deliverable.' },
  { id: '3', icon: 'dollar-sign', title: 'You get paid', description: 'We deposit $50 directly into your CreatorX wallet.' },
];

const recentInvites = [
  { id: '1', name: 'Sarah Jenkins', status: 'success', time: 'Joined 2 days ago', avatar: null },
  { id: '2', name: 'Mike Johnson', status: 'pending', time: 'Invite sent', avatar: null },
];

export default function ReferEarnScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const referralCode = 'CREATOR-X-2024';

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  }, []);

  const { refreshing, handleRefresh: onRefresh } = useRefresh(handleRefresh);

  const handleCopyCode = useCallback(async () => {
    try {
      await Clipboard.setString(referralCode);
    } catch (e) {
      console.log('Failed to copy');
    }
  }, [referralCode]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Join CreatorX with my referral code ${referralCode} and we both get $50! https://creatorx.app/join?ref=${referralCode}`,
      });
    } catch (e) {
      console.log('Share failed');
    }
  }, [referralCode]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.glowContainer}>
        <View style={[styles.glow, { backgroundColor: colors.primary }]} />
      </View>

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Refer & Earn</Text>
        <TouchableOpacity>
          <Text style={[styles.termsLink, { color: colors.textSecondary }]}>Terms</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroSection}>
          <View style={[styles.iconCircle, { borderColor: 'rgba(255,255,255,0.1)' }]}>
            <LinearGradient
              colors={[colors.card, '#000000']}
              style={styles.iconGradient}
            >
              <Feather name="gift" size={40} color={colors.primary} />
            </LinearGradient>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Get $50. Give $50.</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Invite fellow creators to CreatorX. You both get paid when they complete their first campaign.
          </Text>
        </View>

        <View style={[styles.referralCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.referralHeader}>
            <Text style={[styles.referralLabel, { color: colors.primary }]}>YOUR REFERRAL CODE</Text>
            <Feather name="maximize-2" size={18} color={colors.textSecondary} />
          </View>
          <View style={[styles.codeContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
            <Text style={[styles.codeText, { color: colors.text }]}>{referralCode}</Text>
            <TouchableOpacity 
              style={[styles.copyButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
              onPress={handleCopyCode}
            >
              <Feather name="copy" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.shareButton, { backgroundColor: colors.primary }]}
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Feather name="share" size={20} color="#ffffff" />
          <Text style={styles.shareButtonText}>Share Referral Link</Text>
        </TouchableOpacity>

        <View style={styles.statsGrid}>
          {stats.map(stat => (
            <View 
              key={stat.id} 
              style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            >
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label.toUpperCase()}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How it works</Text>
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <View key={step.id}>
                <View style={styles.stepRow}>
                  <View style={[
                    styles.stepIcon,
                    { backgroundColor: colors.card, borderColor: index === 2 ? 'rgba(19, 55, 236, 0.3)' : colors.cardBorder }
                  ]}>
                    <Feather 
                      name={step.icon as any} 
                      size={16} 
                      color={index === 2 ? colors.primary : colors.text} 
                    />
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                    <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>{step.description}</Text>
                  </View>
                </View>
                {index < steps.length - 1 && (
                  <View style={[styles.connector, { backgroundColor: colors.cardBorder }]} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Invites</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAll, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentInvites.map(invite => (
            <View 
              key={invite.id} 
              style={[styles.inviteCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            >
              <View style={styles.inviteLeft}>
                <View style={[styles.inviteAvatar, { backgroundColor: colors.cardBorder }]}>
                  <Text style={[styles.avatarText, { color: colors.text }]}>
                    {invite.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.inviteName, { color: colors.text }]}>{invite.name}</Text>
                  <Text style={[styles.inviteTime, { color: colors.textMuted }]}>{invite.time}</Text>
                </View>
              </View>
              <View style={[
                styles.statusBadge,
                { 
                  backgroundColor: invite.status === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  borderColor: invite.status === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'
                }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: invite.status === 'success' ? '#10b981' : '#f59e0b' }
                ]}>
                  {invite.status === 'success' ? 'SUCCESS' : 'PENDING'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    overflow: 'hidden',
    zIndex: 0,
  },
  glow: {
    position: 'absolute',
    top: -200,
    left: '50%',
    marginLeft: -200,
    width: 400,
    height: 400,
    borderRadius: 200,
    opacity: 0.1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  termsLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  referralCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  referralHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  referralLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  codeText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    borderRadius: 12,
    marginBottom: spacing.lg,
    shadowColor: '#1337ec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepsContainer: {
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  stepContent: {
    flex: 1,
    paddingTop: 2,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
  connector: {
    width: 1,
    height: 16,
    marginLeft: 20,
    marginVertical: -4,
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  inviteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inviteAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inviteName: {
    fontSize: 13,
    fontWeight: '700',
  },
  inviteTime: {
    fontSize: 10,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

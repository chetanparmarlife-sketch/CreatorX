import { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '@/src/hooks';

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
  { id: '1', name: 'Sarah Jenkins', status: 'success', time: 'Joined 2 days ago' },
  { id: '2', name: 'Mike Johnson', status: 'pending', time: 'Invite sent' },
];

export default function ReferEarnScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const referralCode = 'CREATOR-X-2024';

  const handleCopyCode = useCallback(async () => {
    await Clipboard.setStringAsync(referralCode);
  }, [referralCode]);

  const handleShare = useCallback(async () => {
    await Share.share({
      message: `Join CreatorX with my referral code ${referralCode} and we both get $50! https://creatorx.app/join?ref=${referralCode}`,
    });
  }, [referralCode]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.glow} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <TouchableOpacity>
          <Text style={styles.termsText}>Terms</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Feather name="gift" size={40} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Get $50. Give $50.</Text>
          <Text style={styles.heroSubtitle}>
            Invite fellow creators to CreatorX. You both get paid when they complete their first campaign.
          </Text>
        </View>

        <View style={styles.referralCard}>
          <View style={styles.referralHeader}>
            <Text style={styles.referralLabel}>Your Referral Code</Text>
            <Feather name="maximize-2" size={18} color="#9da1b9" />
          </View>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{referralCode}</Text>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
              <Feather name="copy" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Feather name="share" size={18} color="#fff" />
          <Text style={styles.shareButtonText}>Share Referral Link</Text>
        </TouchableOpacity>

        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How it works</Text>
          {steps.map((step, index) => (
            <View key={step.id}>
              <View style={styles.stepRow}>
                <View style={[styles.stepIcon, index === 2 && styles.stepIconActive]}>
                  <Feather name={step.icon as any} size={16} color={index === 2 ? colors.primary : '#fff'} />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </View>
              {index < steps.length - 1 && <View style={styles.stepDivider} />}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Invites</Text>
            <Text style={styles.viewAll}>View All</Text>
          </View>
          {recentInvites.map((invite) => (
            <View key={invite.id} style={styles.inviteCard}>
              <View style={styles.inviteLeft}>
                <View style={styles.inviteAvatar}>
                  <Text style={styles.inviteInitials}>{invite.name.split(' ').map((n) => n[0]).join('')}</Text>
                </View>
                <View>
                  <Text style={styles.inviteName}>{invite.name}</Text>
                  <Text style={styles.inviteTime}>{invite.time}</Text>
                </View>
              </View>
              <View style={[styles.inviteBadge, invite.status === 'success' ? styles.inviteBadgeSuccess : styles.inviteBadgePending]}>
                <Text style={styles.inviteBadgeText}>{invite.status === 'success' ? 'Success' : 'Pending'}</Text>
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
    backgroundColor: '#050505',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(19,55,236,0.15)',
    transform: [{ translateX: -170 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  termsText: {
    color: '#9da1b9',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
  },
  heroIcon: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e1e',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroSubtitle: {
    color: '#9da1b9',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 300,
  },
  referralCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#121212',
    padding: 16,
    gap: 10,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  referralLabel: {
    color: '#1337ec',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  codeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#1337ec',
    shadowColor: '#1337ec',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingVertical: 14,
  },
  statLabel: {
    color: '#9da1b9',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 6,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  viewAll: {
    color: '#1337ec',
    fontSize: 12,
    fontWeight: '700',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e1e1e',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconActive: {
    borderColor: 'rgba(19,55,236,0.4)',
    shadowColor: '#1337ec',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  stepContent: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  stepDescription: {
    color: '#9da1b9',
    fontSize: 11,
    lineHeight: 16,
  },
  stepDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 20,
    marginVertical: 4,
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#121212',
    padding: 12,
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
    backgroundColor: '#1e1e1e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteInitials: {
    color: '#9da1b9',
    fontSize: 11,
    fontWeight: '700',
  },
  inviteName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  inviteTime: {
    color: '#9da1b9',
    fontSize: 10,
    marginTop: 2,
  },
  inviteBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  inviteBadgeSuccess: {
    borderColor: 'rgba(34,197,94,0.3)',
    backgroundColor: 'rgba(34,197,94,0.1)',
  },
  inviteBadgePending: {
    borderColor: 'rgba(234,179,8,0.3)',
    backgroundColor: 'rgba(234,179,8,0.1)',
  },
  inviteBadgeText: {
    color: '#22c55e',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

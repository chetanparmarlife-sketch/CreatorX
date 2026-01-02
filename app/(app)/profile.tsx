import { View, Text, ScrollView, TouchableOpacity, Switch, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { spacing, borderRadius, typography } from '@/src/theme';
import { Avatar, Badge, Button, BackButton } from '@/src/components';
import { useApp } from '@/src/context';
import { useTheme } from '@/src/hooks';

const menuItems = [
  { icon: 'bar-chart-2', label: 'Analytics', action: 'analytics' },
  { icon: 'bookmark', label: 'Saved Campaigns', action: 'saved' },
  { icon: 'file-text', label: 'My Documents', action: 'documents' },
  { icon: 'bell', label: 'Notification Settings', action: 'notifications' },
  { icon: 'shield', label: 'Privacy & Security', action: 'privacy' },
  { icon: 'help-circle', label: 'Help & Support', action: 'help' },
  { icon: 'star', label: 'Rate Us', action: 'rate' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, darkMode, toggleDarkMode, addNotification } = useApp();
  const { colors, isDark } = useTheme();

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(user.referralCode);
    addNotification({
      type: 'system',
      title: 'Code Copied',
      description: 'Referral code copied to clipboard',
      time: 'Just now',
      read: true,
    });
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join CreatorX and start earning from brand collaborations! Use my referral code: ${user.referralCode} to get started. Download now!`,
        title: 'Join CreatorX',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleMenuPress = (action: string) => {
    switch (action) {
      case 'analytics':
        router.push('/analytics');
        break;
      case 'saved':
        router.push('/saved');
        break;
      case 'notifications':
        router.push('/notifications');
        break;
      case 'documents':
        router.push('/documents');
        break;
      case 'privacy':
        router.push('/privacy');
        break;
      case 'help':
        router.push('/help');
        break;
      case 'rate':
        Alert.alert(
          'Rate CreatorX',
          'If you enjoy using CreatorX, would you mind taking a moment to rate it? Your feedback helps us improve!',
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Rate Now', onPress: () => Alert.alert('Thank You!', 'We appreciate your support!') },
          ]
        );
        break;
      default:
        Alert.alert('Coming Soon', 'This feature will be available soon!');
    }
  };

  const profileGradientColors = isDark 
    ? ['#1a1a1a', '#121212', 'rgba(19, 55, 236, 0.1)'] as const
    : ['#ffffff', '#f8f8f8', 'rgba(19, 55, 236, 0.08)'] as const;

  const referralGradientColors = isDark
    ? ['rgba(19, 55, 236, 0.2)', 'rgba(19, 55, 236, 0.1)', 'rgba(19, 55, 236, 0.05)'] as const
    : ['rgba(19, 55, 236, 0.15)', 'rgba(19, 55, 236, 0.08)', 'rgba(19, 55, 236, 0.03)'] as const;

  const kycGradientColors = isDark
    ? [colors.primaryLight, 'rgba(19, 55, 236, 0.05)'] as const
    : [colors.primaryLight, 'rgba(19, 55, 236, 0.03)'] as const;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <BackButton title="Profile" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileCard, { borderColor: colors.cardBorder }]}>
          <LinearGradient
            colors={profileGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileGradient}
          >
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Avatar size={80} name={user.name} imageUrl={user.avatarUri} showBadge />
              </View>
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
                  {user.isVerified && (
                    <View style={[styles.verifiedBadge, { backgroundColor: colors.primaryLight }]}>
                      <Feather name="check-circle" size={14} color={colors.primary} />
                    </View>
                  )}
                </View>
                <Text style={[styles.username, { color: colors.textSecondary }]}>{user.username}</Text>
                <View style={styles.badgeRow}>
                  {user.kycVerified && (
                    <Badge
                      label="KYC Verified"
                      variant="success"
                      icon={<Feather name="shield" size={10} color={colors.emerald} />}
                    />
                  )}
                  {user.isPro && (
                    <Badge
                      label="Pro"
                      variant="warning"
                      icon={<Feather name="star" size={10} color={colors.amber} />}
                    />
                  )}
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.settingsBtn, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]} 
                onPress={() => router.push('/edit-profile')}
              >
                <Feather name="edit-2" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {(user.birthDate || user.address) && (
              <View style={styles.personalDetails}>
                {user.birthDate && (
                  <View style={styles.detailRow}>
                    <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
                      <Feather name="calendar" size={14} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>{user.birthDate}</Text>
                  </View>
                )}
                {user.address && (
                  <View style={styles.detailRow}>
                    <View style={[styles.detailIcon, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}>
                      <Feather name="map-pin" size={14} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={2}>
                      {[user.address.line1, user.address.city, user.address.state, user.address.postalCode, user.address.country].filter(Boolean).join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </LinearGradient>
        </View>

        <View style={[styles.referralCard, { borderColor: colors.primaryBorder }]}>
          <LinearGradient
            colors={referralGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.referralGradient}
          >
            <View style={styles.referralHeader}>
              <View style={[styles.referralIcon, { backgroundColor: colors.primaryLight }]}>
                <Feather name="gift" size={20} color={colors.primary} />
              </View>
              <View style={styles.referralInfo}>
                <Text style={[styles.referralTitle, { color: colors.text }]}>Refer & Earn</Text>
                <Text style={[styles.referralSubtitle, { color: colors.textSecondary }]}>Invite friends, earn ₹500 each</Text>
              </View>
            </View>

            <View style={[styles.codeContainer, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)', borderColor: colors.cardBorder }]}>
              <View style={styles.codeBox}>
                <Text style={[styles.codeLabel, { color: colors.textMuted }]}>Your Code</Text>
                <Text style={[styles.codeValue, { color: colors.primary }]}>{user.referralCode}</Text>
              </View>
              <TouchableOpacity style={[styles.copyBtn, { backgroundColor: colors.primaryLight }]} onPress={handleCopyCode}>
                <Feather name="copy" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.shareBtn, { backgroundColor: colors.primaryLight }]} onPress={handleShare}>
                <Feather name="share-2" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.referralStats}>
              <View style={[styles.referralStat, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)' }]}>
                <View style={styles.referralStatIcon}>
                  <Feather name="users" size={14} color={colors.textSecondary} />
                </View>
                <Text style={[styles.referralStatLabel, { color: colors.textSecondary }]}>Referrals</Text>
                <Text style={[styles.referralStatValue, { color: colors.text }]}>{user.referralCount}</Text>
              </View>
              <View style={[styles.referralStat, { backgroundColor: colors.emeraldLight }]}>
                <View style={styles.referralStatIcon}>
                  <Feather name="gift" size={14} color={colors.emerald} />
                </View>
                <Text style={[styles.referralStatLabel, { color: colors.emerald }]}>Earned</Text>
                <Text style={[styles.referralStatValue, { color: colors.emerald }]}>
                  ₹{user.referralEarnings.toLocaleString()}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={[styles.settingsCard, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}>
          <View style={[styles.settingsHeader, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.settingsTitle, { color: colors.text }]}>Settings</Text>
          </View>

          <View style={styles.settingsContent}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Feather name={darkMode ? 'moon' : 'sun'} size={20} color={colors.textSecondary} />
                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={darkMode ? colors.primary : colors.textMuted}
              />
            </View>

            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.action}
                style={[
                  styles.settingItem,
                  index === menuItems.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => handleMenuPress(item.action)}
              >
                <View style={styles.settingLeft}>
                  <Feather name={item.icon as any} size={20} color={colors.textSecondary} />
                  <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[styles.kycButton, { borderColor: colors.primaryBorder }]} onPress={() => router.push('/kyc')}>
          <LinearGradient
            colors={kycGradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.kycGradient}
          >
            <View style={[styles.kycIcon, { backgroundColor: colors.primaryLight }]}>
              <Feather name="file-text" size={20} color={colors.primary} />
            </View>
            <View style={styles.kycInfo}>
              <Text style={[styles.kycTitle, { color: colors.text }]}>Update KYC</Text>
              <Text style={[styles.kycSubtitle, { color: colors.textSecondary }]}>Manage verification documents</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.primary} />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.redLight, borderColor: 'rgba(239, 68, 68, 0.3)' }]}
          onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => {} },
          ])}
        >
          <Feather name="log-out" size={18} color={colors.red} />
          <Text style={[styles.logoutText, { color: colors.red }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  profileCard: {
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    overflow: 'hidden' as const,
    marginBottom: spacing.lg,
  },
  profileGradient: {
    padding: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
  },
  avatarContainer: {
    marginRight: spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },
  name: {
    ...typography.h4,
  },
  verifiedBadge: {
    marginLeft: spacing.sm,
    borderRadius: borderRadius.full,
    padding: 4,
  },
  username: {
    ...typography.small,
    marginBottom: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: spacing.sm,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  personalDetails: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: spacing.sm,
  },
  detailText: {
    ...typography.small,
    flex: 1,
  },
  referralCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden' as const,
    marginBottom: spacing.lg,
  },
  referralGradient: {
    padding: spacing.xl,
  },
  referralHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
  },
  referralIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: spacing.md,
  },
  referralInfo: {
    flex: 1,
  },
  referralTitle: {
    ...typography.bodyMedium,
  },
  referralSubtitle: {
    ...typography.xs,
    marginTop: 2,
  },
  codeContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  codeBox: {
    flex: 1,
  },
  codeLabel: {
    ...typography.xs,
    marginBottom: 2,
  },
  codeValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: 2,
  },
  copyBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginLeft: spacing.sm,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginLeft: spacing.sm,
  },
  referralStats: {
    flexDirection: 'row' as const,
    gap: spacing.md,
  },
  referralStat: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  referralStatIcon: {
    marginBottom: spacing.xs,
  },
  referralStatLabel: {
    ...typography.xs,
    marginBottom: 2,
  },
  referralStatValue: {
    ...typography.h4,
  },
  settingsCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden' as const,
    marginBottom: spacing.lg,
  },
  settingsHeader: {
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  settingsTitle: {
    ...typography.sectionTitle,
  },
  settingsContent: {
    padding: spacing.sm,
  },
  settingItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  settingLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  settingLabel: {
    ...typography.body,
    marginLeft: spacing.md,
  },
  kycButton: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden' as const,
    marginBottom: spacing.lg,
  },
  kycGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: spacing.lg,
  },
  kycIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: spacing.md,
  },
  kycInfo: {
    flex: 1,
  },
  kycTitle: {
    ...typography.bodyMedium,
  },
  kycSubtitle: {
    ...typography.xs,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    height: 48,
  },
  logoutText: {
    ...typography.bodyMedium,
    marginLeft: spacing.sm,
  },
};

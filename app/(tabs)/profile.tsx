import { useState, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Share, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { spacing, borderRadius } from '@/src/theme';
import { Avatar, Badge } from '@/src/components';
import { useApp } from '@/src/context';
import { useTheme } from '@/src/hooks';

const menuItems = [
  { icon: 'file-text', label: 'KYC Verification', action: 'kyc' },
  { icon: 'bookmark', label: 'Saved Campaigns', action: 'saved' },
  { icon: 'folder', label: 'My Documents', action: 'documents' },
  { icon: 'bell', label: 'Notification Settings', action: 'notifications' },
  { icon: 'shield', label: 'Privacy & Security', action: 'privacy' },
  { icon: 'help-circle', label: 'Help & Support', action: 'help' },
];

const headerTabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'refer', label: 'Refer & Earn' },
  { id: 'leaderboard', label: 'Leaderboard' },
];

const HeaderTabButton = memo(function HeaderTabButton({
  label,
  isActive,
  onPress,
  colors,
  isDark,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  colors: any;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.headerTabButton,
        isActive 
          ? [styles.headerTabButtonActive, { borderColor: isDark ? 'rgba(255, 255, 255, 0.8)' : colors.primary }]
          : [styles.headerTabButtonInactive, { backgroundColor: isDark ? '#2a2a2a' : colors.card, borderColor: isDark ? '#2a2a2a' : colors.cardBorder }],
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.headerTabButtonText,
        isActive 
          ? { color: isDark ? '#FFFFFF' : colors.primary }
          : { color: isDark ? 'rgba(255, 255, 255, 0.9)' : colors.textSecondary },
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

function ProfileContent() {
  const router = useRouter();
  const { user, darkMode, toggleDarkMode, addNotification } = useApp();
  const { colors, isDark } = useTheme();

  const handleMenuPress = (action: string) => {
    switch (action) {
      case 'edit-profile':
        router.push('/edit-profile');
        break;
      case 'kyc':
        router.push('/kyc');
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
      default:
        Alert.alert('Coming Soon', 'This feature will be available soon!');
    }
  };

  return (
    <>
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, marginTop: spacing.md }]}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Avatar size={64} name={user.name} imageUrl={user.avatarUri} showBadge />
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
              {user.isVerified && (
                <View style={[styles.verifiedBadge, { backgroundColor: colors.primaryLight }]}>
                  <Feather name="check-circle" size={12} color={colors.primary} />
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
            style={[styles.editProfileBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/edit-profile')}
            activeOpacity={0.7}
          >
            <Feather name="edit-2" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.statsBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>24.5K</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Followers</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.emerald }]}>12</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Campaigns</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.amber }]}>4.8</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Rating</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Connect Accounts</Text>
        </View>
        <View style={[styles.connectAccountsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {user.socialLinks.map((link, index) => (
            <TouchableOpacity
              key={link.platform}
              style={[
                styles.connectAccountItem,
                index < user.socialLinks.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder }
              ]}
              onPress={() => router.push('/edit-profile')}
              activeOpacity={0.7}
            >
              <View style={[styles.connectAccountIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                <Feather name={link.icon as any} size={16} color={colors.primary} />
              </View>
              <View style={styles.connectAccountInfo}>
                <Text style={[styles.connectAccountPlatform, { color: colors.text }]}>{link.platform}</Text>
                <Text style={[styles.connectAccountHandle, { color: colors.textSecondary }]}>{link.url}</Text>
              </View>
              <View style={styles.connectAccountFollowers}>
                <Text style={[styles.followersValue, { color: colors.primary }]}>{link.followers}</Text>
                <Text style={[styles.followersLabel, { color: colors.textMuted }]}>followers</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
        </View>
        
        <View style={[styles.settingsCard, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                <Feather name={darkMode ? 'moon' : 'sun'} size={16} color={colors.textSecondary} />
              </View>
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
              style={styles.settingItem}
              onPress={() => handleMenuPress(item.action)}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                  <Feather name={item.icon as any} size={16} color={colors.textSecondary} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.redLight, borderColor: 'rgba(239, 68, 68, 0.3)' }]}
        onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: () => {} },
        ])}
        activeOpacity={0.8}
      >
        <Feather name="log-out" size={16} color={colors.red} />
        <Text style={[styles.logoutText, { color: colors.red }]}>Log Out</Text>
      </TouchableOpacity>
    </>
  );
}

function ReferEarnContent() {
  const { user, addNotification } = useApp();
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

  const referralGradientColors = isDark
    ? ['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.1)', 'rgba(124, 58, 237, 0.05)'] as const
    : ['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.08)', 'rgba(124, 58, 237, 0.03)'] as const;

  const rewardTiers = [
    { tier: 'Bronze', referrals: '1-5', reward: '₹500 per referral', icon: 'award' },
    { tier: 'Silver', referrals: '6-15', reward: '₹750 per referral', icon: 'award' },
    { tier: 'Gold', referrals: '16-30', reward: '₹1,000 per referral', icon: 'award' },
    { tier: 'Platinum', referrals: '31+', reward: '₹1,500 per referral', icon: 'star' },
  ];

  const howItWorks = [
    { step: '1', title: 'Share Your Code', description: 'Share your unique referral code with friends and fellow creators' },
    { step: '2', title: 'They Sign Up', description: 'Your friends create an account using your referral code' },
    { step: '3', title: 'Both Earn Rewards', description: 'You both receive ₹500 when they complete their first campaign' },
  ];

  return (
    <>
      <View style={[styles.referralCard, { borderColor: colors.primaryBorder, marginTop: spacing.md }]}>
        <LinearGradient
          colors={referralGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.referralGradient}
        >
          <View style={styles.referralHeader}>
            <View style={[styles.referralIcon, { backgroundColor: colors.primaryLight }]}>
              <Feather name="gift" size={24} color={colors.primary} />
            </View>
            <View style={styles.referralInfo}>
              <Text style={[styles.referralTitle, { color: colors.text, fontSize: 18 }]}>Refer & Earn</Text>
              <Text style={[styles.referralSubtitle, { color: colors.textSecondary }]}>Invite friends, earn rewards together</Text>
            </View>
          </View>

          <View style={[styles.codeContainer, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)', borderColor: colors.cardBorder }]}>
            <View style={styles.codeBox}>
              <Text style={[styles.codeLabel, { color: colors.textMuted }]}>Your Referral Code</Text>
              <Text style={[styles.codeValue, { color: colors.primary, fontSize: 20 }]}>{user.referralCode}</Text>
            </View>
            <TouchableOpacity style={[styles.copyBtn, { backgroundColor: colors.primaryLight }]} onPress={handleCopyCode}>
              <Feather name="copy" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.shareButton, { backgroundColor: colors.primary }]} 
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Feather name="share-2" size={18} color="#ffffff" />
            <Text style={styles.shareButtonText}>Share with Friends</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={[styles.statsBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{user.referralCount}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Referrals</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.emerald }]}>₹{user.referralEarnings.toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Earned</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.cardBorder }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.amber }]}>3</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Pending</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How It Works</Text>
        </View>
        <View style={[styles.howItWorksCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {howItWorks.map((item, index) => (
            <View 
              key={item.step} 
              style={[
                styles.howItWorksItem,
                index < howItWorks.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder }
              ]}
            >
              <View style={[styles.stepCircle, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.stepNumber, { color: colors.primary }]}>{item.step}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Reward Tiers</Text>
        </View>
        <View style={[styles.tiersCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {rewardTiers.map((tier, index) => (
            <View 
              key={tier.tier} 
              style={[
                styles.tierItem,
                index < rewardTiers.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder }
              ]}
            >
              <View style={[styles.tierIcon, { 
                backgroundColor: tier.tier === 'Bronze' ? 'rgba(205, 127, 50, 0.15)' :
                                tier.tier === 'Silver' ? 'rgba(192, 192, 192, 0.15)' :
                                tier.tier === 'Gold' ? 'rgba(255, 215, 0, 0.15)' :
                                'rgba(139, 92, 246, 0.15)'
              }]}>
                <Feather 
                  name={tier.icon as any} 
                  size={18} 
                  color={tier.tier === 'Bronze' ? '#CD7F32' :
                         tier.tier === 'Silver' ? '#A0A0A0' :
                         tier.tier === 'Gold' ? '#FFD700' :
                         colors.primary}
                />
              </View>
              <View style={styles.tierInfo}>
                <Text style={[styles.tierName, { color: colors.text }]}>{tier.tier}</Text>
                <Text style={[styles.tierReferrals, { color: colors.textSecondary }]}>{tier.referrals} referrals</Text>
              </View>
              <Text style={[styles.tierReward, { color: colors.emerald }]}>{tier.reward}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Terms & Conditions</Text>
        </View>
        <View style={[styles.termsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.termItem}>
            <Feather name="check-circle" size={14} color={colors.emerald} />
            <Text style={[styles.termText, { color: colors.textSecondary }]}>Rewards credited within 7 days of campaign completion</Text>
          </View>
          <View style={styles.termItem}>
            <Feather name="check-circle" size={14} color={colors.emerald} />
            <Text style={[styles.termText, { color: colors.textSecondary }]}>Referred user must complete KYC verification</Text>
          </View>
          <View style={styles.termItem}>
            <Feather name="check-circle" size={14} color={colors.emerald} />
            <Text style={[styles.termText, { color: colors.textSecondary }]}>No limit on number of referrals</Text>
          </View>
          <View style={styles.termItem}>
            <Feather name="check-circle" size={14} color={colors.emerald} />
            <Text style={[styles.termText, { color: colors.textSecondary }]}>Rewards can be withdrawn to bank account</Text>
          </View>
        </View>
      </View>
    </>
  );
}

function LeaderboardContent() {
  const { colors } = useTheme();

  return (
    <View style={styles.comingSoonContainer}>
      <View style={[styles.comingSoonCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={[styles.comingSoonIconWrapper, { backgroundColor: colors.primaryLight }]}>
          <Feather name="trending-up" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.comingSoonTitle, { color: colors.text }]}>Leaderboard Coming Soon</Text>
        <Text style={[styles.comingSoonDescription, { color: colors.textSecondary }]}>
          Compete with other creators and climb the ranks! See who is earning the most, getting the best campaigns, and becoming a top influencer.
        </Text>
        <View style={styles.comingSoonFeatures}>
          <View style={styles.comingSoonFeatureItem}>
            <Feather name="award" size={20} color={colors.amber} />
            <Text style={[styles.comingSoonFeatureText, { color: colors.text }]}>Weekly Rankings</Text>
          </View>
          <View style={styles.comingSoonFeatureItem}>
            <Feather name="gift" size={20} color={colors.emerald} />
            <Text style={[styles.comingSoonFeatureText, { color: colors.text }]}>Exclusive Rewards</Text>
          </View>
          <View style={styles.comingSoonFeatureItem}>
            <Feather name="users" size={20} color={colors.primary} />
            <Text style={[styles.comingSoonFeatureText, { color: colors.text }]}>Community Badges</Text>
          </View>
        </View>
        <View style={[styles.notifyBadge, { backgroundColor: colors.primaryLight }]}>
          <Feather name="bell" size={14} color={colors.primary} />
          <Text style={[styles.notifyText, { color: colors.primary }]}>We will notify you when it is ready!</Text>
        </View>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [selectedTab, setSelectedTab] = useState('profile');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.stickyHeader, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.7}>
          <Avatar size={30} name="User" />
        </TouchableOpacity>
        <View style={styles.headerTabsContainer}>
          {headerTabs.map((tab) => (
            <HeaderTabButton
              key={tab.id}
              label={tab.label}
              isActive={selectedTab === tab.id}
              onPress={() => setSelectedTab(tab.id)}
              colors={colors}
              isDark={isDark}
            />
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'profile' && <ProfileContent />}
        {selectedTab === 'refer' && <ReferEarnContent />}
        {selectedTab === 'leaderboard' && <LeaderboardContent />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.md,
    zIndex: 100,
  },
  headerTabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerTabButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTabButtonActive: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  headerTabButtonInactive: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
  },
  headerTabButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  headerTabButtonTextActive: {
    color: '#FFFFFF',
  },
  headerTabButtonTextInactive: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  verifiedBadge: {
    marginLeft: spacing.sm,
    borderRadius: borderRadius.full,
    padding: 4,
  },
  editProfileBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  referralCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  referralGradient: {
    padding: spacing.lg,
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  referralIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  referralInfo: {
    flex: 1,
  },
  referralTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  referralSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  codeBox: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
  },
  copyBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  settingsCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  connectAccountsCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  connectAccountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  connectAccountIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  connectAccountInfo: {
    flex: 1,
  },
  connectAccountPlatform: {
    fontSize: 14,
    fontWeight: '500',
  },
  connectAccountHandle: {
    fontSize: 12,
    marginTop: 2,
  },
  connectAccountFollowers: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  followersValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  followersLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    height: 48,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: spacing.sm,
  },
  howItWorksCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  howItWorksItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  stepDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  tiersCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tierItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  tierIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 14,
    fontWeight: '600',
  },
  tierReferrals: {
    fontSize: 12,
    marginTop: 2,
  },
  tierReward: {
    fontSize: 14,
    fontWeight: '600',
  },
  termsCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  termText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  comingSoonContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  comingSoonCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  comingSoonIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  comingSoonTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  comingSoonDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  comingSoonFeatures: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  comingSoonFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  comingSoonFeatureText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  notifyText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

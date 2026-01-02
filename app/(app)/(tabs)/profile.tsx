import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, Alert, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { spacing, borderRadius } from '@/src/theme';
import { Avatar } from '@/src/components';
import { useApp } from '@/src/context';
import { useTheme } from '@/src/hooks';

const socialAccounts = [
  { 
    platform: 'Instagram', 
    handle: '@alexcreators', 
    connected: true,
    icon: 'instagram',
    gradient: ['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888'] as const,
  },
  { 
    platform: 'TikTok', 
    handle: '@alexcreators', 
    connected: true,
    icon: 'video',
    bgColor: '#000000',
  },
  { 
    platform: 'YouTube', 
    handle: 'Not connected', 
    connected: false,
    icon: 'youtube',
    bgColor: '#FF0000',
  },
];

const creatorToolkit = [
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
  const { user, darkMode, toggleDarkMode } = useApp();
  const { colors, isDark } = useTheme();
  
  const [fullName, setFullName] = useState(user.name);
  const [bio, setBio] = useState('Digital creator focused on lifestyle, tech, and modern living. Creating content that inspires.');
  const [email, setEmail] = useState('alex@creatorx.com');
  
  const [preferences, setPreferences] = useState({
    pushNotifications: true,
    emailDigest: false,
    profileVisibility: true,
  });

  const togglePreference = (key: string) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleSave = () => {
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => {} },
    ]);
  };

  const handleToolkitPress = (action: string) => {
    switch (action) {
      case 'refer':
        router.push('/refer');
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity 
          style={styles.backButton} 
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
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={['#1337ec', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <View style={[styles.avatarInner, { backgroundColor: colors.card, borderColor: colors.background }]}>
                <Avatar size={88} name={user.name} imageUrl={user.avatarUri} />
              </View>
            </LinearGradient>
            <TouchableOpacity 
              style={[styles.editAvatarButton, { backgroundColor: colors.primary, borderColor: colors.background }]}
              activeOpacity={0.8}
            >
              <Feather name="edit-2" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
          <Text style={[styles.userHandle, { color: colors.textSecondary }]}>{user.username}</Text>
        </View>

        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PERSONAL INFO</Text>
            
            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1e1e1e' : '#f8fafc', color: colors.text }]}
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: isDark ? '#1e1e1e' : '#f8fafc', color: colors.text }]}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email Address</Text>
              <View style={[styles.inputWithIcon, { backgroundColor: isDark ? '#1e1e1e' : '#f8fafc' }]}>
                <Feather name="mail" size={18} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputInner, { color: colors.text }]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>CONNECTED ACCOUNTS</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {socialAccounts.map((account, index) => (
              <View 
                key={account.platform}
                style={[
                  styles.accountItem,
                  index < socialAccounts.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder }
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
                    ) : account.platform === 'TikTok' ? (
                      <Text style={[styles.tiktokText, { color: isDark ? '#000' : '#fff' }]}>Tk</Text>
                    ) : (
                      <Feather name="play" size={18} color="#ffffff" />
                    )}
                  </View>
                  <View>
                    <Text style={[styles.accountPlatform, { color: colors.text }]}>{account.platform}</Text>
                    <Text style={[styles.accountHandle, { color: colors.textSecondary }]}>
                      {account.connected ? `Connected as ${account.handle}` : account.handle}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text style={[
                    styles.accountAction,
                    account.connected 
                      ? { color: colors.textMuted }
                      : { color: colors.primary, fontWeight: '700' }
                  ]}>
                    {account.connected ? 'Disconnect' : 'Connect'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>CREATOR TOOLKIT</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {creatorToolkit.map((item, index) => (
              <TouchableOpacity 
                key={item.action}
                style={[
                  styles.menuItem,
                  index < creatorToolkit.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder }
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
                    <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>APP PREFERENCES</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {appPreferences.map((pref, index) => (
              <View 
                key={pref.key}
                style={[
                  styles.preferenceItem,
                  index < appPreferences.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.cardBorder }
                ]}
              >
                <View style={styles.preferenceLeft}>
                  <View style={[styles.menuItemIcon, { backgroundColor: pref.iconBg }]}>
                    <Feather name={pref.icon as any} size={18} color={pref.iconColor} />
                  </View>
                  <View>
                    <Text style={[styles.menuItemLabel, { color: colors.text }]}>{pref.label}</Text>
                    <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>{pref.subtitle}</Text>
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
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <TouchableOpacity 
              style={[styles.simpleMenuItem, { borderBottomWidth: 1, borderBottomColor: colors.cardBorder }]}
              onPress={() => router.push('/wallet')}
              activeOpacity={0.7}
            >
              <Text style={[styles.simpleMenuLabel, { color: colors.text }]}>Payment Methods</Text>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.simpleMenuItem, { borderBottomWidth: 1, borderBottomColor: colors.cardBorder }]}
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
          <Text style={[styles.versionText, { color: colors.textMuted }]}>Version 2.4.0 (Build 1024)</Text>
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

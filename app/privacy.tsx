import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { Button } from '@/src/components';
import { useApp } from '@/src/context';

interface SecurityItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  enabled?: boolean;
  action?: 'toggle' | 'navigate' | 'danger';
}

export default function PrivacyScreen() {
  const router = useRouter();
  const { addNotification } = useApp();
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showEarnings, setShowEarnings] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);

  const handleToggle2FA = useCallback(() => {
    if (!twoFactorEnabled) {
      Alert.alert(
        'Enable Two-Factor Authentication',
        'This will add an extra layer of security to your account. You will receive a verification code via SMS each time you log in.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: () => {
              setTwoFactorEnabled(true);
              addNotification({
                type: 'system',
                title: 'Security Update',
                description: 'Two-factor authentication has been enabled',
                time: 'Just now',
                read: false,
              });
            },
          },
        ]
      );
    } else {
      setTwoFactorEnabled(false);
    }
  }, [twoFactorEnabled, addNotification]);

  const handleChangePassword = useCallback(() => {
    Alert.alert(
      'Change Password',
      'Enter your current password to continue',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            addNotification({
              type: 'system',
              title: 'Password Changed',
              description: 'Your password has been updated successfully',
              time: 'Just now',
              read: false,
            });
            Alert.alert('Success', 'Password changed successfully!');
          },
        },
      ]
    );
  }, [addNotification]);

  const handleDownloadData = useCallback(() => {
    Alert.alert(
      'Download Your Data',
      'We will prepare a copy of your data and send it to your registered email address. This may take up to 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Download',
          onPress: () => {
            addNotification({
              type: 'system',
              title: 'Data Download Requested',
              description: 'You will receive an email with your data within 24 hours',
              time: 'Just now',
              read: false,
            });
            Alert.alert('Request Submitted', 'You will receive an email with your data download link within 24 hours.');
          },
        },
      ]
    );
  }, [addNotification]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone. All your data, earnings history, and documents will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Confirmation Required', 'Please enter your password to confirm account deletion.');
          },
        },
      ]
    );
  }, []);

  const handleManageSessions = useCallback(() => {
    Alert.alert(
      'Active Sessions',
      'You are currently logged in on:\n\n- This device (current)\n- iPhone 14 Pro (Mumbai)\n- Chrome on Windows (Delhi)',
      [
        { text: 'Close', style: 'cancel' },
        {
          text: 'Log Out All',
          style: 'destructive',
          onPress: () => {
            addNotification({
              type: 'system',
              title: 'Sessions Terminated',
              description: 'You have been logged out from all other devices',
              time: 'Just now',
              read: false,
            });
            Alert.alert('Success', 'Logged out from all other devices');
          },
        },
      ]
    );
  }, [addNotification]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Privacy & Security</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.securityCard}>
          <LinearGradient
            colors={['rgba(52, 211, 153, 0.2)', 'rgba(52, 211, 153, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.securityGradient}
          >
            <View style={styles.securityHeader}>
              <View style={[styles.shieldIcon, { backgroundColor: colors.emeraldLight }]}>
                <Feather name="shield" size={24} color={colors.emerald} />
              </View>
              <View style={styles.securityInfo}>
                <Text style={styles.securityTitle}>Account Security</Text>
                <Text style={styles.securitySubtitle}>
                  {twoFactorEnabled ? 'Strong protection enabled' : 'Enable 2FA for better security'}
                </Text>
              </View>
              <View style={[styles.securityBadge, { backgroundColor: twoFactorEnabled ? colors.emeraldLight : colors.amberLight }]}>
                <Text style={[styles.securityBadgeText, { color: twoFactorEnabled ? colors.emerald : colors.amber }]}>
                  {twoFactorEnabled ? 'Strong' : 'Medium'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.primaryLight }]}>
                  <Feather name="smartphone" size={18} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                  <Text style={styles.settingDescription}>SMS verification on login</Text>
                </View>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={handleToggle2FA}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.emeraldLight }]}>
                  <Feather name="lock" size={18} color={colors.emerald} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Biometric Login</Text>
                  <Text style={styles.settingDescription}>Use fingerprint or face ID</Text>
                </View>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.amberLight }]}>
                  <Feather name="bell" size={18} color={colors.amber} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Login Alerts</Text>
                  <Text style={styles.settingDescription}>Get notified of new logins</Text>
                </View>
              </View>
              <Switch
                value={loginAlertsEnabled}
                onValueChange={setLoginAlertsEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.blueLight }]}>
                  <Feather name="key" size={18} color={colors.blue} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Change Password</Text>
                  <Text style={styles.settingDescription}>Update your password</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingItem} onPress={handleManageSessions}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.primaryLight }]}>
                  <Feather name="monitor" size={18} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Active Sessions</Text>
                  <Text style={styles.settingDescription}>Manage logged-in devices</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.primaryLight }]}>
                  <Feather name="eye" size={18} color={colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Public Profile</Text>
                  <Text style={styles.settingDescription}>Show profile to brands</Text>
                </View>
              </View>
              <Switch
                value={profileVisibility}
                onValueChange={setProfileVisibility}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.emeraldLight }]}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.emerald }}>₹</Text>
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Show Earnings</Text>
                  <Text style={styles.settingDescription}>Display earnings on profile</Text>
                </View>
              </View>
              <Switch
                value={showEarnings}
                onValueChange={setShowEarnings}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.amberLight }]}>
                  <Feather name="share-2" size={18} color={colors.amber} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Data Sharing</Text>
                  <Text style={styles.settingDescription}>Share analytics with brands</Text>
                </View>
              </View>
              <Switch
                value={dataSharing}
                onValueChange={setDataSharing}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.text}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.dataItem} onPress={handleDownloadData}>
            <View style={[styles.dataIcon, { backgroundColor: colors.blueLight }]}>
              <Feather name="download" size={18} color={colors.blue} />
            </View>
            <View style={styles.dataContent}>
              <Text style={styles.dataTitle}>Download Your Data</Text>
              <Text style={styles.dataDescription}>Get a copy of all your information</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dataItem, styles.dangerItem]} onPress={handleDeleteAccount}>
            <View style={[styles.dataIcon, { backgroundColor: colors.redLight }]}>
              <Feather name="trash-2" size={18} color={colors.red} />
            </View>
            <View style={styles.dataContent}>
              <Text style={[styles.dataTitle, { color: colors.red }]}>Delete Account</Text>
              <Text style={styles.dataDescription}>Permanently remove your account</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.red} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using CreatorX, you agree to our Privacy Policy and Terms of Service
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  securityCard: {
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  securityGradient: {
    padding: spacing.xl,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  securityTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  securitySubtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  securityBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  securityBadgeText: {
    ...typography.xs,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  settingsCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text,
  },
  settingDescription: {
    ...typography.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginHorizontal: spacing.lg,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  dangerItem: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  dataIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  dataTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  dataDescription: {
    ...typography.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  footerText: {
    ...typography.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { Avatar, Button } from '@/src/components';
import { useApp } from '@/src/context';
import { SocialLink, Address } from '@/src/types';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser, addNotification } = useApp();

  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio);
  const [categories, setCategories] = useState<string[]>(user.categories);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(user.socialLinks);
  const [preferences, setPreferences] = useState(user.preferences);
  const [avatarUri, setAvatarUri] = useState(user.avatarUri);
  const [birthDate, setBirthDate] = useState(user.birthDate || '');
  const [address, setAddress] = useState<Address>(user.address || {
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const allCategories = ['Fashion', 'Tech', 'Lifestyle', 'Food', 'Travel', 'Fitness', 'Beauty', 'Gaming'];

  const handleSave = useCallback(async () => {
    if (!name.trim() || !username.trim() || !email.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const hasAddress = address.line1 || address.city || address.state || address.postalCode || address.country;
    
    updateUser({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      bio: bio.trim(),
      categories,
      socialLinks,
      preferences,
      avatarUri,
      birthDate: birthDate.trim() || undefined,
      address: hasAddress ? address : undefined,
    });
    
    addNotification({
      type: 'system',
      title: 'Profile Updated',
      description: 'Your profile changes have been saved successfully',
      time: 'Just now',
      read: true,
    });
    
    setIsSaving(false);
    Alert.alert('Success', 'Your profile has been updated!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  }, [name, username, email, bio, categories, socialLinks, preferences, avatarUri, birthDate, address, updateUser, addNotification, router]);

  const handleChangePhoto = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photos to change your profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }, []);

  const handleEditSocialLink = useCallback((index: number) => {
    const link = socialLinks[index];
    Alert.prompt(
      `Edit ${link.platform} Handle`,
      `Current: ${link.url}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (newUrl) => {
            if (newUrl && newUrl.trim()) {
              setSocialLinks(prev => prev.map((l, i) => 
                i === index ? { ...l, url: newUrl.trim() } : l
              ));
            }
          },
        },
      ],
      'plain-text',
      link.url
    );
  }, [socialLinks]);

  const togglePreference = useCallback((key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, [preferences]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="x" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handleChangePhoto}>
              <Avatar size={100} name={name} imageUrl={avatarUri} showBadge />
              <View style={styles.editAvatarButton}>
                <Feather name="camera" size={16} color={colors.text} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleChangePhoto}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username *</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="@username"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell brands about yourself..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={200}
              />
              <Text style={styles.charCount}>{bio.length}/200</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Birth Date</Text>
              <TextInput
                style={styles.input}
                value={birthDate}
                onChangeText={setBirthDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Line 1</Text>
              <TextInput
                style={styles.input}
                value={address.line1}
                onChangeText={(text) => setAddress(prev => ({ ...prev, line1: text }))}
                placeholder="Street address"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address Line 2 (Optional)</Text>
              <TextInput
                style={styles.input}
                value={address.line2 || ''}
                onChangeText={(text) => setAddress(prev => ({ ...prev, line2: text }))}
                placeholder="Apartment, suite, etc."
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  value={address.city}
                  onChangeText={(text) => setAddress(prev => ({ ...prev, city: text }))}
                  placeholder="City"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>State</Text>
                <TextInput
                  style={styles.input}
                  value={address.state}
                  onChangeText={(text) => setAddress(prev => ({ ...prev, state: text }))}
                  placeholder="State"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={styles.inputLabel}>Postal Code</Text>
                <TextInput
                  style={styles.input}
                  value={address.postalCode}
                  onChangeText={(text) => setAddress(prev => ({ ...prev, postalCode: text }))}
                  placeholder="Postal code"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Country</Text>
                <TextInput
                  style={styles.input}
                  value={address.country}
                  onChangeText={(text) => setAddress(prev => ({ ...prev, country: text }))}
                  placeholder="Country"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Connected Accounts</Text>
            </View>

            {socialLinks.map((link, index) => (
              <TouchableOpacity
                key={link.platform}
                style={styles.socialLinkItem}
                onPress={() => handleEditSocialLink(index)}
              >
                <View style={styles.socialLinkIcon}>
                  <Feather name={link.icon as any} size={18} color={colors.text} />
                </View>
                <View style={styles.socialLinkContent}>
                  <Text style={styles.socialLinkPlatform}>{link.platform}</Text>
                  <Text style={styles.socialLinkUrl}>{link.url}</Text>
                </View>
                <View style={styles.followersContainer}>
                  <Text style={styles.followersCount}>{link.followers}</Text>
                  <Text style={styles.followersLabel}>followers</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Creator Categories</Text>
            <View style={styles.categoriesGrid}>
              {allCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    categories.includes(category) && styles.categoryChipActive,
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      categories.includes(category) && styles.categoryChipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content Preferences</Text>
            
            <View style={styles.preferenceCard}>
              <LinearGradient
                colors={['#1a1a1a', '#141414']}
                style={styles.preferenceGradient}
              >
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Available for Campaigns</Text>
                  <Switch
                    value={preferences.availableForCampaigns}
                    onValueChange={() => togglePreference('availableForCampaigns')}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.text}
                  />
                </View>
                <View style={styles.preferenceRow}>
                  <Text style={styles.preferenceLabel}>Show Profile Publicly</Text>
                  <Switch
                    value={preferences.showProfilePublicly}
                    onValueChange={() => togglePreference('showProfilePublicly')}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.text}
                  />
                </View>
                <View style={[styles.preferenceRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.preferenceLabel}>Email Notifications</Text>
                  <Switch
                    value={preferences.emailNotifications}
                    onValueChange={() => togglePreference('emailNotifications')}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.text}
                  />
                </View>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.dangerSection}>
            <TouchableOpacity 
              style={styles.dangerButton}
              onPress={() => Alert.alert('Delete Account', 'Are you sure you want to delete your account? This action cannot be undone.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => {} }
              ])}
            >
              <Feather name="trash-2" size={18} color={colors.red} />
              <Text style={styles.dangerButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
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
  title: {
    ...typography.h4,
    color: colors.text,
  },
  saveButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  changePhotoText: {
    ...typography.small,
    color: colors.primary,
    marginTop: spacing.md,
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
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  inputLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontSize: 10,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: 15,
  },
  bioInput: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  charCount: {
    ...typography.xs,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  socialLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  socialLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialLinkContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  socialLinkPlatform: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  socialLinkUrl: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  followersContainer: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  followersCount: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  followersLabel: {
    ...typography.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  categoryChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  categoryChipText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  preferenceCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  preferenceGradient: {
    padding: spacing.lg,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  preferenceLabel: {
    ...typography.body,
    color: colors.text,
  },
  dangerSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  dangerButtonText: {
    ...typography.body,
    color: colors.red,
    marginLeft: spacing.sm,
  },
});

import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius } from '@/src/theme';

const STORAGE_KEYS = {
  COMMERCIAL_PROFILE: '@creator_commercial_profile',
  ONBOARDING_COMPLETE: '@onboarding_complete_creator',
};

export default function OnboardingCommercialScreen() {
  const router = useRouter();
  const [reelRate, setReelRate] = useState('');
  const [storyRate, setStoryRate] = useState('');
  const [postRate, setPostRate] = useState('');
  const [youtubeRate, setYoutubeRate] = useState('');
  const [shortRate, setShortRate] = useState('');
  const [liveRate, setLiveRate] = useState('');

  const handleFinish = async () => {
    const payload = {
      reelRate: reelRate.trim() || null,
      storyRate: storyRate.trim() || null,
      postRate: postRate.trim() || null,
      youtubeRate: youtubeRate.trim() || null,
      shortRate: shortRate.trim() || null,
      liveRate: liveRate.trim() || null,
    };

    await AsyncStorage.setItem(STORAGE_KEYS.COMMERCIAL_PROFILE, JSON.stringify(payload));
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, '1');
    router.replace('/(app)/(tabs)/explore');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient colors={['#0c0f1c', '#101322', '#0a0c16']} style={styles.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.progressRow}>
          <View style={styles.progressPill} />
          <View style={styles.progressPill} />
          <View style={[styles.progressPill, styles.progressActive]} />
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Your pricing</Text>
          <Text style={styles.subtitle}>
            Tell brands what you charge for each content format. You can update this later.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram Reel (30-60s)</Text>
            <TextInput
              style={styles.input}
              value={reelRate}
              onChangeText={setReelRate}
              placeholder="₹25,000"
              placeholderTextColor="rgba(255,255,255,0.35)"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram Story (3 frames)</Text>
            <TextInput
              style={styles.input}
              value={storyRate}
              onChangeText={setStoryRate}
              placeholder="₹10,000"
              placeholderTextColor="rgba(255,255,255,0.35)"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instagram Post (static)</Text>
            <TextInput
              style={styles.input}
              value={postRate}
              onChangeText={setPostRate}
              placeholder="₹18,000"
              placeholderTextColor="rgba(255,255,255,0.35)"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>YouTube Video</Text>
            <TextInput
              style={styles.input}
              value={youtubeRate}
              onChangeText={setYoutubeRate}
              placeholder="₹45,000"
              placeholderTextColor="rgba(255,255,255,0.35)"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Shorts / Reels Cross-post</Text>
            <TextInput
              style={styles.input}
              value={shortRate}
              onChangeText={setShortRate}
              placeholder="₹12,000"
              placeholderTextColor="rgba(255,255,255,0.35)"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Live Session (30 min)</Text>
            <TextInput
              style={styles.input}
              value={liveRate}
              onChangeText={setLiveRate}
              placeholder="₹60,000"
              placeholderTextColor="rgba(255,255,255,0.35)"
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleFinish} activeOpacity={0.85}>
          <Text style={styles.primaryButtonText}>Finish & Explore</Text>
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
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
  },
  titleWrap: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.6)',
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    color: '#ffffff',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    backgroundColor: 'rgba(16,19,34,0.9)',
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

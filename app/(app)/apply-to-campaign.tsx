import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/hooks';

const campaignSummary = {
  brand: 'Sephora',
  title: 'Summer Glow',
  reward: '$800',
  type: 'UGC',
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCARMixh25daO2UTWUWH-AXW7A73VY54z8orSavGJMuDN7paZ-yXuUgHBysS5ywnA4HDG3TmMXGb6GlfYvDy53wUnfrB73rGSJzOVKzfI9cxsioqv0aP3LWK0VIE0jlPdn5J47VWnPsdvmb-wVQwssBtp53u9ZASYmV0r9FUIqnm-CNGLDLoE72dAtdUkhFXxJCLyYDxwmZB17x46A9paOJ_yzBf2JpyLBlyQCBFZ-W70e_nX3SOouwApITZUeuf95aycnaSG8uXWA',
};

export default function ApplyToCampaignScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [pitch, setPitch] = useState('');
  const [fee, setFee] = useState('800');
  const [portfolio, setPortfolio] = useState('');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#101322' : colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.cardBorder, backgroundColor: isDark ? 'rgba(16, 19, 34, 0.9)' : 'rgba(255, 255, 255, 0.9)' }]}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Apply to Campaign</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.summaryCard, { backgroundColor: isDark ? '#1c1d27' : colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.summaryInfo}>
            <View style={styles.brandRow}>
              <View style={styles.brandAvatar}>
                <Text style={styles.brandInitial}>{campaignSummary.brand.charAt(0)}</Text>
              </View>
              <Text style={[styles.brandText, { color: colors.textSecondary }]}>{campaignSummary.brand}</Text>
            </View>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>{campaignSummary.title}</Text>
            <View style={styles.summaryTags}>
              <View style={[styles.tagPill, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                <Text style={[styles.tagText, { color: '#22c55e' }]}>{campaignSummary.reward}</Text>
              </View>
              <View style={[styles.tagPill, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
                <Text style={[styles.tagText, { color: '#a855f7' }]}>{campaignSummary.type}</Text>
              </View>
            </View>
          </View>
          <Image source={{ uri: campaignSummary.image }} style={styles.summaryImage} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Pitch</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Why are you the perfect fit for this campaign?
          </Text>
        </View>

        <TextInput
          style={[styles.pitchInput, { backgroundColor: isDark ? '#1c1d27' : colors.card, color: colors.text }]}
          placeholder="Hi! I love your products and have an audience that fits perfectly because..."
          placeholderTextColor={colors.textMuted}
          value={pitch}
          onChangeText={setPitch}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <View style={styles.inputGrid}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Proposed Fee</Text>
            <View style={[styles.inputField, { backgroundColor: isDark ? '#1c1d27' : colors.card }]}>
              <Text style={[styles.inputPrefix, { color: colors.textMuted }]}>$</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                keyboardType="number-pad"
                value={fee}
                onChangeText={setFee}
                placeholder="800"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Portfolio URL</Text>
            <View style={[styles.inputField, { backgroundColor: isDark ? '#1c1d27' : colors.card }]}>
              <Feather name="link" size={14} color={colors.textMuted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={portfolio}
                onChangeText={setPortfolio}
                placeholder="creator.x/you"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <View style={[styles.deliverablesCard, { backgroundColor: isDark ? '#1c1d27' : colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.deliverablesTitle, { color: colors.textSecondary }]}>Deliverables Required</Text>
          <View style={styles.deliverableRow}>
            <View style={[styles.deliverableIcon, { backgroundColor: 'rgba(19, 55, 236, 0.15)' }]}>
              <Feather name="video" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.deliverableText, { color: colors.text }]}>1 TikTok / Reel (30-60s)</Text>
          </View>
          <View style={styles.deliverableRow}>
            <View style={[styles.deliverableIcon, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
              <Feather name="edit-3" size={16} color="#ec4899" />
            </View>
            <Text style={[styles.deliverableText, { color: colors.text }]}>3 Instagram Stories (with link)</Text>
          </View>
        </View>

        <View style={styles.noticeRow}>
          <View style={[styles.noticeIcon, { backgroundColor: 'rgba(19, 55, 236, 0.15)' }]}>
            <Feather name="shield" size={16} color={colors.primary} />
          </View>
          <View style={styles.noticeText}>
            <Text style={[styles.noticeTitle, { color: colors.primary }]}>CreatorX Media Kit attached</Text>
            <Text style={[styles.noticeSubtitle, { color: colors.textSecondary }]}>
              Your profile stats and past work will be shared automatically.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.cardBorder, backgroundColor: isDark ? 'rgba(16, 19, 34, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}>
        <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.submitText}>Submit Application</Text>
          <Feather name="send" size={16} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          By submitting, you agree to the <Text style={styles.footerLink}>Creator Terms</Text>.
        </Text>
      </View>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 140,
    gap: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  summaryInfo: {
    flex: 1,
    padding: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  brandAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInitial: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  brandText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tagPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  summaryImage: {
    width: 100,
    height: '100%',
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
  },
  pitchInput: {
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  inputGroup: {
    flex: 1,
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputPrefix: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  deliverablesCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  deliverablesTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  deliverableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deliverableIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliverableText: {
    fontSize: 13,
    fontWeight: '600',
  },
  noticeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(19, 55, 236, 0.08)',
  },
  noticeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeText: {
    flex: 1,
    gap: 4,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  noticeSubtitle: {
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  submitButton: {
    height: 52,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1337ec',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  footerText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 11,
  },
  footerLink: {
    color: '#1337ec',
    fontWeight: '600',
  },
});

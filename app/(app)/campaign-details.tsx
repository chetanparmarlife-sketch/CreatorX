import { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { spacing, borderRadius } from '@/src/theme';
import { useTheme } from '@/src/hooks';

const { width: screenWidth } = Dimensions.get('window');

const campaignData = {
  id: '1',
  title: 'Summer Skincare Launch',
  brand: 'GlowCo',
  brandVerified: true,
  heroImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
  budget: '$1,200',
  platform: 'Instagram Reel',
  deadline: 'Oct 15, 2023',
  tags: ['#Skincare', '#Lifestyle', 'Paid Partnership'],
  description: 'We are looking for authentic creators to showcase our new SPF 50 line. The goal is to highlight the lightweight texture and non-greasy finish. We want to see how you incorporate sun protection into your daily summer routine, keeping it fun and educational.',
  deliverables: [
    { id: '1', icon: 'video', title: '1x Instagram Reel', description: '30-60s vertical video focusing on application texture.' },
    { id: '2', icon: 'link', title: 'Link in Bio', description: 'Maintain tracking link in bio for 48 hours.' },
  ],
  dos: ['Show product packaging clearly', 'Mention "No White Cast"'],
  donts: ['Mention other SPF brands', 'Use music with copyright'],
  hoursLeft: 24,
};

export default function CampaignDetailsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [isSaved, setIsSaved] = useState(false);

  const handleApply = useCallback(() => {
    router.push('/apply-to-campaign');
  }, [router]);

  const handleShare = useCallback(() => {
  }, []);

  const handleSave = useCallback(() => {
    setIsSaved(!isSaved);
  }, [isSaved]);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#101322' : colors.background }]}>
      <View style={[styles.header, { backgroundColor: isDark ? 'rgba(16, 19, 34, 0.85)' : 'rgba(255, 255, 255, 0.8)' }]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Feather name="share" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
            <Feather 
              name={isSaved ? "bookmark" : "bookmark"} 
              size={20} 
              color={isSaved ? colors.primary : colors.text} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: campaignData.heroImage }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)', isDark ? '#101322' : '#ffffff']}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <View style={[styles.brandPill, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <View style={styles.brandAvatar}>
                <Text style={styles.brandAvatarText}>{campaignData.brand.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.brandName}>{campaignData.brand}</Text>
                {campaignData.brandVerified && (
                  <View style={styles.verifiedRow}>
                    <Text style={styles.verifiedText}>Verified Brand</Text>
                    <Feather name="check-circle" size={10} color="#3b82f6" />
                  </View>
                )}
              </View>
            </View>
            <Text style={styles.heroTitle}>{campaignData.title}</Text>
          </View>
        </View>

        <View style={styles.tagsRow}>
          {campaignData.tags.map((tag, index) => (
            <View 
              key={index}
              style={[
                styles.tag,
                tag === 'Paid Partnership' 
                  ? { backgroundColor: 'rgba(19, 55, 236, 0.1)', borderColor: 'rgba(19, 55, 236, 0.2)' }
                  : { backgroundColor: colors.card, borderColor: colors.cardBorder }
              ]}
            >
              <Text style={[
                styles.tagText,
                { color: tag === 'Paid Partnership' ? colors.primary : colors.text }
              ]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>EARN</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{campaignData.budget}</Text>
            <Text style={[styles.statExtra, { color: colors.textMuted }]}>+5% comms</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>PLATFORM</Text>
            <View style={styles.platformRow}>
              <Feather name="camera" size={16} color="#ec4899" />
              <Text style={[styles.platformText, { color: colors.text }]}>IG Reel</Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>DEADLINE</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>Oct 15</Text>
            <Text style={[styles.statExtra, { color: colors.textMuted }]}>2023</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.cardBorder }]} />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About the Campaign</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {campaignData.description}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Assignment</Text>
            <View style={[styles.countBadge, { backgroundColor: 'rgba(19, 55, 236, 0.15)' }]}>
              <Text style={[styles.countText, { color: colors.primary }]}>2 Items</Text>
            </View>
          </View>
          {campaignData.deliverables.map(item => (
            <View 
              key={item.id}
              style={[styles.deliverableCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            >
              <View style={[styles.deliverableIcon, { backgroundColor: 'rgba(19, 55, 236, 0.1)' }]}>
                <Feather name={item.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={styles.deliverableContent}>
                <Text style={[styles.deliverableTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.deliverableDesc, { color: colors.textSecondary }]}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.dosdontsGrid}>
          <View style={[styles.dosCard, { backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <View style={styles.dosHeader}>
              <Feather name="check-circle" size={18} color="#10b981" />
              <Text style={styles.dosTitle}>Do's</Text>
            </View>
            {campaignData.dos.map((item, index) => (
              <View key={index} style={styles.dosItem}>
                <View style={[styles.dosDot, { backgroundColor: '#10b981' }]} />
                <Text style={[styles.dosText, { color: colors.textSecondary }]}>{item}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.dosCard, { backgroundColor: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <View style={styles.dosHeader}>
              <Feather name="x-circle" size={18} color="#ef4444" />
              <Text style={[styles.dontsTitle]}>Don'ts</Text>
            </View>
            {campaignData.donts.map((item, index) => (
              <View key={index} style={styles.dosItem}>
                <View style={[styles.dosDot, { backgroundColor: '#ef4444' }]} />
                <Text style={[styles.dosText, { color: colors.textSecondary }]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.bottomCta, { backgroundColor: isDark ? '#101322' : colors.background, borderTopColor: colors.cardBorder }]}>
        <TouchableOpacity 
          style={[styles.applyButton, { backgroundColor: colors.primary }]}
          onPress={handleApply}
          activeOpacity={0.8}
        >
          <View style={styles.applyContent}>
            <Text style={styles.applyText}>Apply Now</Text>
            <Text style={styles.applySubtext}>{campaignData.hoursLeft} hours left</Text>
          </View>
          <View style={styles.applyArrow}>
            <Feather name="arrow-right" size={16} color="#ffffff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    zIndex: 50,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 4,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  heroContainer: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  brandPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    paddingRight: 14,
    borderRadius: 24,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  brandAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandAvatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  brandName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedText: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 32,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statExtra: {
    fontSize: 10,
    marginTop: 2,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  platformText: {
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  deliverableCard: {
    flexDirection: 'row',
    gap: 12,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  deliverableIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliverableContent: {
    flex: 1,
  },
  deliverableTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  deliverableDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  dosdontsGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  dosCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  dosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  dosTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  dontsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
  },
  dosItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  dosDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
  },
  dosText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    shadowColor: '#1337ec',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  applyContent: {},
  applyText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  applySubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginTop: 2,
  },
  applyArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

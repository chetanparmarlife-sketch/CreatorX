import { memo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { borderRadius, spacing, typography } from '@/src/theme';
import { Campaign } from '@/src/types';
import { useTheme } from '@/src/hooks';

interface CampaignCardProps {
  campaign: Campaign;
  onApply?: (id: string) => void;
  onView?: (id: string) => void;
  onShare?: (id: string) => void;
}

const PlatformIcon = ({ platform, size = 18 }: { platform: string; size?: number }) => {
  switch (platform) {
    case 'facebook':
      return (
        <View style={[styles.platformIconCircle, { backgroundColor: '#1877F2' }]}>
          <Text style={{ color: '#fff', fontSize: size * 0.6, fontWeight: '700' }}>f</Text>
        </View>
      );
    case 'youtube':
      return (
        <View style={[styles.platformIconCircle, { backgroundColor: '#FF0000' }]}>
          <Feather name="play" size={size * 0.5} color="#fff" />
        </View>
      );
    case 'instagram':
      return (
        <View style={[styles.platformIconCircle, { backgroundColor: '#E4405F' }]}>
          <Feather name="instagram" size={size * 0.6} color="#fff" />
        </View>
      );
    case 'linkedin':
      return (
        <View style={[styles.platformIconCircle, { backgroundColor: '#0A66C2' }]}>
          <Text style={{ color: '#fff', fontSize: size * 0.5, fontWeight: '700' }}>in</Text>
        </View>
      );
    default:
      return null;
  }
};

export const CampaignCard = memo(function CampaignCard({ campaign, onApply, onView, onShare }: CampaignCardProps) {
  const { colors, isDark } = useTheme();

  const cardBg = isDark ? '#1a1a1a' : '#FFFBF5';
  const cardBorder = isDark ? colors.cardBorder : '#F5E6D3';
  const textPrimary = isDark ? colors.text : '#1a1a1a';
  const textSecondary = isDark ? colors.textSecondary : '#666666';
  const textMuted = isDark ? colors.textMuted : '#999999';
  const dividerColor = isDark ? colors.cardBorder : '#F0E0D0';
  const tagBg = isDark ? colors.card : '#ffffff';
  const tagBorder = isDark ? colors.cardBorder : '#E8E8E8';
  const paidBadgeBg = isDark ? 'rgba(255,193,7,0.15)' : '#FFF8E1';
  const paidBadgeBorder = isDark ? 'rgba(255,193,7,0.3)' : '#FFE082';
  const applyBtnBg = '#FFC107';
  const applyBtnText = '#1a1a1a';

  const platforms = campaign.platforms || [campaign.platform];
  const contentTypes = campaign.contentTypes || ['Post'];
  const tags = campaign.tags || [campaign.category];
  const daysRemaining = campaign.daysRemaining || 7;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onView?.(campaign.id)}
      style={[styles.container, { backgroundColor: cardBg, borderColor: cardBorder }]}
    >
      <View style={styles.topSection}>
        {campaign.image ? (
          <Image source={{ uri: campaign.image }} style={styles.campaignImage} />
        ) : (
          <View style={[styles.campaignImage, styles.imagePlaceholder, { backgroundColor: dividerColor }]}>
            <Feather name="image" size={28} color={textMuted} />
          </View>
        )}

        <View style={styles.topRight}>
          <View style={styles.brandRow}>
            <View style={styles.brandInfo}>
              {campaign.brandLogo ? (
                <Image source={{ uri: campaign.brandLogo }} style={styles.brandLogo} />
              ) : (
                <View style={[styles.brandLogo, { backgroundColor: colors.primary + '20' }]}>
                  <Feather name="briefcase" size={12} color={colors.primary} />
                </View>
              )}
              <Text style={[styles.brandName, { color: textSecondary }]} numberOfLines={1}>
                {campaign.brand}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.shareBtn, { borderColor: tagBorder }]}
              onPress={() => onShare?.(campaign.id)}
            >
              <Feather name="share-2" size={16} color={textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.title, { color: textPrimary }]} numberOfLines={2}>
            {campaign.title}
          </Text>

          <View style={styles.tagsRow}>
            {tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: tagBg, borderColor: tagBorder }]}>
                <Text style={[styles.tagText, { color: textSecondary }]}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.contentRow}>
            <Text style={[styles.contentText, { color: textMuted }]}>
              {contentTypes.join(' | ')}
            </Text>
            <View style={styles.platformIcons}>
              {platforms.map((p, i) => (
                <View key={i} style={i > 0 ? { marginLeft: -4 } : undefined}>
                  <PlatformIcon platform={p} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: textMuted }]}>Age group</Text>
          <Text style={[styles.statValue, { color: textPrimary }]}>{campaign.ageGroup || '18-35'}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: textMuted }]}>Followers range</Text>
          <Text style={[styles.statValue, { color: textPrimary }]}>{campaign.followersRange || '10K-100K'}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: textMuted }]}>Gender</Text>
          <Text style={[styles.statValue, { color: textPrimary }]}>{campaign.gender || 'All'}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      <View style={styles.bottomRow}>
        <View style={[styles.paidBadge, { backgroundColor: paidBadgeBg, borderColor: paidBadgeBorder }]}>
          <Text style={[styles.paidLabel, { color: textSecondary }]}>
            {campaign.isPaid !== false ? 'Paid' : 'Barter'}
          </Text>
          <View style={[styles.paidDivider, { backgroundColor: textMuted }]} />
          <Text style={[styles.paidAmount, { color: textPrimary }]}>{campaign.budget}</Text>
        </View>

        <Text style={[styles.deadline, { color: textSecondary }]}>
          Ends in <Text style={[styles.deadlineBold, { color: textPrimary }]}>{daysRemaining} days</Text>
        </Text>

        {campaign.status === 'open' && onApply && (
          <TouchableOpacity
            style={[styles.applyBtn, { backgroundColor: applyBtnBg }]}
            onPress={() => onApply(campaign.id)}
          >
            <Text style={[styles.applyBtnText, { color: applyBtnText }]}>Apply</Text>
            <Feather name="arrow-right" size={16} color={applyBtnText} />
          </TouchableOpacity>
        )}

        {campaign.status !== 'open' && (
          <View style={[
            styles.statusBadge, 
            { 
              backgroundColor: 
                campaign.status === 'applied' ? '#FFF3E0' :
                campaign.status === 'active' ? '#E8F5E9' :
                campaign.status === 'rejected' ? '#FFEBEE' :
                campaign.status === 'completed' ? '#E3F2FD' :
                colors.primary + '20'
            }
          ]}>
            <Feather 
              name={
                campaign.status === 'applied' ? 'clock' :
                campaign.status === 'active' ? 'check-circle' :
                campaign.status === 'rejected' ? 'x-circle' :
                campaign.status === 'completed' ? 'award' :
                'info'
              } 
              size={14} 
              color={
                campaign.status === 'applied' ? '#F57C00' :
                campaign.status === 'active' ? '#388E3C' :
                campaign.status === 'rejected' ? '#D32F2F' :
                campaign.status === 'completed' ? '#1976D2' :
                colors.primary
              } 
              style={{ marginRight: 4 }}
            />
            <Text style={[
              styles.statusText, 
              { 
                color: 
                  campaign.status === 'applied' ? '#F57C00' :
                  campaign.status === 'active' ? '#388E3C' :
                  campaign.status === 'rejected' ? '#D32F2F' :
                  campaign.status === 'completed' ? '#1976D2' :
                  colors.primary
              }
            ]}>
              {campaign.status === 'applied' ? 'Under Review' : 
               campaign.status === 'active' ? 'Active' : 
               campaign.status === 'rejected' ? 'Not Selected' :
               campaign.status === 'completed' ? 'Completed' :
               campaign.status === 'accepted' ? 'Accepted' : 
               campaign.status}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  topSection: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  campaignImage: {
    width: 100,
    height: 120,
    borderRadius: borderRadius.lg,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRight: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    ...typography.small,
    fontSize: 13,
  },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.bodyMedium,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  tagText: {
    ...typography.xs,
    fontSize: 11,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentText: {
    ...typography.small,
    fontSize: 13,
  },
  platformIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    ...typography.xs,
    fontSize: 11,
    marginBottom: 2,
  },
  statValue: {
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    gap: spacing.xs,
  },
  paidLabel: {
    ...typography.small,
    fontSize: 13,
    fontWeight: '500',
  },
  paidDivider: {
    width: 1,
    height: 14,
  },
  paidAmount: {
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '700',
  },
  deadline: {
    ...typography.small,
    fontSize: 13,
    flex: 1,
    textAlign: 'center',
  },
  deadlineBold: {
    fontWeight: '600',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  applyBtnText: {
    ...typography.bodyMedium,
    fontSize: 14,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.small,
    fontSize: 13,
    fontWeight: '500',
  },
});

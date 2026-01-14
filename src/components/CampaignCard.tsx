/**
 * CampaignCard Component
 * Refactored to use extracted sub-components and utility functions
 * 
 * Original: ~420 lines
 * Refactored: <200 lines (mostly composition)
 */

import { memo } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { borderRadius, spacing, typography } from '@/src/theme';
import { Campaign } from '@/src/types';
import { useTheme } from '@/src/hooks';
import {
  getPlatforms,
  getContentTypes,
  getTags,
  getDaysRemaining,
  getPaymentTypeLabel,
  canShowApplyButton,
  shouldShowStatusBadge,
} from '@/src/utils/campaignStatus';
import {
  CampaignBrandHeader,
  CampaignMetricsRow,
  CampaignCTA,
} from './CampaignCard/CampaignCardParts';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CampaignCardProps {
  campaign: Campaign;
  onApply?: (id: string) => void;
  onView?: (id: string) => void;
  onShare?: (id: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const CampaignCard = memo(function CampaignCard({
  campaign,
  onApply,
  onView,
  onShare,
}: CampaignCardProps) {
  const { colors, isDark } = useTheme();

  // Theme-based colors
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

  // Derived data using utility functions
  const platforms = getPlatforms(campaign);
  const contentTypes = getContentTypes(campaign);
  const tags = getTags(campaign);
  const daysRemaining = getDaysRemaining(campaign);
  const paymentLabel = getPaymentTypeLabel(campaign);
  const userState = campaign.userState;
  const campaignStatus = campaign.status || 'ACTIVE';

  // CTA logic using utility functions
  const showApply = canShowApplyButton(campaignStatus as any, userState as any, !!onApply);
  const showStatus = shouldShowStatusBadge(campaignStatus as any, userState as any) && !showApply;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onView?.(campaign.id)}
      style={[styles.container, { backgroundColor: cardBg, borderColor: cardBorder }]}
    >
      {/* Top Section: Image + Brand Header */}
      <View style={styles.topSection}>
        {campaign.image ? (
          <Image source={{ uri: campaign.image }} style={styles.campaignImage} />
        ) : (
          <View style={[styles.campaignImage, styles.imagePlaceholder, { backgroundColor: dividerColor }]}>
            <Feather name="image" size={28} color={textMuted} />
          </View>
        )}

        <CampaignBrandHeader
          brandName={campaign.brand}
          brandLogo={campaign.brandLogo}
          title={campaign.title}
          tags={tags}
          contentTypes={contentTypes}
          platforms={platforms}
          textPrimary={textPrimary}
          textSecondary={textSecondary}
          textMuted={textMuted}
          tagBg={tagBg}
          tagBorder={tagBorder}
          primaryColor={colors.primary}
          onShare={() => onShare?.(campaign.id)}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      {/* Metrics Row */}
      <CampaignMetricsRow
        ageGroup={campaign.ageGroup || '18-35'}
        followersRange={campaign.followersRange || '10K-100K'}
        gender={campaign.gender || 'All'}
        textMuted={textMuted}
        textPrimary={textPrimary}
      />

      <View style={[styles.divider, { backgroundColor: dividerColor }]} />

      {/* Bottom Row: Payment Badge + Deadline + CTA */}
      <View style={styles.bottomRow}>
        <View style={[styles.paidBadge, { backgroundColor: paidBadgeBg, borderColor: paidBadgeBorder }]}>
          <Text style={[styles.paidLabel, { color: textSecondary }]}>{paymentLabel}</Text>
          <View style={[styles.paidDivider, { backgroundColor: textMuted }]} />
          <Text style={[styles.paidAmount, { color: textPrimary }]}>{campaign.budget}</Text>
        </View>

        <Text style={[styles.deadline, { color: textSecondary }]}>
          Ends in <Text style={[styles.deadlineBold, { color: textPrimary }]}>{daysRemaining} days</Text>
        </Text>

        <CampaignCTA
          showApply={showApply}
          showStatus={showStatus}
          userState={userState}
          campaignStatus={campaignStatus}
          primaryColor={colors.primary}
          onApply={() => onApply?.(campaign.id)}
        />
      </View>
    </TouchableOpacity>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

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
  divider: {
    height: 1,
    marginHorizontal: spacing.md,
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
});

import { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { Modal } from './Modal';
import { Button } from './Button';
import { Badge } from './Badge';
import { Campaign } from '@/src/types';

interface CampaignDetailModalProps {
  visible: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onApply: (id: string) => void;
  onSave: (id: string) => void;
  isSaved: boolean;
}

export const CampaignDetailModal = memo(function CampaignDetailModal({
  visible,
  onClose,
  campaign,
  onApply,
  onSave,
  isSaved,
}: CampaignDetailModalProps) {
  if (!campaign) return null;
  const userState = campaign.userState;

  const getPlatformIcon = () => {
    switch (campaign.platform) {
      case 'instagram':
        return <Feather name="instagram" size={16} color={colors.text} />;
      case 'youtube':
        return <Feather name="youtube" size={16} color={colors.text} />;
      default:
        return <Feather name="linkedin" size={16} color={colors.text} />;
    }
  };

  const getStatusBadge = () => {
    if (userState) {
      switch (userState) {
        case 'SAVED':
          return <Badge label="Saved" variant="primary" size="md" />;
        case 'APPLIED':
        case 'SHORTLISTED':
          return <Badge label="Under Review" variant="warning" size="md" />;
        case 'SELECTED':
          return <Badge label="Accepted" variant="success" size="md" />;
        case 'REJECTED':
          return <Badge label="Rejected" variant="error" size="md" />;
        case 'WITHDRAWN':
          return <Badge label="Withdrawn" variant="error" size="md" />;
        default:
          return <Badge label="Status" variant="warning" size="md" />;
      }
    }

    switch (campaign.status) {
      case 'DRAFT':
        return <Badge label="Draft" variant="warning" size="md" />;
      case 'PENDING_REVIEW':
        return <Badge label="Pending Review" variant="warning" size="md" />;
      case 'ACTIVE':
        return <Badge label="Active" variant="success" size="md" />;
      case 'PAUSED':
        return <Badge label="Paused" variant="warning" size="md" />;
      case 'COMPLETED':
        return <Badge label="Completed" variant="success" size="md" />;
      case 'CANCELLED':
        return <Badge label="Cancelled" variant="error" size="md" />;
      default:
        return <Badge label="Status" variant="warning" size="md" />;
    }
  };

  const defaultRequirements = [
    'Minimum 10K followers on the platform',
    'High-quality content with good engagement',
    'Experience with brand collaborations',
    'Ability to meet deadlines',
  ];

  const requirements = campaign.requirements || defaultRequirements;

  const defaultDeliverables = [
    { id: '1', type: campaign.platform === 'youtube' ? 'YouTube Video' : 'Feed Post', description: 'Main content post', quantity: 1 },
    { id: '2', type: 'Stories', description: 'Story mentions', quantity: 2 },
    { id: '3', type: 'Product Review', description: 'Honest review', quantity: 1 },
  ];

  const deliverables = campaign.mandatoryDeliverables || defaultDeliverables;

  const renderFooter = () => (
    <View style={styles.actions}>
      <TouchableOpacity
        style={[styles.saveButton, isSaved && styles.saveButtonActive]}
        onPress={() => onSave(campaign.id)}
        data-testid="button-save-campaign"
      >
        <Feather
          name={isSaved ? 'bookmark' : 'bookmark'}
          size={20}
          color={isSaved ? colors.primary : colors.textSecondary}
        />
      </TouchableOpacity>
      {campaign.status === 'ACTIVE' && (!userState || userState === 'SAVED') && (
        <Button
          title="Apply Now"
          onPress={() => onApply(campaign.id)}
          variant="primary"
          size="lg"
          style={{ flex: 1 }}
          icon={<Feather name="send" size={18} color={colors.text} />}
          data-testid="button-apply-campaign"
        />
      )}
      {(userState === 'APPLIED' || userState === 'SHORTLISTED') && (
        <View style={styles.appliedBanner}>
          <Feather name="clock" size={18} color={colors.primary} />
          <Text style={styles.appliedText}>Application Under Review</Text>
        </View>
      )}
      {userState === 'SELECTED' && (
        <Button
          title="View Deliverables"
          onPress={onClose}
          variant="primary"
          size="lg"
          style={{ flex: 1 }}
          icon={<Feather name="upload" size={18} color={colors.text} />}
          data-testid="button-view-deliverables"
        />
      )}
      {(userState === 'REJECTED' || userState === 'WITHDRAWN') && (
        <View style={styles.rejectedBanner}>
          <Feather name="x-circle" size={18} color={colors.red} />
          <Text style={styles.rejectedText}>
            {userState === 'WITHDRAWN' ? 'Application Withdrawn' : 'Application Not Selected'}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <Modal visible={visible} onClose={onClose} fullHeight footer={renderFooter()}>
      <View style={styles.header}>
        <View style={styles.platformBadge}>
          {getPlatformIcon()}
          <Text style={styles.platformText}>
            {campaign.platform.charAt(0).toUpperCase() + campaign.platform.slice(1)}
          </Text>
        </View>
        {getStatusBadge()}
      </View>

      <Text style={styles.title} data-testid="text-campaign-title">{campaign.title}</Text>
      <Text style={styles.brand} data-testid="text-campaign-brand">{campaign.brand}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.emeraldLight }]}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.emerald }}>₹</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Budget</Text>
            <Text style={[styles.statValue, { color: colors.emerald }]} data-testid="text-campaign-budget">{campaign.budget}</Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.amberLight }]}>
            <Feather name="calendar" size={16} color={colors.amber} />
          </View>
          <View>
            <Text style={styles.statLabel}>Deadline</Text>
            <Text style={styles.statValue} data-testid="text-campaign-deadline">{campaign.deadline}</Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: colors.blueLight }]}>
            <Feather name="users" size={16} color={colors.blue} />
          </View>
          <View>
            <Text style={styles.statLabel}>Applicants</Text>
            <Text style={styles.statValue} data-testid="text-campaign-applicants">{campaign.applicants}</Text>
          </View>
        </View>
      </View>

      {campaign.brief && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="file-text" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Campaign Brief</Text>
          </View>
          <View style={styles.briefCard}>
            <Text style={styles.briefText} data-testid="text-campaign-brief">{campaign.brief}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="info" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>About This Campaign</Text>
        </View>
        <Text style={styles.description} data-testid="text-campaign-description">
          {campaign.description ||
            `Join ${campaign.brand} for an exciting collaboration! We're looking for creative content creators to showcase our products in an authentic and engaging way.

This campaign is perfect for creators who are passionate about ${campaign.category.toLowerCase()} and have an engaged audience on ${campaign.platform}.`}
        </Text>
      </View>

      {(campaign.timeline || campaign.compensation || campaign.paymentTerms) && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="clock" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Timeline & Compensation</Text>
          </View>
          <View style={styles.timelineCard}>
            {campaign.timeline && (
              <View style={styles.timelineItem}>
                <Feather name="calendar" size={14} color={colors.textSecondary} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Campaign Duration</Text>
                  <Text style={styles.timelineValue} data-testid="text-campaign-timeline">{campaign.timeline}</Text>
                </View>
              </View>
            )}
            {campaign.compensation && (
              <View style={styles.timelineItem}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.emerald }}>₹</Text>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Compensation</Text>
                  <Text style={[styles.timelineValue, { color: colors.emerald }]} data-testid="text-campaign-compensation">{campaign.compensation}</Text>
                </View>
              </View>
            )}
            {campaign.paymentTerms && (
              <View style={styles.timelineItem}>
                <Feather name="credit-card" size={14} color={colors.textSecondary} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>Payment Terms</Text>
                  <Text style={styles.timelineValue} data-testid="text-campaign-payment-terms">{campaign.paymentTerms}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="check-square" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>Requirements</Text>
        </View>
        <View style={styles.requirementList}>
          {requirements.map((req, index) => (
            <View key={index} style={styles.requirementItem} data-testid={`requirement-item-${index}`}>
              <View style={styles.checkIcon}>
                <Feather name="check" size={12} color={colors.emerald} />
              </View>
              <Text style={styles.requirementText}>{req}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name="package" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>Deliverables</Text>
        </View>
        <View style={styles.deliverableGrid}>
          {deliverables.map((item, index) => (
            <View key={item.id || index} style={styles.deliverableItem} data-testid={`deliverable-item-${index}`}>
              <View style={styles.deliverableIconWrap}>
                <Feather 
                  name={
                    item.type.toLowerCase().includes('video') ? 'video' :
                    item.type.toLowerCase().includes('story') || item.type.toLowerCase().includes('stories') ? 'layers' :
                    item.type.toLowerCase().includes('post') ? 'image' :
                    'file-text'
                  } 
                  size={18} 
                  color={colors.primary} 
                />
              </View>
              <Text style={styles.deliverableCount}>{item.quantity}x</Text>
              <Text style={styles.deliverableType}>{item.type}</Text>
              {item.description && (
                <Text style={styles.deliverableDesc}>{item.description}</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {campaign.status === 'ACTIVE' && (!userState || userState === 'SAVED') && (
        <View style={styles.applyPrompt}>
          <Feather name="zap" size={16} color={colors.amber} />
          <Text style={styles.applyPromptText}>
            Submit your application to get started with this campaign
          </Text>
        </View>
      )}
    </Modal>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  platformText: {
    ...typography.small,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  brand: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  statLabel: {
    ...typography.xs,
    color: colors.textMuted,
  },
  statValue: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  briefCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  briefText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  timelineCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    ...typography.xs,
    color: colors.textMuted,
    marginBottom: 2,
  },
  timelineValue: {
    ...typography.small,
    color: colors.text,
  },
  requirementList: {
    gap: spacing.sm,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.emeraldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  requirementText: {
    ...typography.small,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  deliverableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  deliverableItem: {
    flex: 1,
    minWidth: 100,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  deliverableIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  deliverableCount: {
    ...typography.h4,
    color: colors.primary,
  },
  deliverableType: {
    ...typography.xs,
    color: colors.text,
    marginTop: 4,
    textAlign: 'center',
  },
  deliverableDesc: {
    ...typography.xs,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  applyPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.amberLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  applyPromptText: {
    ...typography.small,
    color: colors.text,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  saveButton: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryBorder,
  },
  appliedBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    height: 52,
    gap: spacing.sm,
  },
  appliedText: {
    ...typography.bodyMedium,
    color: colors.primary,
  },
  rejectedBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.redLight,
    borderRadius: borderRadius.lg,
    height: 52,
    gap: spacing.sm,
  },
  rejectedText: {
    ...typography.bodyMedium,
    color: colors.red,
  },
});

import { useState, useCallback, useMemo, memo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '@/src/theme';
import { Badge, Button, EmptyState, Modal } from '@/src/components';
import { ActiveCampaign, Deliverable, PaymentStatus } from '@/src/types';
import { useApp } from '@/src/context';
import { useRefresh } from '@/src/hooks';
import { DraftSubmissionModal } from '@/src/components/DraftSubmissionModal';
import { RatingModal } from '@/src/components/RatingModal';

const getPaymentStatusBadge = (status: PaymentStatus) => {
  switch (status) {
    case 'pending':
      return <Badge label="Payment Pending" variant="warning" size="sm" />;
    case 'processing':
      return <Badge label="Processing" variant="primary" size="sm" />;
    case 'paid':
      return <Badge label="Paid" variant="success" size="sm" />;
  }
};

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'instagram':
      return 'instagram';
    case 'youtube':
      return 'youtube';
    case 'linkedin':
      return 'linkedin';
    default:
      return 'globe';
  }
};

interface ActiveCampaignCardProps {
  campaign: ActiveCampaign;
  onViewDeliverables: (campaign: ActiveCampaign) => void;
  onRateBrand: (campaign: ActiveCampaign) => void;
}

const ActiveCampaignCard = memo(function ActiveCampaignCard({
  campaign,
  onViewDeliverables,
  onRateBrand,
}: ActiveCampaignCardProps) {
  const completedCount = campaign.deliverables.filter(d => 
    d.status === 'approved' || d.status === 'posted'
  ).length;
  const totalCount = campaign.deliverables.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <View style={styles.campaignCard} data-testid={`card-active-campaign-${campaign.id}`}>
      <LinearGradient
        colors={['#1a1a1a', '#141414']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.campaignGradient}
      >
        <View style={styles.campaignHeader}>
          <View style={styles.campaignInfo}>
            <View style={styles.brandRow}>
              <View style={[styles.platformIcon, { backgroundColor: colors.primaryLight }]}>
                <Feather name={getPlatformIcon(campaign.platform)} size={14} color={colors.primary} />
              </View>
              <Text style={styles.brandName}>{campaign.brand}</Text>
            </View>
            <Text style={styles.campaignTitle} numberOfLines={2}>{campaign.title}</Text>
          </View>
          {getPaymentStatusBadge(campaign.paymentStatus)}
        </View>

        <View style={styles.paymentInfo}>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Payment Amount</Text>
            <Text style={styles.paymentValue}>{campaign.paymentAmount}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Deadline</Text>
            <Text style={styles.deadlineValue}>{campaign.deadline}</Text>
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Deliverables Progress</Text>
            <Text style={styles.progressCount}>{completedCount}/{totalCount}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.deliverablesList}>
          {campaign.deliverables.slice(0, 3).map((deliverable) => (
            <View key={deliverable.id} style={styles.deliverableItem}>
              <View style={styles.deliverableItemLeft}>
                <Feather
                  name={deliverable.status === 'approved' || deliverable.status === 'posted' ? 'check-circle' : 'circle'}
                  size={14}
                  color={deliverable.status === 'approved' || deliverable.status === 'posted' ? colors.emerald : colors.textMuted}
                />
                <Text style={styles.deliverableItemText} numberOfLines={1}>{deliverable.title}</Text>
              </View>
              <Badge
                label={
                  deliverable.status === 'brand_reviewing' ? 'Under Review' :
                  deliverable.status === 'draft_submitted' ? 'Submitted' :
                  deliverable.status.replace('_', ' ')
                }
                variant={
                  deliverable.status === 'approved' || deliverable.status === 'posted' ? 'success' :
                  deliverable.status === 'pending' ? 'warning' :
                  deliverable.status === 'brand_reviewing' || deliverable.status === 'draft_submitted' ? 'primary' :
                  deliverable.status === 'changes_requested' || deliverable.status === 'revision' ? 'error' :
                  'primary'
                }
                size="sm"
              />
            </View>
          ))}
          {campaign.deliverables.length > 3 && (
            <Text style={styles.moreDeliverables}>+{campaign.deliverables.length - 3} more deliverables</Text>
          )}
        </View>

        <View style={styles.cardActions}>
          <Button
            title="View Details"
            onPress={() => onViewDeliverables(campaign)}
            variant="outline"
            size="md"
            style={{ flex: 1 }}
            icon={<Feather name="eye" size={14} color={colors.text} />}
            data-testid={`button-view-campaign-${campaign.id}`}
          />
          {isCompleted && campaign.paymentStatus === 'paid' && !campaign.brandRating && (
            <Button
              title="Rate Brand"
              onPress={() => onRateBrand(campaign)}
              variant="primary"
              size="md"
              style={{ flex: 1, marginLeft: spacing.sm }}
              icon={<Feather name="star" size={14} color={colors.text} />}
              data-testid={`button-rate-brand-${campaign.id}`}
            />
          )}
        </View>

        {campaign.brandRating && (
          <View style={styles.ratingBadge}>
            <Feather name="star" size={12} color={colors.amber} />
            <Text style={styles.ratingText}>You rated {campaign.brandRating.score}/5</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
});

export default function ActiveCampaignsScreen() {
  const router = useRouter();
  const { activeCampaigns, updateActiveCampaign, refreshData, markDeliverablePosted } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<ActiveCampaign | null>(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await refreshData();
    setIsLoading(false);
  }, [refreshData]);

  const { refreshing, handleRefresh: onRefresh } = useRefresh(handleRefresh);

  const handleViewDeliverables = useCallback((campaign: ActiveCampaign) => {
    setSelectedCampaign(campaign);
    setShowDetailsModal(true);
  }, []);

  const handleRateBrand = useCallback((campaign: ActiveCampaign) => {
    setSelectedCampaign(campaign);
    setShowRatingModal(true);
  }, []);

  const handleUploadDeliverable = useCallback((deliverable: Deliverable) => {
    setSelectedDeliverable(deliverable);
    setShowDraftModal(true);
    setShowDetailsModal(false);
  }, []);

  const handleDraftSubmit = useCallback((deliverableId: string, file: { name: string; type: 'video' | 'image'; uri: string }) => {
    if (selectedCampaign) {
      const updatedDeliverables = selectedCampaign.deliverables.map(d =>
        d.id === deliverableId ? {
          ...d,
          status: 'draft_submitted' as const,
          submittedFile: file,
          submittedAt: new Date().toISOString(),
        } : d
      );
      updateActiveCampaign(selectedCampaign.id, { deliverables: updatedDeliverables });
    }
    setShowDraftModal(false);
    setSelectedDeliverable(null);
  }, [selectedCampaign, updateActiveCampaign]);

  const handleRatingSubmit = useCallback((score: number, comment?: string) => {
    if (selectedCampaign) {
      updateActiveCampaign(selectedCampaign.id, {
        brandRating: {
          score,
          comment,
          ratedAt: new Date().toISOString(),
        },
      });
    }
    setShowRatingModal(false);
    setSelectedCampaign(null);
  }, [selectedCampaign, updateActiveCampaign]);

  const handleMarkAsPosted = useCallback((deliverableId: string) => {
    if (selectedCampaign) {
      markDeliverablePosted(selectedCampaign.id, deliverableId);
      const updatedCampaign = {
        ...selectedCampaign,
        deliverables: selectedCampaign.deliverables.map(d =>
          d.id === deliverableId ? { ...d, status: 'posted' as const } : d
        ),
      };
      setSelectedCampaign(updatedCampaign);
    }
  }, [selectedCampaign, markDeliverablePosted]);

  const inProgressCampaigns = useMemo(() =>
    activeCampaigns.filter(c => c.paymentStatus !== 'paid' || !c.brandRating),
    [activeCampaigns]
  );

  const completedCampaigns = useMemo(() =>
    activeCampaigns.filter(c => c.paymentStatus === 'paid' && c.brandRating),
    [activeCampaigns]
  );

  const renderCampaign = useCallback(({ item }: { item: ActiveCampaign }) => (
    <ActiveCampaignCard
      campaign={item}
      onViewDeliverables={handleViewDeliverables}
      onRateBrand={handleRateBrand}
    />
  ), [handleViewDeliverables, handleRateBrand]);

  const keyExtractor = useCallback((item: ActiveCampaign) => item.id, []);

  const ListHeaderComponent = useMemo(() => (
    <>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Campaigns</Text>
          <Text style={styles.subtitle}>Track your ongoing collaborations</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderColor: colors.primaryBorder }]}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
            style={styles.statGradient}
          >
            <Text style={styles.statValue}>{inProgressCampaigns.length}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </LinearGradient>
        </View>
        <View style={{ width: spacing.md }} />
        <View style={[styles.statCard, { borderColor: colors.emeraldBorder }]}>
          <LinearGradient
            colors={['rgba(52, 211, 153, 0.15)', 'rgba(52, 211, 153, 0.05)']}
            style={styles.statGradient}
          >
            <Text style={[styles.statValue, { color: colors.emerald }]}>{completedCampaigns.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </LinearGradient>
        </View>
      </View>

      {inProgressCampaigns.length > 0 && (
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: colors.primaryLight }]}>
            <Feather name="briefcase" size={14} color={colors.primary} />
          </View>
          <Text style={styles.sectionTitle}>In Progress</Text>
        </View>
      )}
    </>
  ), [inProgressCampaigns.length, completedCampaigns.length]);

  const ListEmptyComponent = useMemo(() => (
    <EmptyState
      icon="briefcase"
      title="No active campaigns"
      subtitle="Apply for campaigns to start collaborating with brands"
      actionLabel="Explore Campaigns"
      onAction={() => router.push('/explore')}
    />
  ), [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={inProgressCampaigns}
        renderItem={renderCampaign}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={
          completedCampaigns.length > 0 ? (
            <View style={styles.completedSection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: colors.emeraldLight }]}>
                  <Feather name="check-circle" size={14} color={colors.emerald} />
                </View>
                <Text style={styles.sectionTitle}>Completed</Text>
              </View>
              {completedCampaigns.map((campaign) => (
                <ActiveCampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onViewDeliverables={handleViewDeliverables}
                  onRateBrand={handleRateBrand}
                />
              ))}
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
      />

      <Modal
        visible={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCampaign(null);
        }}
        fullHeight
      >
        {selectedCampaign && (
          <View>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedCampaign.title}</Text>
              <Text style={styles.modalSubtitle}>{selectedCampaign.brand}</Text>
            </View>

            <View style={styles.modalPaymentCard}>
              <View style={styles.modalPaymentRow}>
                <Text style={styles.modalPaymentLabel}>Payment Amount</Text>
                <Text style={styles.modalPaymentValue}>{selectedCampaign.paymentAmount}</Text>
              </View>
              <View style={styles.modalPaymentRow}>
                <Text style={styles.modalPaymentLabel}>Status</Text>
                {getPaymentStatusBadge(selectedCampaign.paymentStatus)}
              </View>
            </View>

            <Text style={styles.modalSectionTitle}>Deliverables</Text>
            {selectedCampaign.deliverables.map((deliverable) => (
              <View key={deliverable.id} style={styles.modalDeliverableCard}>
                <View style={styles.modalDeliverableHeader}>
                  <Text style={styles.modalDeliverableTitle}>{deliverable.title}</Text>
                  <Badge
                    label={
                      deliverable.status === 'brand_reviewing' ? 'Under Review' :
                      deliverable.status === 'draft_submitted' ? 'Submitted' :
                      deliverable.status.replace('_', ' ')
                    }
                    variant={
                      deliverable.status === 'approved' || deliverable.status === 'posted' ? 'success' :
                      deliverable.status === 'pending' ? 'warning' :
                      deliverable.status === 'brand_reviewing' || deliverable.status === 'draft_submitted' ? 'primary' :
                      deliverable.status === 'changes_requested' || deliverable.status === 'revision' ? 'error' :
                      'primary'
                    }
                    size="sm"
                  />
                </View>
                <Text style={styles.modalDeliverableDue}>Due: {deliverable.dueDate}</Text>
                {deliverable.feedback && (
                  <View style={styles.feedbackBox}>
                    <Feather name="message-circle" size={14} color={colors.amber} />
                    <Text style={styles.feedbackText}>{deliverable.feedback}</Text>
                  </View>
                )}
                {(deliverable.status === 'pending' || deliverable.status === 'changes_requested' || deliverable.status === 'revision') && (
                  <Button
                    title={deliverable.status === 'pending' ? 'Upload Draft' : 'Re-upload Draft'}
                    onPress={() => handleUploadDeliverable(deliverable)}
                    variant="outline"
                    size="sm"
                    style={{ marginTop: spacing.md }}
                    icon={<Feather name="upload" size={14} color={colors.text} />}
                    data-testid={`button-upload-${deliverable.id}`}
                  />
                )}
                {deliverable.status === 'approved' && (
                  <Button
                    title="Mark as Posted"
                    onPress={() => handleMarkAsPosted(deliverable.id)}
                    variant="primary"
                    size="sm"
                    style={{ marginTop: spacing.md }}
                    icon={<Feather name="check-circle" size={14} color="#fff" />}
                    data-testid={`button-mark-posted-${deliverable.id}`}
                  />
                )}
                {deliverable.status === 'posted' && deliverable.postUrl && (
                  <Text style={styles.postedUrlText}>Posted: {deliverable.postUrl}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Modal>

      <DraftSubmissionModal
        visible={showDraftModal}
        onClose={() => {
          setShowDraftModal(false);
          setSelectedDeliverable(null);
        }}
        deliverable={selectedDeliverable}
        onSubmit={handleDraftSubmit}
      />

      <RatingModal
        visible={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          setSelectedCampaign(null);
        }}
        brandName={selectedCampaign?.brand || ''}
        onSubmit={handleRatingSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    ...typography.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  campaignCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  campaignGradient: {
    padding: spacing.lg,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  campaignInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  platformIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  brandName: {
    ...typography.small,
    color: colors.textSecondary,
  },
  campaignTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  paymentInfo: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  paymentLabel: {
    ...typography.small,
    color: colors.textMuted,
    fontSize: 10,
  },
  paymentValue: {
    ...typography.bodyMedium,
    color: colors.emerald,
  },
  deadlineValue: {
    ...typography.small,
    color: colors.text,
  },
  progressSection: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    ...typography.xs,
    color: colors.textSecondary,
  },
  progressCount: {
    ...typography.xs,
    color: colors.primary,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: colors.background,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  deliverablesList: {
    marginBottom: spacing.md,
  },
  deliverableItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  deliverableItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  deliverableItemText: {
    ...typography.small,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  moreDeliverables: {
    ...typography.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  cardActions: {
    flexDirection: 'row',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.amberLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
  },
  ratingText: {
    ...typography.xs,
    color: colors.amber,
    marginLeft: spacing.xs,
  },
  completedSection: {
    marginTop: spacing.xl,
  },
  modalHeader: {
    marginBottom: spacing.xl,
  },
  modalTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalPaymentCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  modalPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalPaymentLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  modalPaymentValue: {
    ...typography.h4,
    color: colors.emerald,
  },
  modalSectionTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.md,
  },
  modalDeliverableCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  modalDeliverableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalDeliverableTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  modalDeliverableDue: {
    ...typography.xs,
    color: colors.textMuted,
  },
  feedbackBox: {
    flexDirection: 'row',
    backgroundColor: colors.amberLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.amberBorder,
  },
  feedbackText: {
    ...typography.small,
    color: colors.amber,
    flex: 1,
    marginLeft: spacing.sm,
  },
  postedUrlText: {
    ...typography.xs,
    color: colors.emerald,
    marginTop: spacing.sm,
  },
});

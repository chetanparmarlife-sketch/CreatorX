import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { spacing, borderRadius } from '@/src/theme';
import { Badge, Button, EmptyState, Modal, Avatar } from '@/src/components';
import { ActiveCampaign, Deliverable, PaymentStatus } from '@/src/types';
import { useApp } from '@/src/context';
import { useTheme } from '@/src/hooks';
import { handleAPIError } from '@/src/api/errors';
import { useRefresh } from '@/src/hooks';
import { DraftSubmissionModal } from '@/src/components/DraftSubmissionModal';
import { RatingModal } from '@/src/components/RatingModal';

const { width: screenWidth } = Dimensions.get('window');

const tabs = ['Active', 'Pending', 'History'];

const urgentItems = [
  {
    id: '1',
    brand: 'Nike',
    title: 'Summer Run: Story Draft',
    description: 'Please upload the raw video file for approval before editing.',
    daysLeft: 2,
    urgency: 'urgent',
    action: 'Upload Content',
  },
  {
    id: '2',
    brand: 'Gymshark',
    title: 'Contract: Signatures',
    description: 'Review and sign the updated terms for the Winter Collection campaign.',
    urgency: 'warning',
    action: 'Review PDF',
  },
];

const PriorityCard = memo(function PriorityCard({ item, colors, isDark }: { item: typeof urgentItems[0]; colors: any; isDark: boolean }) {
  return (
    <View style={[styles.priorityCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={[styles.priorityIndicator, { backgroundColor: item.urgency === 'urgent' ? '#ef4444' : '#eab308' }]} />
      <View style={styles.priorityContent}>
        <View style={styles.priorityHeader}>
          <View style={styles.priorityBrandRow}>
            <Avatar size={28} name={item.brand} />
            <Text style={[styles.priorityBrandName, { color: colors.textSecondary }]}>{item.brand}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: item.urgency === 'urgent' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)' }]}>
            {item.daysLeft && <Feather name="clock" size={10} color={item.urgency === 'urgent' ? '#ef4444' : '#eab308'} />}
            <Text style={[styles.priorityBadgeText, { color: item.urgency === 'urgent' ? '#ef4444' : '#eab308' }]}>
              {item.daysLeft ? `${item.daysLeft} Days Left` : 'Action'}
            </Text>
          </View>
        </View>
        <Text style={[styles.priorityTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.priorityDescription, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
        <TouchableOpacity 
          style={[styles.priorityButton, { backgroundColor: item.urgency === 'urgent' ? (isDark ? '#ffffff' : '#1a1a1a') : (isDark ? '#2c2c2e' : '#f1f5f9') }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.priorityButtonText, { color: item.urgency === 'urgent' ? (isDark ? '#000' : '#fff') : colors.text }]}>
            {item.action}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

interface CampaignCardProps {
  campaign: ActiveCampaign;
  colors: any;
  isDark: boolean;
  onViewDetails: () => void;
  onUpload: () => void;
}

const CampaignCard = memo(function CampaignCard({ campaign, colors, isDark, onViewDetails, onUpload }: CampaignCardProps) {
  const completedCount = campaign.deliverables.filter(d => d.status === 'approved' || d.status === 'posted').length;
  const totalCount = campaign.deliverables.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isInReview = campaign.deliverables.some(d => d.status === 'brand_reviewing' || d.status === 'draft_submitted');

  const getStatusBadge = () => {
    if (isInReview) return { label: 'Reviewing', color: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' };
    if (progress === 100) return { label: 'Completed', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
    return { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
  };

  const status = getStatusBadge();

  return (
    <View style={[styles.campaignCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.campaignHeader}>
        <View style={styles.campaignBrandRow}>
          <View style={styles.campaignBrandAvatar}>
            <Avatar size={44} name={campaign.brand} />
            <View style={[styles.platformBadge, { backgroundColor: '#000', borderColor: colors.card }]}>
              <Feather name={campaign.platform === 'instagram' ? 'instagram' : campaign.platform === 'youtube' ? 'youtube' : 'video'} size={10} color="#fff" />
            </View>
          </View>
          <View>
            <Text style={[styles.campaignBrandName, { color: colors.text }]}>{campaign.brand}</Text>
            <Text style={[styles.campaignPlatformText, { color: colors.textSecondary }]}>
              {campaign.platform === 'instagram' ? 'Instagram' : campaign.platform === 'youtube' ? 'YouTube' : 'TikTok'} • {campaign.paymentAmount}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.campaignBody}>
        <Text style={[styles.campaignTitle, { color: colors.text }]}>{campaign.title}</Text>
        <Text style={[styles.campaignDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          Create engaging content for the brand collaboration campaign.
        </Text>
      </View>

      <View style={styles.deliverablesSection}>
        <View style={styles.deliverablesHeader}>
          <Text style={[styles.deliverablesLabel, { color: colors.textSecondary }]}>Deliverables</Text>
          <Text style={[styles.deliverablesCount, { color: isInReview ? '#eab308' : colors.primary }]}>
            {isInReview ? 'Under Review' : `${completedCount}/${totalCount} Submitted`}
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: isDark ? '#1a1a1a' : '#e5e7eb' }]}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: isInReview ? '#eab308' : colors.primary }]} />
        </View>

        <View style={styles.thumbnailsRow}>
          {campaign.deliverables.slice(0, 2).map((d) => {
            const hasSubmittedFile = d.submittedFile?.uri;
            return (
              <View 
                key={d.id} 
                style={[styles.thumbnail, { backgroundColor: isDark ? '#1a1a1a' : '#e5e7eb', borderColor: colors.cardBorder }]}
              >
                {hasSubmittedFile ? (
                  <Image 
                    source={{ uri: d.submittedFile!.uri }} 
                    style={styles.thumbnailImage} 
                    resizeMode="cover"
                  />
                ) : (
                  <Feather name={d.type === 'video' ? 'video' : 'image'} size={18} color={colors.textMuted} />
                )}
                {(d.status === 'approved' || d.status === 'posted') && (
                  <View style={styles.thumbnailCheck}>
                    <Feather name="check-circle" size={16} color="#ffffff" />
                  </View>
                )}
                {d.status === 'brand_reviewing' && (
                  <View style={[styles.thumbnailBadge, { backgroundColor: '#eab308' }]}>
                    <Feather name="clock" size={10} color="#ffffff" />
                  </View>
                )}
              </View>
            );
          })}
          <TouchableOpacity 
            style={[styles.addThumbnail, { borderColor: colors.cardBorder }]}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {!isInReview && progress < 100 ? (
        <TouchableOpacity 
          style={[styles.uploadButton, { backgroundColor: colors.primary }]}
          onPress={onUpload}
          activeOpacity={0.8}
        >
          <Feather name="upload" size={16} color="#ffffff" />
          <Text style={styles.uploadButtonText}>Upload Deliverable</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={[styles.viewDetailsButton, { backgroundColor: isDark ? '#2c2c2e' : '#f1f5f9' }]}
            onPress={onViewDetails}
            activeOpacity={0.8}
          >
            <Text style={[styles.viewDetailsText, { color: colors.text }]}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chatButton, { backgroundColor: isDark ? '#2c2c2e' : '#f1f5f9' }]}
            activeOpacity={0.8}
          >
            <Feather name="message-circle" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

export default function ActiveCampaignsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { activeCampaigns, updateActiveCampaign, refreshData, markDeliverablePosted, submitDeliverable } = useApp();
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCampaign, setSelectedCampaign] = useState<ActiveCampaign | null>(null);
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const isMountedRef = useRef(true);

  const handleRefresh = useCallback(async () => {
    await refreshData();
  }, [refreshData]);

  const { refreshing, handleRefresh: onRefresh } = useRefresh(handleRefresh);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleViewDetails = useCallback((campaign: ActiveCampaign) => {
    setSelectedCampaign(campaign);
    setShowDetailsModal(true);
  }, []);

  const handleUpload = useCallback((campaign: ActiveCampaign) => {
    const pendingDeliverable = campaign.deliverables.find(d => d.status === 'pending' || d.status === 'changes_requested');
    if (pendingDeliverable) {
      setSelectedCampaign(campaign);
      setSelectedDeliverable(pendingDeliverable);
      setShowDraftModal(true);
    }
  }, []);

  const handleDraftSubmit = useCallback(async (deliverableId: string, file: { name: string; type: 'video' | 'image'; uri: string }, description?: string) => {
    if (!selectedCampaign) return;
    try {
      await submitDeliverable(selectedCampaign.id, deliverableId, file, description);
      const updatedDeliverables = selectedCampaign.deliverables.map(d =>
        d.id === deliverableId ? { ...d, status: 'draft_submitted' as const, submittedFile: file, submittedAt: new Date().toISOString() } : d
      );
      updateActiveCampaign(selectedCampaign.id, { deliverables: updatedDeliverables });
      Alert.alert('Submitted', 'Your deliverable has been sent for review.');
      await refreshData();
    } catch (err) {
      const apiError = handleAPIError(err);
      Alert.alert('Submission Failed', apiError.message || 'Unable to submit deliverable.');
    } finally {
      if (isMountedRef.current) {
        setShowDraftModal(false);
        setSelectedDeliverable(null);
      }
    }
  }, [selectedCampaign, submitDeliverable, updateActiveCampaign, refreshData]);

  const filteredCampaigns = useMemo(() => {
    switch (selectedTab) {
      case 0: // Active
        return activeCampaigns.filter(c => c.paymentStatus !== 'paid');
      case 1: // Pending
        return activeCampaigns.filter(c => c.deliverables.some(d => d.status === 'brand_reviewing'));
      case 2: // History
        return activeCampaigns.filter(c => c.paymentStatus === 'paid');
      default:
        return activeCampaigns;
    }
  }, [activeCampaigns, selectedTab]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[
        styles.header,
        {
          borderBottomColor: colors.cardBorder,
          backgroundColor: isDark ? 'rgba(5, 5, 5, 0.85)' : 'rgba(246, 246, 248, 0.9)',
        },
      ]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Campaigns</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
          activeOpacity={0.7}
        >
          <Feather name="bell" size={22} color={colors.text} />
          <View style={[styles.notificationDot, { backgroundColor: colors.primary, borderColor: colors.background }]} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <View style={[styles.tabsBackground, { backgroundColor: isDark ? '#1c1c1e' : '#e5e7eb' }]}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                selectedTab === index && [styles.tabButtonActive, { backgroundColor: isDark ? '#2c2c2e' : '#ffffff' }]
              ]}
              onPress={() => setSelectedTab(index)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabButtonText,
                { color: selectedTab === index ? colors.primary : colors.textSecondary }
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {selectedTab === 0 && urgentItems.length > 0 && (
          <View style={styles.attentionSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Attention Needed</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.priorityCardsScroll}
              decelerationRate="fast"
              snapToInterval={288}
            >
              {urgentItems.map(item => (
                <PriorityCard key={item.id} item={item} colors={colors} isDark={isDark} />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.campaignsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedTab === 0 ? 'Active Campaigns' : selectedTab === 1 ? 'Pending Review' : 'Campaign History'}
          </Text>
          
          {filteredCampaigns.length === 0 ? (
            <EmptyState
              icon="briefcase"
              title={selectedTab === 0 ? 'No active campaigns' : selectedTab === 1 ? 'No pending reviews' : 'No campaign history'}
              subtitle={selectedTab === 0 ? 'Apply for campaigns to start collaborating' : 'Check back later'}
              actionLabel={selectedTab === 0 ? 'Explore Campaigns' : undefined}
              onAction={selectedTab === 0 ? () => router.push('/explore') : undefined}
            />
          ) : (
            filteredCampaigns.map(campaign => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                colors={colors}
                isDark={isDark}
                onViewDetails={() => handleViewDetails(campaign)}
                onUpload={() => handleUpload(campaign)}
              />
            ))
          )}
        </View>
      </ScrollView>

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
              <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedCampaign.title}</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>{selectedCampaign.brand}</Text>
            </View>

            <View style={[styles.modalPaymentCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8fafc', borderColor: colors.cardBorder }]}>
              <View style={styles.modalPaymentRow}>
                <Text style={[styles.modalPaymentLabel, { color: colors.textSecondary }]}>Payment Amount</Text>
                <Text style={[styles.modalPaymentValue, { color: colors.emerald }]}>{selectedCampaign.paymentAmount}</Text>
              </View>
              <View style={styles.modalPaymentRow}>
                <Text style={[styles.modalPaymentLabel, { color: colors.textSecondary }]}>Deadline</Text>
                <Text style={[styles.modalPaymentValue, { color: colors.text }]}>{selectedCampaign.deadline}</Text>
              </View>
            </View>

            <Text style={[styles.modalSectionTitle, { color: colors.text }]}>Deliverables</Text>
            {selectedCampaign.deliverables.map((deliverable) => (
              <View key={deliverable.id} style={[styles.modalDeliverableCard, { backgroundColor: isDark ? '#1a1a1a' : '#f8fafc', borderColor: colors.cardBorder }]}>
                <View style={styles.modalDeliverableHeader}>
                  <Text style={[styles.modalDeliverableTitle, { color: colors.text }]}>{deliverable.title}</Text>
                  <Badge
                    label={deliverable.status === 'brand_reviewing' ? 'Under Review' : deliverable.status.replace('_', ' ')}
                    variant={
                      deliverable.status === 'approved' || deliverable.status === 'posted' ? 'success' :
                      deliverable.status === 'pending' ? 'warning' :
                      deliverable.status === 'brand_reviewing' || deliverable.status === 'draft_submitted' ? 'primary' : 'primary'
                    }
                    size="sm"
                  />
                </View>
                <Text style={[styles.modalDeliverableDue, { color: colors.textSecondary }]}>Due: {deliverable.dueDate}</Text>
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
        onSubmit={() => {}}
      />
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
  tabsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  tabsBackground: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {},
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  attentionSection: {
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priorityCardsScroll: {
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    gap: 12,
  },
  priorityCard: {
    width: 280,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  priorityIndicator: {
    width: 4,
  },
  priorityContent: {
    flex: 1,
    padding: 12,
  },
  priorityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBrandName: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  priorityTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  priorityDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  priorityButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  campaignsSection: {
    paddingHorizontal: spacing.md,
  },
  campaignCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
  campaignBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  campaignBrandAvatar: {
    position: 'relative',
  },
  platformBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  campaignBrandName: {
    fontSize: 14,
    fontWeight: '600',
  },
  campaignPlatformText: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  campaignBody: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  campaignTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  campaignDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  deliverablesSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  deliverablesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  deliverablesLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  deliverablesCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  thumbnail: {
    width: 48,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderRadius: 10,
    padding: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 7,
  },
  thumbnailBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addThumbnail: {
    width: 48,
    height: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    paddingVertical: 14,
    borderRadius: 10,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  viewDetailsButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '700',
  },
  chatButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
  },
  modalHeader: {
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  modalPaymentCard: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  modalPaymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalPaymentLabel: {
    fontSize: 14,
  },
  modalPaymentValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  modalDeliverableCard: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  modalDeliverableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalDeliverableTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  modalDeliverableDue: {
    fontSize: 12,
  },
});

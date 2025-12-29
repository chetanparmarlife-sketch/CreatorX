/**
 * Data adapters to transform backend API responses to match existing app types
 * These adapters ensure backward compatibility with existing UI components
 */

import {
  Campaign as ApiCampaign,
  Application as ApiApplication,
  Transaction as ApiTransaction,
  Wallet as ApiWallet,
  Notification as ApiNotification,
  Conversation as ApiConversation,
  Message as ApiMessage,
  DeliverableSubmission as ApiDeliverableSubmission,
  ActiveCampaign as ApiActiveCampaign,
  PaginatedResponse,
} from '../types';
import {
  Campaign,
  CampaignApplication,
  Transaction,
  WalletData,
  Notification,
  ChatPreview,
  Conversation,
  Message,
  Deliverable,
  ActiveCampaign,
} from '@/src/types';

/**
 * Transform paginated campaign response to app format
 */
export function adaptCampaignsResponse(
  response: PaginatedResponse<ApiCampaign>
): { campaigns: Campaign[]; hasMore: boolean; total: number } {
  const campaigns = response.items.map(adaptCampaign);
  return {
    campaigns,
    hasMore: response.items.length === response.size && response.page * response.size < response.total,
    total: response.total,
  };
}

/**
 * Transform single API campaign to app Campaign
 */
export function adaptCampaign(apiCampaign: ApiCampaign): Campaign {
  const deadline = new Date(apiCampaign.endDate);
  const now = new Date();
  const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return {
    id: apiCampaign.id,
    title: apiCampaign.title,
    brand: apiCampaign.brand?.name || 'Unknown Brand',
    brandLogo: apiCampaign.brand?.logo,
    budget: formatCurrency(apiCampaign.budget),
    deadline: formatDate(apiCampaign.endDate),
    daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
    platform: mapPlatform(apiCampaign.platform),
    platforms: [mapPlatform(apiCampaign.platform)],
    category: apiCampaign.category,
    applicants: apiCampaign.selectedCreatorsCount,
    status: mapCampaignStatus(apiCampaign.status),
    description: apiCampaign.description,
    tags: apiCampaign.tags || [],
    contentTypes: apiCampaign.deliverableTypes || [],
    isPaid: true,
  };
}

/**
 * Transform API application to app CampaignApplication
 */
export function adaptApplication(apiApplication: ApiApplication): CampaignApplication {
  return {
    id: apiApplication.id,
    campaignId: apiApplication.campaignId,
    creatorId: apiApplication.creatorId,
    pitch: apiApplication.pitchText,
    expectedTimeline: apiApplication.expectedTimeline || '',
    extraDetails: apiApplication.feedback?.feedbackText,
    status: mapApplicationStatus(apiApplication.status),
    submittedAt: apiApplication.appliedAt,
    reviewedAt: apiApplication.feedback?.selectedAt || apiApplication.feedback?.rejectedAt,
    brandFeedback: apiApplication.feedback?.rejectedReason || apiApplication.feedback?.feedbackText,
  };
}

/**
 * Transform API transaction to app Transaction
 */
export function adaptTransaction(apiTransaction: ApiTransaction): Transaction {
  return {
    id: apiTransaction.id,
    type: mapTransactionType(apiTransaction.type),
    title: getTransactionTitle(apiTransaction.type),
    description: apiTransaction.description || '',
    amount: formatCurrency(apiTransaction.amount),
    date: formatShortDate(apiTransaction.createdAt),
    status: mapTransactionStatus(apiTransaction.status),
    campaignId: apiTransaction.campaignId,
  };
}

/**
 * Transform API wallet to app WalletData
 */
export function adaptWallet(apiWallet: ApiWallet): WalletData {
  return {
    balance: Number(apiWallet.balance),
    pending: Number(apiWallet.pendingBalance),
    withdrawn: Number(apiWallet.totalWithdrawn),
    monthlyChange: 0, // Calculate from transactions if needed
    lifetimeEarnings: Number(apiWallet.totalEarned),
  };
}

/**
 * Transform API notification to app Notification
 */
export function adaptNotification(apiNotification: ApiNotification): Notification {
  const dataJson = apiNotification.dataJson || {};
  return {
    id: apiNotification.id,
    type: mapNotificationType(apiNotification.type),
    title: apiNotification.title,
    description: apiNotification.body,
    time: formatTimeAgo(apiNotification.createdAt),
    read: apiNotification.read,
    action: dataJson.actionPath
      ? {
          label: (dataJson.actionLabel as string) || 'View',
          path: dataJson.actionPath as string,
        }
      : undefined,
  };
}

/**
 * Transform API conversation to app ChatPreview
 */
export function adaptConversationToChatPreview(
  apiConversation: ApiConversation,
  currentUserId: string
): ChatPreview {
  const otherUser =
    currentUserId === apiConversation.creatorId
      ? apiConversation.brand
      : apiConversation.creator;

  return {
    id: apiConversation.id,
    name: otherUser?.name || 'Unknown',
    lastMessage: '', // Will be populated when messages are loaded
    time: apiConversation.lastMessageAt
      ? formatTimeAgo(apiConversation.lastMessageAt)
      : 'No messages',
    unread:
      currentUserId === apiConversation.creatorId
        ? apiConversation.creatorUnreadCount
        : apiConversation.brandUnreadCount,
    online: false, // Not available from API
    type: 'brand',
  };
}

/**
 * Transform API message to app Message
 */
export function adaptMessage(apiMessage: ApiMessage, currentUserId: string): Message {
  return {
    id: apiMessage.id,
    text: apiMessage.content,
    sender: apiMessage.senderId === currentUserId ? 'user' : 'other',
    time: formatMessageTime(apiMessage.createdAt),
    status: apiMessage.read ? 'read' : 'sent',
    chatId: apiMessage.conversationId,
  };
}

/**
 * Transform API conversation with messages to app Conversation
 */
export function adaptConversation(
  apiConversation: ApiConversation,
  messages: ApiMessage[],
  currentUserId: string
): Conversation {
  return {
    chatId: apiConversation.id,
    messages: messages.map((msg) => adaptMessage(msg, currentUserId)),
  };
}

/**
 * Transform API deliverable submission to app Deliverable
 */
export function adaptDeliverable(
  apiDeliverable: ApiDeliverableSubmission,
  campaignInfo?: { title: string; brand: string; dueDate: string }
): Deliverable {
  return {
    id: apiDeliverable.id,
    campaignId: '', // Will be populated from active campaign
    campaignTitle: campaignInfo?.title || '',
    brand: campaignInfo?.brand || '',
    dueDate: campaignInfo?.dueDate || '',
    status: mapDeliverableStatus(apiDeliverable.status),
    type: 'content_draft',
    title: apiDeliverable.description || 'Deliverable',
    description: apiDeliverable.description,
    submittedFile: {
      name: extractFileName(apiDeliverable.fileUrl),
      type: inferFileType(apiDeliverable.fileUrl),
    },
    submittedAt: apiDeliverable.submittedAt,
  };
}

// ==================== Helper Functions ====================

function mapCampaignStatus(status: ApiCampaign['status']): Campaign['status'] {
  const statusMap: Record<ApiCampaign['status'], Campaign['status']> = {
    DRAFT: 'open',
    ACTIVE: 'active',
    PAUSED: 'open',
    COMPLETED: 'completed',
    CANCELLED: 'rejected',
  };
  return statusMap[status] || 'open';
}

function mapApplicationStatus(status: ApiApplication['status']): CampaignApplication['status'] {
  const statusMap: Record<ApiApplication['status'], CampaignApplication['status']> = {
    APPLIED: 'pending_review',
    SHORTLISTED: 'pending_review',
    SELECTED: 'approved',
    REJECTED: 'rejected',
    WITHDRAWN: 'rejected',
  };
  return statusMap[status] || 'pending_review';
}

function mapTransactionType(type: ApiTransaction['type']): Transaction['type'] {
  const typeMap: Record<ApiTransaction['type'], Transaction['type']> = {
    EARNING: 'credit',
    WITHDRAWAL: 'debit',
    REFUND: 'credit',
    BONUS: 'credit',
    PENALTY: 'debit',
  };
  return typeMap[type] || 'credit';
}

function mapTransactionStatus(status: ApiTransaction['status']): Transaction['status'] {
  const statusMap: Record<ApiTransaction['status'], Transaction['status']> = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'pending',
  };
  return statusMap[status] || 'pending';
}

function mapNotificationType(type: ApiNotification['type']): Notification['type'] {
  const typeMap: Partial<Record<ApiNotification['type'], Notification['type']>> = {
    PAYMENT_RECEIVED: 'payment',
    WITHDRAWAL_PROCESSED: 'payment',
    CAMPAIGN_APPLICATION: 'application',
    CAMPAIGN_SELECTED: 'application',
    CAMPAIGN_REJECTED: 'application',
    DELIVERABLE_SUBMITTED: 'campaign',
    DELIVERABLE_APPROVED: 'campaign',
    DELIVERABLE_REVISION: 'campaign',
    MESSAGE_RECEIVED: 'message',
    KYC_APPROVED: 'system',
    KYC_REJECTED: 'system',
    SYSTEM_ANNOUNCEMENT: 'system',
  };
  return typeMap[type] || 'system';
}

function mapDeliverableStatus(status: ApiDeliverableSubmission['status']): Deliverable['status'] {
  const statusMap: Record<ApiDeliverableSubmission['status'], Deliverable['status']> = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REVISION_REQUESTED: 'changes_requested',
    REJECTED: 'rejected',
  };
  return statusMap[status] || 'pending';
}

function mapPlatform(platform: ApiCampaign['platform']): Campaign['platform'] {
  const platformMap: Record<ApiCampaign['platform'], Campaign['platform']> = {
    INSTAGRAM: 'instagram',
    YOUTUBE: 'youtube',
    TWITTER: 'twitter',
    FACEBOOK: 'facebook',
    LINKEDIN: 'linkedin',
    TIKTOK: 'tiktok',
  };
  return platformMap[platform] || 'instagram';
}

function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatShortDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;

  return formatDate(dateString);
}

function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatMessageTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function getTransactionTitle(type: ApiTransaction['type']): string {
  const titleMap: Record<ApiTransaction['type'], string> = {
    EARNING: 'Campaign Payment',
    WITHDRAWAL: 'Withdrawal',
    REFUND: 'Refund',
    BONUS: 'Bonus',
    PENALTY: 'Penalty',
  };
  return titleMap[type] || 'Transaction';
}

function extractFileName(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1] || 'file';
}

function inferFileType(url: string): 'video' | 'image' | 'document' {
  const lower = url.toLowerCase();
  if (lower.includes('.mp4') || lower.includes('.mov') || lower.includes('.avi')) {
    return 'video';
  }
  if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png')) {
    return 'image';
  }
  return 'document';
}


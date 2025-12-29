/**
 * Transformers to convert backend API types to frontend app types
 */

import {
  Campaign as ApiCampaign,
  Application as ApiApplication,
  Transaction as ApiTransaction,
  Wallet as ApiWallet,
  Notification as ApiNotification,
  Conversation as ApiConversation,
  Message as ApiMessage,
  DeliverableSubmission as ApiDeliverable,
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
 * Transform API Campaign to app Campaign
 */
export function transformCampaign(apiCampaign: ApiCampaign): Campaign {
  return {
    id: apiCampaign.id,
    title: apiCampaign.title,
    brand: apiCampaign.brand?.name || 'Unknown Brand',
    brandLogo: apiCampaign.brand?.logo,
    budget: `₹${(apiCampaign.budget / 1000).toFixed(0)}K`,
    deadline: new Date(apiCampaign.endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    daysRemaining: Math.ceil(
      (new Date(apiCampaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ),
    platform: apiCampaign.platform.toLowerCase() as Campaign['platform'],
    platforms: [apiCampaign.platform.toLowerCase() as Campaign['platform']],
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
 * Map backend campaign status to frontend status
 */
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

/**
 * Transform API Application to app CampaignApplication
 */
export function transformApplication(apiApplication: ApiApplication): CampaignApplication {
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
 * Map backend application status to frontend status
 */
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

/**
 * Transform API Transaction to app Transaction
 */
export function transformTransaction(apiTransaction: ApiTransaction): Transaction {
  const amount = apiTransaction.amount;
  const formattedAmount = `₹${amount.toLocaleString('en-IN')}`;

  return {
    id: apiTransaction.id,
    type: mapTransactionType(apiTransaction.type),
    title: getTransactionTitle(apiTransaction.type),
    description: apiTransaction.description || '',
    amount: formattedAmount,
    date: new Date(apiTransaction.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    status: mapTransactionStatus(apiTransaction.status),
    campaignId: apiTransaction.campaignId,
  };
}

/**
 * Map backend transaction type to frontend type
 */
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

/**
 * Get transaction title based on type
 */
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

/**
 * Map backend transaction status to frontend status
 */
function mapTransactionStatus(status: ApiTransaction['status']): Transaction['status'] {
  const statusMap: Record<ApiTransaction['status'], Transaction['status']> = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'pending',
  };
  return statusMap[status] || 'pending';
}

/**
 * Transform API Wallet to app WalletData
 */
export function transformWallet(apiWallet: ApiWallet): WalletData {
  return {
    balance: apiWallet.balance,
    pending: apiWallet.pendingBalance,
    withdrawn: apiWallet.totalWithdrawn,
    monthlyChange: 0, // Calculate from transactions if needed
    lifetimeEarnings: apiWallet.totalEarned,
  };
}

/**
 * Transform API Notification to app Notification
 */
export function transformNotification(apiNotification: ApiNotification): Notification {
  return {
    id: apiNotification.id,
    type: mapNotificationType(apiNotification.type),
    title: apiNotification.title,
    description: apiNotification.body,
    time: formatTimeAgo(apiNotification.createdAt),
    read: apiNotification.read,
    action: apiNotification.dataJson?.actionPath
      ? {
          label: apiNotification.dataJson.actionLabel as string || 'View',
          path: apiNotification.dataJson.actionPath as string,
        }
      : undefined,
  };
}

/**
 * Map backend notification type to frontend type
 */
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

/**
 * Transform API Conversation to app ChatPreview
 */
export function transformConversationToChatPreview(
  apiConversation: ApiConversation,
  userId: string
): ChatPreview {
  const otherUser = userId === apiConversation.creatorId 
    ? apiConversation.brand 
    : apiConversation.creator;
  
  return {
    id: apiConversation.id,
    name: otherUser?.name || 'Unknown',
    lastMessage: '', // Will be populated from messages
    time: apiConversation.lastMessageAt 
      ? formatTimeAgo(apiConversation.lastMessageAt)
      : 'No messages',
    unread: userId === apiConversation.creatorId
      ? apiConversation.creatorUnreadCount
      : apiConversation.brandUnreadCount,
    online: false, // Not available from API
    type: 'brand',
  };
}

/**
 * Transform API Message to app Message
 */
export function transformMessage(apiMessage: ApiMessage, userId: string): Message {
  return {
    id: apiMessage.id,
    text: apiMessage.content,
    sender: apiMessage.senderId === userId ? 'user' : 'other',
    time: new Date(apiMessage.createdAt).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }),
    status: apiMessage.read ? 'read' : 'sent',
    chatId: apiMessage.conversationId,
  };
}

/**
 * Transform API Conversation to app Conversation
 */
export function transformConversation(
  apiConversation: ApiConversation,
  messages: ApiMessage[],
  userId: string
): Conversation {
  return {
    chatId: apiConversation.id,
    messages: messages.map((msg) => transformMessage(msg, userId)),
  };
}

/**
 * Transform API DeliverableSubmission to app Deliverable
 */
export function transformDeliverable(apiDeliverable: ApiDeliverable): Deliverable {
  return {
    id: apiDeliverable.id,
    campaignId: '', // Will be populated from active campaign
    campaignTitle: '', // Will be populated from active campaign
    brand: '', // Will be populated from active campaign
    dueDate: '', // Will be populated from active campaign
    status: mapDeliverableStatus(apiDeliverable.status),
    type: 'content_draft', // Default type
    title: apiDeliverable.description || 'Deliverable',
    description: apiDeliverable.description,
    submittedFile: {
      name: apiDeliverable.fileUrl.split('/').pop() || 'file',
      type: 'document',
    },
    submittedAt: apiDeliverable.submittedAt,
  };
}

/**
 * Map backend deliverable status to frontend status
 */
function mapDeliverableStatus(status: ApiDeliverable['status']): Deliverable['status'] {
  const statusMap: Record<ApiDeliverable['status'], Deliverable['status']> = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REVISION_REQUESTED: 'changes_requested',
    REJECTED: 'rejected',
  };
  return statusMap[status] || 'pending';
}

/**
 * Format timestamp to time ago string
 */
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


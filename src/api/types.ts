/**
 * TypeScript types matching the backend OpenAPI specification
 * These types correspond to the Spring Boot backend API responses
 */

// ==================== Storage Types ====================

export interface FileUploadResponse {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  bucket: string;
  path: string;
}

export interface SignedUrlResponse {
  signedUrl: string;
  expiresAt: string;
  fileUrl: string;
}

// ==================== Common Types ====================

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

// Alias for Page (matches backend Page response)
export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// ==================== Auth Types ====================

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'CREATOR' | 'BRAND' | 'ADMIN';
  name: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

// ==================== User Types ====================

export interface User {
  id: string;
  email: string;
  role: 'CREATOR' | 'BRAND' | 'ADMIN';
  createdAt: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  isVerified?: boolean;
  kycVerified?: boolean;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface CreatorProfile {
  userId: string;
  username: string;
  category: string;
  followerCount: number;
  engagementRate: number;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  twitterUrl?: string;
  portfolioItems: unknown[];
  verified: boolean;
}

export interface BrandProfile {
  userId: string;
  companyName: string;
  gstNumber?: string;
  industry?: string;
  website?: string;
  verified: boolean;
  companyLogoUrl?: string;
  companyDescription?: string;
}

// ==================== Campaign Types ====================

export type CampaignStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';
export type CampaignPlatform = 'INSTAGRAM' | 'YOUTUBE' | 'TWITTER' | 'FACEBOOK' | 'LINKEDIN' | 'TIKTOK';

export interface Campaign {
  id: string;
  brandId: string;
  title: string;
  description: string;
  budget: number;
  platform: CampaignPlatform;
  category: string;
  requirements?: string;
  deliverableTypes: string[];
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  applicationDeadline?: string;
  maxApplicants?: number;
  applicationsCount?: number;
  selectedCreatorsCount: number;
  userApplicationStatus?: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  brand?: {
    id: string;
    name: string;
    logo?: string;
  };
  tags?: string[];
}

export interface CampaignFilters {
  category?: string;
  platform?: CampaignPlatform;
  budgetMin?: number;
  budgetMax?: number;
  status?: CampaignStatus;
  search?: string;
  page?: number;
  size?: number;
}

// ==================== Application Types ====================

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';

export interface Application {
  id: string;
  campaignId: string;
  creatorId: string;
  status: ApplicationStatus;
  pitchText: string;
  expectedTimeline?: string;
  proposedBudget?: number;
  appliedAt: string;
  updatedAt: string;
  campaign?: Campaign;
  feedback?: ApplicationFeedback;
}

export interface ApplicationFeedback {
  applicationId: string;
  feedbackText?: string;
  rejectedReason?: string;
  shortlistedAt?: string;
  selectedAt?: string;
  rejectedAt?: string;
}

export interface SubmitApplicationRequest {
  campaignId: string;
  pitchText: string;
  expectedTimeline?: string;
  proposedBudget?: number;
}

// ==================== Deliverable Types ====================

export type DeliverableStatus = 
  | 'PENDING' 
  | 'SUBMITTED' 
  | 'REVISION' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'DRAFT_SUBMITTED' 
  | 'BRAND_REVIEWING' 
  | 'CHANGES_REQUESTED' 
  | 'POSTED';

export type SubmissionStatus = 'PENDING' | 'APPROVED' | 'REVISION_REQUESTED' | 'REJECTED';

export interface DeliverableSubmission {
  id: string;
  applicationId: string;
  campaignId: string;
  campaignTitle: string;
  brandName: string;
  dueDate: string;
  type: string;
  campaignDeliverableId: string;
  fileUrl: string;
  description?: string;
  status: SubmissionStatus;
  submittedAt: string;
  updatedAt: string;
}

export interface DeliverableReview {
  submissionId: string;
  reviewerId: string;
  status: SubmissionStatus;
  feedback?: string;
  revisionNotes?: string;
  reviewedAt: string;
}

export interface SubmitDeliverableRequest {
  file: {
    uri: string;
    type: string;
    name: string;
  };
  description?: string;
}

// ==================== Wallet Types ====================

export type TransactionType = 'EARNING' | 'WITHDRAWAL' | 'REFUND' | 'BONUS' | 'PENALTY';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Wallet {
  userId: string;
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  currency: 'INR' | 'USD' | 'EUR';
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  campaignId?: string;
  applicationId?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  bankAccountId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'FAILED';
  razorpayPayoutId?: string;
  failureReason?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface BankAccount {
  id: string;
  userId: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  bankName?: string;
  branchName?: string;
  verified: boolean;
  isDefault: boolean;
}

export interface CreateWithdrawalRequest {
  amount: number;
  bankAccountId: string;
}

export interface AddBankAccountRequest {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  bankName?: string;
  branchName?: string;
}

// ==================== KYC Types ====================

export type DocumentType = 'AADHAAR' | 'PAN' | 'GST' | 'PASSPORT' | 'DRIVING_LICENSE';
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface KYCDocument {
  id: string;
  userId: string;
  documentType: DocumentType;
  documentUrl: string;
  status: DocumentStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitKYCRequest {
  documentType: DocumentType;
  file: {
    uri: string;
    type: string;
    name: string;
  };
}

// ==================== Messaging Types ====================

export interface Conversation {
  id: string;
  campaignId?: string;
  lastMessage?: {
    id?: string;
    text: string;
    senderId?: string;
    sentAt?: string;
    createdAt?: string;
  } | null;
  unreadCount: number;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  campaign?: Campaign;
  creator?: User;
  brand?: User;
  // Legacy fields retained for backward compatibility with older payloads.
  creatorId?: string;
  brandId?: string;
  creatorUnreadCount?: number;
  brandUnreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  status?: 'SENT' | 'DELIVERED' | 'READ';
  read?: boolean;
  readAt?: string;
  sentAt?: string;
  createdAt: string;
  sender?: User;
}

export interface SendMessageRequest {
  content: string;
}

// ==================== Notification Types ====================

export type NotificationType = 
  | 'CAMPAIGN_APPLICATION'
  | 'CAMPAIGN_SELECTED'
  | 'CAMPAIGN_REJECTED'
  | 'DELIVERABLE_SUBMITTED'
  | 'DELIVERABLE_APPROVED'
  | 'DELIVERABLE_REVISION'
  | 'PAYMENT_RECEIVED'
  | 'WITHDRAWAL_PROCESSED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'MESSAGE_RECEIVED'
  | 'SYSTEM_ANNOUNCEMENT';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  dataJson?: Record<string, unknown>;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface UnreadCountResponse {
  count: number;
}

// ==================== Profile Types ====================

export interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  location?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  mediaUrl: string;
  type: 'image' | 'video';
}

export interface AddPortfolioItemRequest {
  title: string;
  description?: string;
  file: {
    uri: string;
    type: string;
    name: string;
  };
}

// ==================== Referral Types ====================

export interface ReferralCode {
  code: string;
  createdAt: string;
}

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
}

export interface ApplyReferralRequest {
  code: string;
}

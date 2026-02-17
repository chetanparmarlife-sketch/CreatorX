/**
 * TypeScript types matching the backend Spring Boot DTOs
 * These types should match the backend API response structures
 */

// Enums
export enum UserRole {
  CREATOR = 'CREATOR',
  BRAND = 'BRAND',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum DocumentType {
  AADHAAR = 'AADHAAR',
  PAN = 'PAN',
  GST = 'GST',
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
}

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum CampaignPlatform {
  INSTAGRAM = 'INSTAGRAM',
  YOUTUBE = 'YOUTUBE',
  TIKTOK = 'TIKTOK',
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
}

export enum EscrowStatus {
  UNFUNDED = 'UNFUNDED',
  PARTIAL = 'PARTIAL',
  FUNDED = 'FUNDED',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
}

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  SHORTLISTED = 'SHORTLISTED',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum TransactionType {
  EARNING = 'EARNING',
  WITHDRAWAL = 'WITHDRAWAL',
  REFUND = 'REFUND',
  BONUS = 'BONUS',
  PENALTY = 'PENALTY',
}

export enum AppealStatus {
  OPEN = 'OPEN',
  IN_REVIEW = 'IN_REVIEW',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export enum CampaignFlagStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED',
}

export enum OnboardingStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ModerationRuleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum ModerationRuleSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum GDPRRequestType {
  EXPORT = 'EXPORT',
  DELETE = 'DELETE',
}

export enum GDPRRequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum PlatformSettingType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
}

export enum NotificationType {
  APPLICATION = 'APPLICATION',
  MESSAGE = 'MESSAGE',
  CAMPAIGN = 'CAMPAIGN',
  PAYMENT = 'PAYMENT',
  SYSTEM = 'SYSTEM',
}

// User Types
export interface User {
  id: string
  email: string
  phone?: string
  role: UserRole
  supabaseId?: string
  emailVerified: boolean
  phoneVerified: boolean
  onboardingStatus?: OnboardingStatus
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  userId: string
  fullName?: string
  avatarUrl?: string
  bio?: string
  location?: string
  dateOfBirth?: string
}

export interface BrandProfile {
  userId: string
  companyName?: string
  website?: string
  industry?: string
  description?: string
  logoUrl?: string
  onboardingStatus?: OnboardingStatus
  verified?: boolean
}

// Campaign Types
export interface Campaign {
  id: string
  brandId: string
  title: string
  description: string
  budget: number
  platform: CampaignPlatform
  category: string
  status: CampaignStatus
  startDate: string
  endDate: string
  applicationDeadline?: string
  maxApplicants?: number
  selectedCreatorsCount: number
  requirements?: string
  deliverableTypes?: string[]
  tags?: string[]
  reviewReason?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  updatedAt: string
  brand?: BrandProfile
  deliverables?: CampaignDeliverable[]
  // Escrow/Wallet fields
  escrowAllocated?: number
  escrowReleased?: number
  escrowStatus?: EscrowStatus
}

export interface CampaignDeliverable {
  id: string
  campaignId: string
  title: string
  description?: string
  type: string
  dueDate?: string
  isMandatory: boolean
  orderIndex: number
  price?: number
}

export interface CampaignCreateRequest {
  title: string
  description: string
  budget: number
  platform: CampaignPlatform
  category: string
  startDate: string
  endDate: string
  applicationDeadline?: string
  maxApplicants?: number
  requirements?: string
  deliverableTypes?: string[]
  tags?: string[]
  deliverables?: CampaignDeliverableCreateRequest[]
}

export interface CampaignDeliverableCreateRequest {
  title: string
  description?: string
  type: string
  dueDate?: string
  isMandatory: boolean
  orderIndex: number
  price?: number
}

export interface CampaignUpdateRequest {
  title?: string
  description?: string
  budget?: number
  category?: string
  platform?: CampaignPlatform
  status?: CampaignStatus
  startDate?: string
  endDate?: string
  applicationDeadline?: string
  maxApplicants?: number
  requirements?: string
  deliverableTypes?: string[]
  tags?: string[]
  deliverables?: CampaignDeliverableCreateRequest[]
}

// Application Types
export interface Application {
  id: string
  campaignId: string
  creatorId: string
  status: ApplicationStatus
  pitchText: string
  expectedTimeline?: string
  appliedAt: string
  updatedAt: string
  campaign?: Campaign
  creator?: {
    id: string
    email: string
    profile?: UserProfile
  }
  feedback?: ApplicationFeedback
}

export interface ApplicationFeedback {
  id: string
  applicationId: string
  shortlistedAt?: string
  selectedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  brandNotes?: string
}

// Pagination Types
export interface Page<T> {
  items: T[]
  page: number
  size: number
  total: number
  totalPages: number
}

// API Error Types
export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  details?: Record<string, unknown>
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role: UserRole
  phone?: string
}

export interface AuthResponse {
  userId: string
  email: string
  role: UserRole
  supabaseUserId?: string
  onboardingStatus?: string
  message?: string
  // Token fields (optional, for direct backend auth if Supabase not available)
  accessToken?: string
  refreshToken?: string
}

// Message Types
export interface Conversation {
  id: string
  creatorId: string
  brandId: string
  campaignId?: string
  creatorUnreadCount: number
  brandUnreadCount: number
  lastMessageAt?: string
  lastMessage?: Message
  creator?: {
    id: string
    email: string
    profile?: UserProfile
  }
  campaign?: {
    id: string
    title: string
    status?: string
    platform?: string
  }
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  read: boolean
  createdAt: string
  sender?: {
    id: string
    email: string
    profile?: UserProfile
  }
}

// Team Members
export interface TeamMember {
  id: string
  email: string
  name: string
  role: string
  status: string
  invitedAt?: string
  joinedAt?: string
  invitedBy?: string
}

// Brand Verification
export interface BrandVerificationStatus {
  documentId?: string
  status: string
  onboardingStatus?: string
  fileUrl?: string
  rejectionReason?: string
  submittedAt?: string
  reviewedAt?: string
}

export interface DeliverableOverview {
  id: string
  applicationId?: string
  campaignId?: string
  campaignTitle?: string
  creatorId?: string
  creatorName?: string
  status?: string
  submittedAt?: string
  fileUrl?: string
  campaignDeliverable?: {
    title?: string
  }
}

// Campaign Templates
export interface CampaignTemplateDeliverable {
  id?: string
  title: string
  description?: string
  type: string
  dueDate?: string
  isMandatory?: boolean
  orderIndex?: number
}

export interface CampaignTemplate {
  id: string
  brandId: string
  title: string
  description: string
  budget: number
  platform: CampaignPlatform
  category: string
  requirements?: string
  deliverableTypes?: string[]
  tags?: string[]
  startDate?: string
  endDate?: string
  applicationDeadline?: string
  maxApplicants?: number
  deliverables?: CampaignTemplateDeliverable[]
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  metadata?: Record<string, unknown>
  createdAt: string
}

// Wallet Types
export interface Wallet {
  id: string
  userId: string
  balance: number
  pendingBalance: number
  totalEarned: number
  totalWithdrawn: number
}

export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  status: string
  description?: string
  referenceId?: string
  createdAt: string
}

// Admin Dashboard Types
export interface KYCDocument {
  id: string
  userId: string
  userEmail?: string
  documentType: DocumentType
  documentNumber?: string
  fileUrl: string
  backImageUrl?: string
  status: DocumentStatus
  rejectionReason?: string
  verifiedBy?: string
  submittedAt?: string
  verifiedAt?: string
}

export interface BrandVerificationDocument {
  documentId: string
  brandId?: string
  brandEmail?: string
  status: string
  fileUrl: string
  rejectionReason?: string
  submittedAt?: string
  reviewedAt?: string
}

export interface AdminUser {
  id: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
  lastLoginAt?: string
  fullName?: string
  companyName?: string
  creatorUsername?: string
}

export interface AccountAppeal {
  id: string
  userId: string
  userEmail: string
  status: AppealStatus
  reason: string
  resolution?: string
  resolvedBy?: string
  createdAt: string
  resolvedAt?: string
}

export interface DisputeEvidence {
  id: string
  fileUrl: string
  fileType?: string
  notes?: string
  submittedBy: string
  submittedAt: string
}

export interface DisputeTicket {
  id: string
  campaignId?: string
  campaignTitle?: string
  creatorId: string
  creatorEmail: string
  brandId: string
  brandEmail: string
  type: string
  status: string
  description: string
  resolution?: string
  resolvedBy?: string
  createdAt: string
  resolvedAt?: string
  evidence?: DisputeEvidence[]
}

export interface CampaignFlag {
  id: string
  campaignId: string
  campaignTitle: string
  ruleId?: string
  ruleName?: string
  status: CampaignFlagStatus
  reason: string
  flaggedBy?: string
  flaggedAt?: string
  resolvedBy?: string
  resolvedAt?: string
  resolutionNotes?: string
}

export interface ModerationRule {
  id: string
  name: string
  description?: string
  pattern: string
  action?: string
  severity: ModerationRuleSeverity
  status: ModerationRuleStatus
  createdAt?: string
}

export interface GDPRRequest {
  id: string
  userId: string
  userEmail: string
  requestType: GDPRRequestType
  status: GDPRRequestStatus
  details?: Record<string, unknown>
  exportUrl?: string
  resolvedBy?: string
  createdAt: string
  resolvedAt?: string
}

export interface PlatformSetting {
  id?: string
  key: string
  value: string
  dataType: PlatformSettingType
  description?: string
}

export interface FinanceSummary {
  totalEarnings: number
  totalWithdrawals: number
  totalRefunds: number
  totalPenalties: number
  pendingPayouts: number
  totalTransactions: number
}

export interface AdminSummary {
  totalUsers: number
  totalCampaigns: number
  pendingKyc: number
  pendingBrandVerifications: number
  openDisputes: number
  openCampaignFlags: number
  openAppeals: number
  pendingGdprRequests: number
}

export interface AuditLogEntry {
  id: string
  adminId: string
  adminEmail: string
  actionType: string
  entityType: string
  entityId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

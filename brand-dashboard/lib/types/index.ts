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

export enum CampaignStatus {
  DRAFT = 'DRAFT',
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
  createdAt: string
  updatedAt: string
  brand?: BrandProfile
  deliverables?: CampaignDeliverable[]
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

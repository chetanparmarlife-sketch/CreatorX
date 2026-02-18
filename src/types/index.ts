export type CampaignStatus = 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export type ApplicationStatus = 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';

export type DeliverableStatus = 'pending' | 'submitted' | 'revision' | 'approved' | 'rejected' | 'draft_submitted' | 'brand_reviewing' | 'changes_requested' | 'posted';

export type PaymentStatus = 'pending' | 'processing' | 'paid';

export type CampaignUserState = 'SAVED' | 'APPLIED' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';

export interface Campaign {
  id: string;
  title: string;
  brand: string;
  brandLogo?: string;
  budget: string;
  deadline: string;
  daysRemaining?: number;
  platform: 'instagram' | 'youtube' | 'linkedin' | 'facebook';
  platforms?: ('instagram' | 'youtube' | 'linkedin' | 'facebook')[];
  category: string;
  applicants: number;
  status: CampaignStatus;
  userState?: CampaignUserState;
  description?: string;
  brief?: string;
  requirements?: string[];
  mandatoryDeliverables?: CampaignDeliverable[];
  timeline?: string;
  compensation?: string;
  paymentTerms?: string;
  image?: string;
  tags?: string[];
  contentTypes?: string[];
  ageGroup?: string;
  followersRange?: string;
  gender?: string;
  isPaid?: boolean;
  escrowStatus?: 'UNFUNDED' | 'PARTIAL' | 'FUNDED' | 'RELEASED' | 'REFUNDED';
}

export interface CampaignDeliverable {
  id: string;
  type: string;
  description: string;
  quantity: number;
}

export interface CampaignApplication {
  id: string;
  campaignId: string;
  creatorId: string;
  pitch: string;
  expectedTimeline?: string;
  extraDetails?: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  brandFeedback?: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'pending';
  title: string;
  description: string;
  amount: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  campaignId?: string;
}

export interface ChatPreview {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  type: 'brand' | 'support';
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  time: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  conversationId?: string;
  chatId?: string;
  createdAt?: string;
}

export interface Conversation {
  chatId: string;
  messages?: Message[];
  name?: string;
  lastMessage?: string;
  unread?: number;
  online?: boolean;
  type?: 'brand' | 'support';
}

export interface Deliverable {
  id: string;
  campaignId: string;
  campaignTitle: string;
  brand: string;
  dueDate: string;
  status: DeliverableStatus;
  type: 'content_draft' | 'thumbnail' | 'caption' | 'raw_file' | 'post_proof';
  title: string;
  description?: string;
  submittedFile?: {
    name: string;
    type: 'video' | 'image' | 'document';
    uri?: string;
  };
  feedback?: string;
  submittedAt?: string;
  postUrl?: string;
}

export interface ActiveCampaign {
  id: string;
  campaignId: string;
  title: string;
  brand: string;
  brandLogo?: string;
  deadline: string;
  platform: 'instagram' | 'youtube' | 'linkedin';
  paymentStatus: PaymentStatus;
  paymentAmount: string;
  deliverables: Deliverable[];
  completedAt?: string;
  creatorRating?: Rating;
  brandRating?: Rating;
}

export interface Rating {
  score: number;
  comment?: string;
  ratedAt: string;
}

export interface Notification {
  id: string;
  type: 'payment' | 'campaign' | 'message' | 'referral' | 'system' | 'application';
  title: string;
  description: string;
  time: string;
  read: boolean;
  createdAt?: string;
  readAt?: string;
  action?: {
    label: string;
    path: string;
  };
}

export interface CreatorProfile {
  name: string;
  bio: string;
  niche: string;
  city: string;
  audienceStats: AudienceStats;
  pricing: PricingInfo;
  sampleContent: SampleContent[];
  socialAccounts: SocialAccount[];
  totalFollowers: number;
}

export interface AudienceStats {
  ageRange: string;
  gender: string;
  topLocations: string[];
  engagementRate: string;
}

export interface PricingInfo {
  postRate: string;
  storyRate: string;
  videoRate: string;
  customNote?: string;
}

export interface SampleContent {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title?: string;
}

export interface SocialAccount {
  platform: 'instagram' | 'youtube' | 'linkedin';
  username: string;
  followers: number;
  connected: boolean;
  profileUrl?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  isVerified: boolean;
  kycVerified: boolean;
  isPro: boolean;
  referralCode: string;
  referralCount: number;
  referralEarnings: number;
  categories: string[];
  socialLinks: SocialLink[];
  preferences: UserPreferences;
  avatarUri?: string;
  creatorProfile?: CreatorProfile;
  isEligible?: boolean;
  totalFollowers?: number;
  address?: Address;
  birthDate?: string;
}

export interface SocialLink {
  platform: string;
  icon: string;
  url: string;
  followers: string;
}

export interface UserPreferences {
  availableForCampaigns: boolean;
  showProfilePublicly: boolean;
  emailNotifications: boolean;
}

export interface WalletData {
  balance: number;
  pending: number;
  withdrawn: number;
  monthlyChange: number;
  lifetimeEarnings: number;
}

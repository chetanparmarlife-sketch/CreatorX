import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Campaign,
  Transaction,
  ChatPreview,
  Notification,
  Deliverable,
  Message,
  Conversation,
  UserProfile,
  WalletData,
  SocialLink,
  UserPreferences,
  ActiveCampaign,
  CampaignApplication,
} from '@/src/types';
import { profileService } from '@/src/api/services/profileService';
import { featureFlags } from '@/src/config/featureFlags';

interface ApplicationFormData {
  pitch: string;
  expectedTimeline: string;
  extraDetails?: string;
}

interface AppContextType {
  user: UserProfile;
  wallet: WalletData;
  campaigns: Campaign[];
  applications: CampaignApplication[];
  deliverables: Deliverable[];
  transactions: Transaction[];
  chats: ChatPreview[];
  conversations: Conversation[];
  savedCampaigns: string[];
  notifications: Notification[];
  unreadNotifications: number;
  darkMode: boolean;
  isLoading: boolean;
  activeCampaigns: ActiveCampaign[];
  saveCampaign: (campaignId: string) => void;
  unsaveCampaign: (campaignId: string) => void;
  isCampaignSaved: (campaignId: string) => boolean;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  toggleDarkMode: () => void;
  updateWallet: (data: Partial<WalletData>) => void;
  refreshData: () => Promise<void>;
  applyCampaign: (campaignId: string, applicationData: ApplicationFormData) => void;
  getApplication: (campaignId: string) => CampaignApplication | undefined;
  approveApplication: (campaignId: string) => void;
  rejectApplication: (campaignId: string, feedback?: string) => void;
  updateCampaignStatus: (campaignId: string, status: Campaign['status']) => void;
  addDeliverable: (deliverable: Omit<Deliverable, 'id'>) => void;
  updateDeliverable: (id: string, updates: Partial<Deliverable>) => void;
  submitDeliverable: (
    activeCampaignId: string,
    deliverableId: string,
    file: { name: string; type: 'video' | 'image'; uri: string },
    description?: string
  ) => void;
  approveDeliverable: (activeCampaignId: string, deliverableId: string) => void;
  requestDeliverableChanges: (activeCampaignId: string, deliverableId: string, feedback: string) => void;
  markDeliverablePosted: (activeCampaignId: string, deliverableId: string, postUrl?: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  fetchProfile: () => Promise<void>;
  uploadAvatar: (file: { uri: string; type: string; name: string }) => Promise<string | null>;
  sendMessage: (chatId: string, text: string) => void;
  getConversation: (chatId: string) => Message[];
  markChatRead: (chatId: string) => void;
  copyReferralCode: () => Promise<boolean>;
  updateActiveCampaign: (id: string, updates: Partial<ActiveCampaign>) => void;
  completeCampaign: (activeCampaignId: string) => void;
  processPayment: (activeCampaignId: string) => void;
}

const defaultUser: UserProfile = {
  id: '1',
  name: 'Rahul Kumar',
  username: '@rahulcreates',
  email: 'rahul@example.com',
  bio: 'Creative content creator | Fashion & Lifestyle | Partnering with brands to tell authentic stories',
  isVerified: true,
  kycVerified: true,
  isPro: true,
  referralCode: 'RAHUL2024',
  referralCount: 12,
  referralEarnings: 6000,
  categories: ['Fashion', 'Lifestyle'],
  socialLinks: [
    { platform: 'Instagram', icon: 'instagram', url: '@rahulcreates', followers: '125K' },
    { platform: 'YouTube', icon: 'youtube', url: 'RahulCreates', followers: '89K' },
    { platform: 'LinkedIn', icon: 'linkedin', url: 'rahulcreates', followers: '12K' },
  ],
  preferences: {
    availableForCampaigns: true,
    showProfilePublicly: true,
    emailNotifications: false,
  },
  address: undefined,
  birthDate: undefined,
};

const defaultWallet: WalletData = {
  balance: 45230,
  pending: 8500,
  withdrawn: 32000,
  monthlyChange: 15000,
  lifetimeEarnings: 85730,
};

const defaultCampaigns: Campaign[] = [
  {
    id: '1',
    title: 'Summer Fashion Collection 2024',
    brand: 'StyleCo',
    budget: '₹15K',
    deadline: 'Dec 15',
    daysRemaining: 9,
    platform: 'instagram',
    platforms: ['instagram', 'facebook'],
    category: 'Fashion',
    applicants: 45,
    status: 'ACTIVE',
    description: 'Create stunning content featuring our new summer fashion line. Looking for creators with a keen eye for style.',
    image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=200&h=200&fit=crop',
    tags: ['Fashion', 'Lifestyle'],
    contentTypes: ['Stories', 'Reels'],
    ageGroup: '18-35',
    followersRange: '50K-500K',
    gender: 'All',
    isPaid: true,
  },
  {
    id: '2',
    title: 'Tech Product Review Campaign',
    brand: 'TechBrand',
    budget: '₹25K',
    deadline: 'Dec 20',
    daysRemaining: 14,
    platform: 'youtube',
    platforms: ['youtube', 'instagram'],
    category: 'Tech',
    applicants: 23,
    status: 'ACTIVE',
    description: 'In-depth review of our latest smartphone. Perfect for tech enthusiasts with engaged audiences.',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
    tags: ['Tech Review', 'Unboxing'],
    contentTypes: ['Long video', 'Shorts'],
    ageGroup: '18-45',
    followersRange: '100K-1M',
    gender: 'Male',
    isPaid: true,
  },
  {
    id: '3',
    title: 'Food Delivery App Promo',
    brand: 'FoodieApp',
    budget: '₹8K',
    deadline: 'Dec 12',
    daysRemaining: 6,
    platform: 'instagram',
    platforms: ['instagram'],
    category: 'Food',
    applicants: 67,
    status: 'ACTIVE',
    description: 'Showcase your favorite meals ordered through our app. Food lovers and lifestyle creators welcome!',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop',
    tags: ['Food', 'Lifestyle'],
    contentTypes: ['Stories', 'Post'],
    ageGroup: '18-40',
    followersRange: '10K-100K',
    gender: 'All',
    isPaid: true,
  },
  {
    id: '4',
    title: 'Fitness Challenge Series',
    brand: 'GymPro',
    budget: '₹20K',
    deadline: 'Dec 25',
    daysRemaining: 19,
    platform: 'youtube',
    platforms: ['youtube', 'instagram'],
    category: 'Fitness',
    applicants: 34,
    status: 'ACTIVE',
    description: '30-day fitness challenge content series. Looking for fitness influencers to inspire their audience.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop',
    tags: ['Fitness', 'Health'],
    contentTypes: ['Long video', 'Reels'],
    ageGroup: '18-35',
    followersRange: '50K-500K',
    gender: 'All',
    isPaid: true,
  },
  {
    id: '5',
    title: 'Travel Adventure Vlog Series',
    brand: 'WanderLust',
    budget: '₹30K',
    deadline: 'Jan 5',
    daysRemaining: 30,
    platform: 'youtube',
    platforms: ['youtube'],
    category: 'Travel',
    applicants: 56,
    status: 'ACTIVE',
    description: 'Create travel vlogs showcasing hidden gems. Perfect for travel content creators.',
    image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=200&h=200&fit=crop',
    tags: ['Travel', 'Adventure'],
    contentTypes: ['Long video', 'Shorts'],
    ageGroup: '18-45',
    followersRange: '200K-1M',
    gender: 'All',
    isPaid: true,
  },
  {
    id: '6',
    title: 'Skincare Product Launch',
    brand: 'GlowUp',
    budget: '₹12K',
    deadline: 'Dec 18',
    daysRemaining: 12,
    platform: 'instagram',
    platforms: ['instagram', 'facebook'],
    category: 'Beauty',
    applicants: 89,
    status: 'ACTIVE',
    description: 'Be part of our new skincare line launch. Beauty and wellness creators with authentic voice preferred.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop',
    tags: ['Beauty', 'Skincare'],
    contentTypes: ['Stories', 'Reels'],
    ageGroup: '18-35',
    followersRange: '25K-250K',
    gender: 'Female',
    isPaid: true,
  },
];

const defaultDeliverables: Deliverable[] = [
  {
    id: '1',
    campaignId: 'active-1',
    campaignTitle: 'Summer Fashion Collection',
    brand: 'StyleCo',
    dueDate: 'Dec 10, 2024',
    status: 'pending',
    type: 'content_draft',
    title: 'Instagram Reel - Summer Look',
  },
  {
    id: '2',
    campaignId: 'active-2',
    campaignTitle: 'Tech Product Review',
    brand: 'TechBrand',
    dueDate: 'Dec 15, 2024',
    status: 'draft_submitted',
    type: 'content_draft',
    title: 'YouTube Review Video',
    submittedFile: {
      name: 'product_review_final.mp4',
      type: 'video',
    },
    submittedAt: '2024-12-01',
  },
  {
    id: '3',
    campaignId: 'active-3',
    campaignTitle: 'Food Delivery Promo',
    brand: 'FoodieApp',
    dueDate: 'Dec 8, 2024',
    status: 'changes_requested',
    type: 'content_draft',
    title: 'Instagram Story - Food Delivery',
    feedback: 'Please add more product shots and reduce the intro duration.',
  },
  {
    id: '4',
    campaignId: 'active-4',
    campaignTitle: 'Fitness Challenge Week 1',
    brand: 'GymPro',
    dueDate: 'Dec 5, 2024',
    status: 'approved',
    type: 'content_draft',
    title: 'Workout Day 1 Video',
    submittedFile: {
      name: 'workout_day1.mp4',
      type: 'video',
    },
    submittedAt: '2024-11-28',
  },
];

const defaultTransactions: Transaction[] = [
  {
    id: '1',
    type: 'credit',
    title: 'Campaign Payment',
    description: 'StyleCo - Summer Collection',
    amount: '₹15,000',
    date: 'Dec 2',
    status: 'completed',
  },
  {
    id: '2',
    type: 'debit',
    title: 'Withdrawal',
    description: 'Bank Transfer - HDFC',
    amount: '₹10,000',
    date: 'Dec 1',
    status: 'completed',
  },
  {
    id: '3',
    type: 'pending',
    title: 'Pending Payment',
    description: 'TechBrand - Review',
    amount: '₹8,500',
    date: 'Nov 28',
    status: 'pending',
  },
  {
    id: '4',
    type: 'credit',
    title: 'Campaign Payment',
    description: 'FoodieApp - Promo',
    amount: '₹8,000',
    date: 'Nov 25',
    status: 'completed',
  },
  {
    id: '5',
    type: 'credit',
    title: 'Referral Bonus',
    description: 'New creator signup',
    amount: '₹500',
    date: 'Nov 22',
    status: 'completed',
  },
];

const defaultChats: ChatPreview[] = [
  {
    id: '1',
    name: 'StyleCo Team',
    lastMessage: 'Great! Looking forward to your submission',
    time: '2m ago',
    unread: 2,
    online: true,
    type: 'brand',
  },
  {
    id: '2',
    name: 'TechBrand',
    lastMessage: 'The product will be delivered by tomorrow',
    time: '1h ago',
    unread: 0,
    online: false,
    type: 'brand',
  },
  {
    id: '3',
    name: 'CreatorX Support',
    lastMessage: 'Your KYC has been verified successfully!',
    time: '3h ago',
    unread: 1,
    online: true,
    type: 'support',
  },
  {
    id: '4',
    name: 'FoodieApp',
    lastMessage: 'Can you reshoot the intro scene?',
    time: 'Yesterday',
    unread: 0,
    online: false,
    type: 'brand',
  },
  {
    id: '5',
    name: 'GymPro Fitness',
    lastMessage: 'Payment has been processed',
    time: '2d ago',
    unread: 0,
    online: false,
    type: 'brand',
  },
];

const defaultConversations: Conversation[] = [
  {
    chatId: '1',
    messages: [
      { id: '1', text: 'Hi Rahul! Thank you for applying to our Summer Fashion Collection campaign.', sender: 'other', time: '10:30 AM', status: 'read' },
      { id: '2', text: "We've reviewed your profile and we're impressed with your content quality!", sender: 'other', time: '10:31 AM', status: 'read' },
      { id: '3', text: "Thank you so much! I'm really excited about this opportunity.", sender: 'user', time: '10:35 AM', status: 'read' },
      { id: '4', text: 'Could you share more details about the deliverables and timeline?', sender: 'user', time: '10:36 AM', status: 'read' },
      { id: '5', text: 'Of course! We need 2 Instagram reels and 3 stories showcasing our new summer collection.', sender: 'other', time: '10:40 AM', status: 'read' },
      { id: '6', text: 'The deadline is December 15th. We will send you the products by December 5th.', sender: 'other', time: '10:41 AM', status: 'read' },
      { id: '7', text: "That sounds perfect! I'll start planning the content as soon as I receive the products.", sender: 'user', time: '10:45 AM', status: 'delivered' },
      { id: '8', text: 'Great! Looking forward to your submission', sender: 'other', time: '10:50 AM', status: 'read' },
    ],
  },
  {
    chatId: '2',
    messages: [
      { id: '1', text: 'Hi! We want to send you our latest smartphone for review.', sender: 'other', time: '9:00 AM', status: 'read' },
      { id: '2', text: "That's great! What are the specifications?", sender: 'user', time: '9:15 AM', status: 'read' },
      { id: '3', text: 'The product will be delivered by tomorrow', sender: 'other', time: '9:30 AM', status: 'read' },
    ],
  },
  {
    chatId: '3',
    messages: [
      { id: '1', text: 'Welcome to CreatorX! We\'re here to help you succeed.', sender: 'other', time: '8:00 AM', status: 'read' },
      { id: '2', text: 'Your KYC has been verified successfully!', sender: 'other', time: '2:00 PM', status: 'read' },
    ],
  },
];

const defaultNotifications: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Payment Received',
    description: 'You received ₹15,000 from StyleCo for Summer Collection',
    time: '2m ago',
    read: false,
    action: { label: 'View', path: '/wallet' },
  },
  {
    id: '2',
    type: 'campaign',
    title: 'New Campaign Match',
    description: '5 new campaigns match your profile',
    time: '1h ago',
    read: false,
    action: { label: 'Explore', path: '/explore' },
  },
  {
    id: '3',
    type: 'message',
    title: 'New Message',
    description: 'StyleCo Team sent you a message',
    time: '2h ago',
    read: true,
    action: { label: 'Reply', path: '/chat' },
  },
  {
    id: '4',
    type: 'referral',
    title: 'Referral Bonus',
    description: 'You earned ₹500 from a new referral signup',
    time: '1d ago',
    read: true,
  },
  {
    id: '5',
    type: 'system',
    title: 'Profile Updated',
    description: 'Your KYC verification has been approved',
    time: '2d ago',
    read: true,
  },
];

const defaultActiveCampaigns: ActiveCampaign[] = [
  {
    id: 'active-1',
    campaignId: '1',
    title: 'Summer Fashion Collection',
    brand: 'StyleCo',
    deadline: 'Dec 15, 2024',
    platform: 'instagram',
    paymentStatus: 'pending',
    paymentAmount: '₹15,000',
    deliverables: [
      { id: 'del-1', campaignId: 'active-1', campaignTitle: 'Summer Fashion Collection', brand: 'StyleCo', dueDate: 'Dec 10', status: 'pending', type: 'content_draft', title: 'Instagram Reel 1' },
      { id: 'del-2', campaignId: 'active-1', campaignTitle: 'Summer Fashion Collection', brand: 'StyleCo', dueDate: 'Dec 12', status: 'pending', type: 'content_draft', title: 'Story Set' },
    ],
  },
  {
    id: 'active-2',
    campaignId: '2',
    title: 'Tech Product Review',
    brand: 'TechBrand',
    deadline: 'Dec 20, 2024',
    platform: 'youtube',
    paymentStatus: 'processing',
    paymentAmount: '₹25,000',
    deliverables: [
      { id: 'del-3', campaignId: 'active-2', campaignTitle: 'Tech Product Review', brand: 'TechBrand', dueDate: 'Dec 15', status: 'draft_submitted', type: 'content_draft', title: 'Unboxing Video' },
      { id: 'del-4', campaignId: 'active-2', campaignTitle: 'Tech Product Review', brand: 'TechBrand', dueDate: 'Dec 18', status: 'approved', type: 'content_draft', title: 'Review Video' },
    ],
  },
];

const STORAGE_KEYS = {
  USER: '@user_profile',
  WALLET: '@wallet',
  CAMPAIGNS: '@campaigns',
  APPLICATIONS: '@applications',
  DELIVERABLES: '@deliverables',
  TRANSACTIONS: '@transactions',
  CHATS: '@chats',
  CONVERSATIONS: '@conversations',
  SAVED_CAMPAIGNS: '@saved_campaigns',
  NOTIFICATIONS: '@notifications',
  DARK_MODE: '@dark_mode',
  ACTIVE_CAMPAIGNS: '@active_campaigns',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [wallet, setWallet] = useState<WalletData>(defaultWallet);
  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultCampaigns);
  const [deliverables, setDeliverables] = useState<Deliverable[]>(defaultDeliverables);
  const [transactions, setTransactions] = useState<Transaction[]>(defaultTransactions);
  const [chats, setChats] = useState<ChatPreview[]>(defaultChats);
  const [conversations, setConversations] = useState<Conversation[]>(defaultConversations);
  const [savedCampaigns, setSavedCampaigns] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [activeCampaigns, setActiveCampaigns] = useState<ActiveCampaign[]>(defaultActiveCampaigns);
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const loadStoredData = useCallback(async () => {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const results = await AsyncStorage.multiGet(keys);
      const data: { [key: string]: string | null } = {};
      results.forEach(([key, value]) => {
        data[key] = value;
      });

      if (data[STORAGE_KEYS.USER]) setUser(JSON.parse(data[STORAGE_KEYS.USER]!));
      if (data[STORAGE_KEYS.WALLET]) setWallet(JSON.parse(data[STORAGE_KEYS.WALLET]!));
      if (data[STORAGE_KEYS.CAMPAIGNS]) setCampaigns(JSON.parse(data[STORAGE_KEYS.CAMPAIGNS]!));
      if (data[STORAGE_KEYS.DELIVERABLES]) setDeliverables(JSON.parse(data[STORAGE_KEYS.DELIVERABLES]!));
      if (data[STORAGE_KEYS.TRANSACTIONS]) setTransactions(JSON.parse(data[STORAGE_KEYS.TRANSACTIONS]!));
      if (data[STORAGE_KEYS.CHATS]) setChats(JSON.parse(data[STORAGE_KEYS.CHATS]!));
      if (data[STORAGE_KEYS.CONVERSATIONS]) setConversations(JSON.parse(data[STORAGE_KEYS.CONVERSATIONS]!));
      if (data[STORAGE_KEYS.SAVED_CAMPAIGNS]) setSavedCampaigns(JSON.parse(data[STORAGE_KEYS.SAVED_CAMPAIGNS]!));
      if (data[STORAGE_KEYS.NOTIFICATIONS]) setNotifications(JSON.parse(data[STORAGE_KEYS.NOTIFICATIONS]!));
      if (data[STORAGE_KEYS.ACTIVE_CAMPAIGNS]) setActiveCampaigns(JSON.parse(data[STORAGE_KEYS.ACTIVE_CAMPAIGNS]!));
      if (data[STORAGE_KEYS.APPLICATIONS]) setApplications(JSON.parse(data[STORAGE_KEYS.APPLICATIONS]!));
      if (data[STORAGE_KEYS.DARK_MODE]) setDarkMode(JSON.parse(data[STORAGE_KEYS.DARK_MODE]!));
    } catch (error) {
      console.error('Error loading stored data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredData();
  }, [loadStoredData]);

  const saveToStorage = useCallback(async (key: string, value: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }, []);

  const saveCampaign = useCallback(async (campaignId: string) => {
    const updated = [...savedCampaigns, campaignId];
    setSavedCampaigns(updated);
    await saveToStorage(STORAGE_KEYS.SAVED_CAMPAIGNS, updated);
  }, [savedCampaigns, saveToStorage]);

  const unsaveCampaign = useCallback(async (campaignId: string) => {
    const updated = savedCampaigns.filter((id) => id !== campaignId);
    setSavedCampaigns(updated);
    await saveToStorage(STORAGE_KEYS.SAVED_CAMPAIGNS, updated);
  }, [savedCampaigns, saveToStorage]);

  const isCampaignSaved = useCallback(
    (campaignId: string) => savedCampaigns.includes(campaignId),
    [savedCampaigns]
  );

  const markNotificationRead = useCallback(async (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    await saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  }, [notifications, saveToStorage]);

  const markAllNotificationsRead = useCallback(async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    await saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  }, [notifications, saveToStorage]);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
    };
    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    await saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  }, [notifications, saveToStorage]);

  const toggleDarkMode = useCallback(async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    await saveToStorage(STORAGE_KEYS.DARK_MODE, newValue);
  }, [darkMode, saveToStorage]);

  const updateWallet = useCallback(async (data: Partial<WalletData>) => {
    const updated = { ...wallet, ...data };
    setWallet(updated);
    await saveToStorage(STORAGE_KEYS.WALLET, updated);
  }, [wallet, saveToStorage]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await loadStoredData();
  }, [loadStoredData]);

  const applyCampaign = useCallback(async (campaignId: string, applicationData: ApplicationFormData) => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    const updatedCampaigns = campaigns.map((c) =>
      c.id === campaignId ? { ...c, userState: 'APPLIED', applicants: c.applicants + 1 } : c
    );
    setCampaigns(updatedCampaigns);
    await saveToStorage(STORAGE_KEYS.CAMPAIGNS, updatedCampaigns);

    const newApplication: CampaignApplication = {
      id: Date.now().toString(),
      campaignId,
      creatorId: user.id,
      pitch: applicationData.pitch,
      expectedTimeline: applicationData.expectedTimeline,
      extraDetails: applicationData.extraDetails,
      status: 'APPLIED',
      submittedAt: new Date().toISOString(),
    };
    const updatedApplications = [...applications, newApplication];
    setApplications(updatedApplications);
    await saveToStorage(STORAGE_KEYS.APPLICATIONS, updatedApplications);

    addNotification({
      type: 'application',
      title: 'Application Submitted',
      description: `Your application for "${campaign.title}" is under review`,
      time: 'Just now',
      read: false,
    });
  }, [campaigns, applications, user.id, saveToStorage, addNotification]);

  const getApplication = useCallback((campaignId: string) => {
    return applications.find((a) => a.campaignId === campaignId);
  }, [applications]);

  const approveApplication = useCallback(async (campaignId: string) => {
    const application = applications.find((a) => a.campaignId === campaignId);
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!application || !campaign) return;

    const updatedApplications = applications.map((a) =>
      a.campaignId === campaignId
        ? { ...a, status: 'SELECTED', reviewedAt: new Date().toISOString() }
        : a
    );
    setApplications(updatedApplications);
    await saveToStorage(STORAGE_KEYS.APPLICATIONS, updatedApplications);

    const updatedCampaigns = campaigns.map((c) =>
      c.id === campaignId ? { ...c, userState: 'SELECTED' } : c
    );
    setCampaigns(updatedCampaigns);
    await saveToStorage(STORAGE_KEYS.CAMPAIGNS, updatedCampaigns);

    const campaignDeliverables: Deliverable[] = (campaign.mandatoryDeliverables || []).map((del, index) => ({
      id: `del-${Date.now()}-${index}`,
      campaignId: `active-${campaignId}`,
      campaignTitle: campaign.title,
      brand: campaign.brand,
      dueDate: campaign.deadline,
      status: 'pending' as const,
      type: 'content_draft' as const,
      title: del.description || `${del.type} #${del.quantity}`,
    }));

    if (campaignDeliverables.length === 0) {
      campaignDeliverables.push({
        id: `del-${Date.now()}-0`,
        campaignId: `active-${campaignId}`,
        campaignTitle: campaign.title,
        brand: campaign.brand,
        dueDate: campaign.deadline,
        status: 'pending',
        type: 'content_draft',
        title: `${campaign.title} - Content Draft`,
      });
    }

    const newActiveCampaign: ActiveCampaign = {
      id: `active-${campaignId}`,
      campaignId,
      title: campaign.title,
      brand: campaign.brand,
      brandLogo: campaign.brandLogo,
      deadline: campaign.deadline,
      platform: campaign.platform as 'instagram' | 'youtube' | 'linkedin',
      paymentStatus: 'pending',
      paymentAmount: campaign.budget,
      deliverables: campaignDeliverables,
    };
    const updatedActiveCampaigns = [...activeCampaigns, newActiveCampaign];
    setActiveCampaigns(updatedActiveCampaigns);
    await saveToStorage(STORAGE_KEYS.ACTIVE_CAMPAIGNS, updatedActiveCampaigns);

    addNotification({
      type: 'application',
      title: 'Application Approved!',
      description: `Congratulations! Your application for "${campaign.title}" has been approved. Start creating your content!`,
      time: 'Just now',
      read: false,
      action: { label: 'View Campaign', path: '/active-campaigns' },
    });
  }, [applications, campaigns, activeCampaigns, saveToStorage, addNotification]);

  const rejectApplication = useCallback(async (campaignId: string, feedback?: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId);

    const updatedApplications = applications.map((a) =>
      a.campaignId === campaignId
        ? { ...a, status: 'REJECTED', reviewedAt: new Date().toISOString(), brandFeedback: feedback }
        : a
    );
    setApplications(updatedApplications);
    await saveToStorage(STORAGE_KEYS.APPLICATIONS, updatedApplications);

    const updatedCampaigns = campaigns.map((c) =>
      c.id === campaignId ? { ...c, userState: 'REJECTED' } : c
    );
    setCampaigns(updatedCampaigns);
    await saveToStorage(STORAGE_KEYS.CAMPAIGNS, updatedCampaigns);

    addNotification({
      type: 'application',
      title: 'Application Not Selected',
      description: feedback || `Your application for "${campaign?.title}" was not selected this time.`,
      time: 'Just now',
      read: false,
    });
  }, [applications, campaigns, saveToStorage, addNotification]);

  const submitDeliverable = useCallback(async (
    activeCampaignId: string,
    deliverableId: string,
    file: { name: string; type: 'video' | 'image'; uri: string },
    _description?: string
  ) => {
    const updatedActiveCampaigns = activeCampaigns.map((ac) => {
      if (ac.id !== activeCampaignId) return ac;
      return {
        ...ac,
        deliverables: ac.deliverables.map((d) =>
          d.id === deliverableId
            ? {
              ...d,
              status: 'brand_reviewing' as const,
              submittedFile: { name: file.name, type: file.type, uri: file.uri },
              submittedAt: new Date().toISOString(),
            }
            : d
        ),
      };
    });
    setActiveCampaigns(updatedActiveCampaigns);
    await saveToStorage(STORAGE_KEYS.ACTIVE_CAMPAIGNS, updatedActiveCampaigns);

    const activeCampaign = activeCampaigns.find((ac) => ac.id === activeCampaignId);
    addNotification({
      type: 'campaign',
      title: 'Content Submitted',
      description: `Your content for "${activeCampaign?.title}" is now under brand review`,
      time: 'Just now',
      read: false,
    });
  }, [activeCampaigns, saveToStorage, addNotification]);

  const processPaymentWithData = useCallback(async (campaignData: ActiveCampaign) => {
    setActiveCampaigns((prevCampaigns) => {
      const updated = prevCampaigns.map((ac) =>
        ac.id === campaignData.id ? { ...ac, paymentStatus: 'paid' as const } : ac
      );
      saveToStorage(STORAGE_KEYS.ACTIVE_CAMPAIGNS, updated);
      return updated;
    });

    const amountNum = parseInt(campaignData.paymentAmount.replace(/[^0-9]/g, '')) || 0;
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'credit',
      title: 'Campaign Payment',
      description: `${campaignData.brand} - ${campaignData.title}`,
      amount: campaignData.paymentAmount,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: 'completed',
      campaignId: campaignData.campaignId,
    };

    setTransactions((prevTransactions) => {
      const updated = [newTransaction, ...prevTransactions];
      saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
      return updated;
    });

    setWallet((prevWallet) => {
      const updated = {
        ...prevWallet,
        balance: prevWallet.balance + amountNum,
        lifetimeEarnings: prevWallet.lifetimeEarnings + amountNum,
        monthlyChange: prevWallet.monthlyChange + amountNum,
      };
      saveToStorage(STORAGE_KEYS.WALLET, updated);
      return updated;
    });

    addNotification({
      type: 'payment',
      title: 'Payment Received!',
      description: `You received ${campaignData.paymentAmount} from ${campaignData.brand}`,
      time: 'Just now',
      read: false,
      action: { label: 'View Wallet', path: '/wallet' },
    });
  }, [saveToStorage, addNotification]);

  const completeCampaign = useCallback(async (activeCampaignId: string) => {
    const activeCampaign = activeCampaigns.find((ac) => ac.id === activeCampaignId);
    if (!activeCampaign) return;

    const updatedActiveCampaigns = activeCampaigns.map((ac) =>
      ac.id === activeCampaignId
        ? { ...ac, paymentStatus: 'processing' as const, completedAt: new Date().toISOString() }
        : ac
    );
    setActiveCampaigns(updatedActiveCampaigns);
    await saveToStorage(STORAGE_KEYS.ACTIVE_CAMPAIGNS, updatedActiveCampaigns);

    const campaignId = activeCampaign.campaignId;
    if (campaignId) {
      const updatedCampaigns = campaigns.map((c) =>
        c.id === campaignId ? { ...c, status: 'completed' as const } : c
      );
      setCampaigns(updatedCampaigns);
      await saveToStorage(STORAGE_KEYS.CAMPAIGNS, updatedCampaigns);
    }

    addNotification({
      type: 'campaign',
      title: 'Campaign Completed!',
      description: `Congratulations! "${activeCampaign.title}" is complete. Payment is being processed.`,
      time: 'Just now',
      read: false,
      action: { label: 'View Wallet', path: '/wallet' },
    });

    const campaignData = { ...activeCampaign };
    setTimeout(() => processPaymentWithData(campaignData), 3000);
  }, [activeCampaigns, campaigns, saveToStorage, addNotification, processPaymentWithData]);

  const approveDeliverable = useCallback(async (activeCampaignId: string, deliverableId: string) => {
    let allApproved = false;
    const updatedActiveCampaigns = activeCampaigns.map((ac) => {
      if (ac.id !== activeCampaignId) return ac;
      const updatedDeliverables = ac.deliverables.map((d) =>
        d.id === deliverableId ? { ...d, status: 'approved' as const } : d
      );
      allApproved = updatedDeliverables.every((d) => d.status === 'approved' || d.status === 'posted');
      return { ...ac, deliverables: updatedDeliverables };
    });
    setActiveCampaigns(updatedActiveCampaigns);
    await saveToStorage(STORAGE_KEYS.ACTIVE_CAMPAIGNS, updatedActiveCampaigns);

    const activeCampaign = activeCampaigns.find((ac) => ac.id === activeCampaignId);
    addNotification({
      type: 'campaign',
      title: 'Content Approved!',
      description: `Your content for "${activeCampaign?.title}" has been approved by the brand`,
      time: 'Just now',
      read: false,
    });

    if (allApproved) {
      setTimeout(() => completeCampaign(activeCampaignId), 500);
    }
  }, [activeCampaigns, saveToStorage, addNotification, completeCampaign]);

  const requestDeliverableChanges = useCallback(async (
    activeCampaignId: string,
    deliverableId: string,
    feedback: string
  ) => {
    const updatedActiveCampaigns = activeCampaigns.map((ac) => {
      if (ac.id !== activeCampaignId) return ac;
      return {
        ...ac,
        deliverables: ac.deliverables.map((d) =>
          d.id === deliverableId
            ? { ...d, status: 'changes_requested' as const, feedback }
            : d
        ),
      };
    });
    setActiveCampaigns(updatedActiveCampaigns);
    await saveToStorage(STORAGE_KEYS.ACTIVE_CAMPAIGNS, updatedActiveCampaigns);

    const activeCampaign = activeCampaigns.find((ac) => ac.id === activeCampaignId);
    addNotification({
      type: 'campaign',
      title: 'Changes Requested',
      description: `The brand has requested changes for "${activeCampaign?.title}"`,
      time: 'Just now',
      read: false,
      action: { label: 'View Feedback', path: '/active-campaigns' },
    });
  }, [activeCampaigns, saveToStorage, addNotification]);

  const markDeliverablePosted = useCallback(async (
    activeCampaignId: string,
    deliverableId: string,
    postUrl?: string
  ) => {
    let allPosted = false;
    const updatedActiveCampaigns = activeCampaigns.map((ac) => {
      if (ac.id !== activeCampaignId) return ac;
      const updatedDeliverables = ac.deliverables.map((d) =>
        d.id === deliverableId ? { ...d, status: 'posted' as const, postUrl } : d
      );
      allPosted = updatedDeliverables.every((d) => d.status === 'posted');
      return { ...ac, deliverables: updatedDeliverables };
    });
    setActiveCampaigns(updatedActiveCampaigns);
    await saveToStorage(STORAGE_KEYS.ACTIVE_CAMPAIGNS, updatedActiveCampaigns);

    const activeCampaign = activeCampaigns.find((ac) => ac.id === activeCampaignId);
    addNotification({
      type: 'campaign',
      title: 'Content Posted',
      description: `You marked content as posted for "${activeCampaign?.title}"`,
      time: 'Just now',
      read: false,
    });

    if (allPosted && activeCampaign?.paymentStatus === 'pending') {
      setTimeout(() => completeCampaign(activeCampaignId), 500);
    }
  }, [activeCampaigns, saveToStorage, addNotification, completeCampaign]);

  const processPayment = useCallback(async (activeCampaignId: string) => {
    const activeCampaign = activeCampaigns.find((ac) => ac.id === activeCampaignId);
    if (!activeCampaign) return;
    await processPaymentWithData(activeCampaign);
  }, [activeCampaigns, processPaymentWithData]);

  const updateCampaignStatus = useCallback(async (campaignId: string, status: Campaign['status']) => {
    const updated = campaigns.map((c) =>
      c.id === campaignId ? { ...c, status } : c
    );
    setCampaigns(updated);
    await saveToStorage(STORAGE_KEYS.CAMPAIGNS, updated);
  }, [campaigns, saveToStorage]);

  const addDeliverable = useCallback(async (deliverable: Omit<Deliverable, 'id'>) => {
    const newDeliverable: Deliverable = {
      ...deliverable,
      id: Date.now().toString(),
    };
    const updated = [...deliverables, newDeliverable];
    setDeliverables(updated);
    await saveToStorage(STORAGE_KEYS.DELIVERABLES, updated);
  }, [deliverables, saveToStorage]);

  const updateDeliverable = useCallback(async (id: string, updates: Partial<Deliverable>) => {
    const updated = deliverables.map((d) =>
      d.id === id ? { ...d, ...updates } : d
    );
    setDeliverables(updated);
    await saveToStorage(STORAGE_KEYS.DELIVERABLES, updated);

    if (updates.status === 'draft_submitted') {
      addNotification({
        type: 'campaign',
        title: 'Content Uploaded',
        description: 'Your deliverable has been submitted for review',
        time: 'Just now',
        read: false,
      });
    }
  }, [deliverables, saveToStorage, addNotification]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    const updated = [newTransaction, ...transactions];
    setTransactions(updated);
    await saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
  }, [transactions, saveToStorage]);

  const updateUser = useCallback(async (updates: Partial<UserProfile>) => {
    const updated = { ...user, ...updates };
    setUser(updated);

    // Always cache locally
    await saveToStorage(STORAGE_KEYS.USER, updated);

    // If API profile flag is enabled, persist to backend
    if (featureFlags.isEnabled('USE_API_PROFILE')) {
      try {
        // Map local fields to API fields
        await profileService.updateProfile({
          fullName: updated.name,
          bio: updated.bio,
          location: updated.address,
          dateOfBirth: updated.birthDate,
        });
      } catch (error) {
        console.error('Failed to persist profile to API:', error);
        // Continue with local state, don't throw
      }
    }
  }, [user, saveToStorage]);

  const fetchProfile = useCallback(async () => {
    if (!featureFlags.isEnabled('USE_API_PROFILE')) {
      return; // Use local storage only
    }

    try {
      const apiProfile = await profileService.getProfile();
      // Map API profile (fullName, location) to local UserProfile (name, address)
      const mappedProfile: UserProfile = {
        ...user,
        id: apiProfile.id || user.id,
        name: apiProfile.fullName || user.name,
        bio: apiProfile.bio || user.bio,
        avatarUrl: apiProfile.avatarUrl,
        address: apiProfile.location,
        birthDate: apiProfile.dateOfBirth,
      };

      setUser(mappedProfile);
      // Cache locally for offline access
      await saveToStorage(STORAGE_KEYS.USER, mappedProfile);
    } catch (error) {
      console.error('Failed to fetch profile from API:', error);
      // Fall back to cached data, already loaded in loadStoredData
    }
  }, [user, saveToStorage]);

  const uploadAvatar = useCallback(async (file: { uri: string; type: string; name: string }): Promise<string | null> => {
    if (!featureFlags.isEnabled('USE_API_PROFILE')) {
      // Store locally only
      await updateUser({ avatarUrl: file.uri });
      return file.uri;
    }

    try {
      const result = await profileService.uploadAvatar(file);
      await updateUser({ avatarUrl: result.avatarUrl });
      return result.avatarUrl;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      return null;
    }
  }, [updateUser]);

  const sendMessage = useCallback(async (chatId: string, text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      status: 'sending',
    };

    const existingConvo = conversations.find((c) => c.chatId === chatId);
    let updatedConversations: Conversation[];

    if (existingConvo) {
      updatedConversations = conversations.map((c) =>
        c.chatId === chatId
          ? { ...c, messages: [...c.messages, newMessage] }
          : c
      );
    } else {
      updatedConversations = [...conversations, { chatId, messages: [newMessage] }];
    }

    setConversations(updatedConversations);
    await saveToStorage(STORAGE_KEYS.CONVERSATIONS, updatedConversations);

    const updatedChats = chats.map((c) =>
      c.id === chatId
        ? { ...c, lastMessage: text, time: 'Just now' }
        : c
    );
    setChats(updatedChats);
    await saveToStorage(STORAGE_KEYS.CHATS, updatedChats);

    setTimeout(async () => {
      const deliveredConversations = updatedConversations.map((c) =>
        c.chatId === chatId
          ? {
            ...c,
            messages: c.messages.map((m) =>
              m.id === newMessage.id ? { ...m, status: 'delivered' as const } : m
            ),
          }
          : c
      );
      setConversations(deliveredConversations);
      await saveToStorage(STORAGE_KEYS.CONVERSATIONS, deliveredConversations);

      setTimeout(async () => {
        const replyMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thanks for your message! I'll get back to you shortly.",
          sender: 'other',
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
          status: 'read',
        };

        const repliedConversations = deliveredConversations.map((c) =>
          c.chatId === chatId
            ? { ...c, messages: [...c.messages, replyMessage] }
            : c
        );
        setConversations(repliedConversations);
        await saveToStorage(STORAGE_KEYS.CONVERSATIONS, repliedConversations);

        const repliedChats = updatedChats.map((c) =>
          c.id === chatId
            ? { ...c, lastMessage: replyMessage.text, time: 'Just now', unread: c.unread + 1 }
            : c
        );
        setChats(repliedChats);
        await saveToStorage(STORAGE_KEYS.CHATS, repliedChats);
      }, 2000);
    }, 500);
  }, [conversations, chats, saveToStorage]);

  const getConversation = useCallback(
    (chatId: string) => {
      const convo = conversations.find((c) => c.chatId === chatId);
      return convo?.messages || [];
    },
    [conversations]
  );

  const markChatRead = useCallback(async (chatId: string) => {
    const updated = chats.map((c) =>
      c.id === chatId ? { ...c, unread: 0 } : c
    );
    setChats(updated);
    await saveToStorage(STORAGE_KEYS.CHATS, updated);
  }, [chats, saveToStorage]);

  const copyReferralCode = useCallback(async () => {
    try {
      const Clipboard = require('expo-clipboard');
      await Clipboard.setStringAsync(user.referralCode);
      addNotification({
        type: 'system',
        title: 'Referral Code Copied',
        description: `Your referral code ${user.referralCode} has been copied to clipboard`,
        time: 'Just now',
        read: true,
      });
      return true;
    } catch (error) {
      console.error('Failed to copy referral code:', error);
      return false;
    }
  }, [user.referralCode, addNotification]);

  const updateActiveCampaign = useCallback(async (id: string, updates: Partial<ActiveCampaign>) => {
    const updated = activeCampaigns.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    setActiveCampaigns(updated);
    await saveToStorage(STORAGE_KEYS.ACTIVE_CAMPAIGNS, updated);
  }, [activeCampaigns, saveToStorage]);

  // Fetch profile from API on mount if flag enabled
  useEffect(() => {
    if (!isLoading) {
      fetchProfile();
    }
  }, [isLoading, fetchProfile]);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        user,
        wallet,
        campaigns,
        applications,
        deliverables,
        transactions,
        chats,
        conversations,
        savedCampaigns,
        notifications,
        unreadNotifications,
        darkMode,
        isLoading,
        activeCampaigns,
        saveCampaign,
        unsaveCampaign,
        isCampaignSaved,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        toggleDarkMode,
        updateWallet,
        refreshData,
        applyCampaign,
        getApplication,
        approveApplication,
        rejectApplication,
        updateCampaignStatus,
        addDeliverable,
        updateDeliverable,
        submitDeliverable,
        approveDeliverable,
        requestDeliverableChanges,
        markDeliverablePosted,
        addTransaction,
        updateUser,
        sendMessage,
        getConversation,
        markChatRead,
        copyReferralCode,
        updateActiveCampaign,
        completeCampaign,
        processPayment,
        fetchProfile,
        uploadAvatar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

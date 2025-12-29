/**
 * AppContext with Real API Integration
 * Migrated from mock data to use Spring Boot backend
 * Maintains backward compatibility with existing screens
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { featureFlags } from '@/src/config/featureFlags';
import {
  campaignService,
  applicationService,
  walletService,
  messagingService,
  notificationService,
  profileService,
  deliverableService,
} from '@/src/api/services';
import {
  adaptCampaignsResponse,
  adaptCampaign,
  adaptApplication,
  adaptTransaction,
  adaptWallet,
  adaptNotification,
  adaptConversationToChatPreview,
  adaptMessage,
  adaptConversation,
} from '@/src/api/adapters';
import { handleAPIError, isNetworkError } from '@/src/api/errors';
import { cacheUtils } from '@/src/api/utils/cache';
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
  ActiveCampaign,
  CampaignApplication,
} from '@/src/types';
import { CampaignFilters } from '@/src/api/services/campaignService';
import { ApplicationRequest } from '@/src/api/services/applicationService';

interface ApplicationFormData {
  pitch: string;
  expectedTimeline: string;
  extraDetails?: string;
}

interface AppContextType {
  // Data
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
  error: string | null;

  // Loading states
  loadingCampaigns: boolean;
  loadingApplications: boolean;
  loadingWallet: boolean;
  loadingTransactions: boolean;
  loadingNotifications: boolean;
  loadingChats: boolean;

  // Campaign pagination
  campaignsHasMore: boolean;
  campaignsTotal: number;

  // Actions - Campaigns
  fetchCampaigns: (filters?: CampaignFilters, reset?: boolean) => Promise<void>;
  loadMoreCampaigns: () => Promise<void>;
  getCampaignById: (id: string) => Campaign | undefined;
  saveCampaign: (campaignId: string) => Promise<void>;
  unsaveCampaign: (campaignId: string) => Promise<void>;
  isCampaignSaved: (campaignId: string) => boolean;

  // Actions - Applications
  applyCampaign: (campaignId: string, applicationData: ApplicationFormData) => Promise<void>;
  getApplication: (campaignId: string) => CampaignApplication | undefined;
  withdrawApplication: (applicationId: string) => Promise<void>;
  fetchApplications: () => Promise<void>;

  // Actions - Wallet
  fetchWallet: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  requestWithdrawal: (amount: number, bankAccountId: string) => Promise<void>;
  updateWallet: (data: Partial<WalletData>) => void;

  // Actions - Notifications
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  fetchNotifications: () => Promise<void>;

  // Actions - Messaging
  sendMessage: (chatId: string, text: string) => Promise<void>;
  getConversation: (chatId: string) => Message[];
  markChatRead: (chatId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;

  // Actions - Deliverables
  submitDeliverable: (
    activeCampaignId: string,
    deliverableId: string,
    file: { name: string; type: 'video' | 'image'; uri: string }
  ) => Promise<void>;
  approveDeliverable: (activeCampaignId: string, deliverableId: string) => Promise<void>;
  requestDeliverableChanges: (activeCampaignId: string, deliverableId: string, feedback: string) => Promise<void>;
  markDeliverablePosted: (activeCampaignId: string, deliverableId: string, postUrl?: string) => Promise<void>;

  // Actions - Active Campaigns
  updateActiveCampaign: (id: string, updates: Partial<ActiveCampaign>) => void;
  completeCampaign: (activeCampaignId: string) => Promise<void>;
  processPayment: (activeCampaignId: string) => Promise<void>;

  // Actions - User
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  toggleDarkMode: () => void;
  refreshData: () => Promise<void>;
  copyReferralCode: () => Promise<boolean>;

  // Actions - Deliverables (legacy)
  addDeliverable: (deliverable: Omit<Deliverable, 'id'>) => void;
  updateDeliverable: (id: string, updates: Partial<Deliverable>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  approveApplication: (campaignId: string) => void;
  rejectApplication: (campaignId: string, feedback?: string) => void;
  updateCampaignStatus: (campaignId: string, status: Campaign['status']) => void;
}

const STORAGE_KEYS = {
  USER: '@user_profile',
  WALLET: '@wallet',
  CAMPAIGNS: '@campaigns',
  SAVED_CAMPAIGNS: '@saved_campaigns',
  NOTIFICATIONS: '@notifications',
  DARK_MODE: '@dark_mode',
  ACTIVE_CAMPAIGNS: '@active_campaigns',
  APPLICATIONS: '@applications',
};

// Default mock data (fallback)
const defaultUser: UserProfile = {
  id: '1',
  name: 'Rahul Kumar',
  username: '@rahulcreates',
  email: 'rahul@example.com',
  bio: 'Creative content creator',
  isVerified: true,
  kycVerified: true,
  isPro: true,
  referralCode: 'RAHUL2024',
  referralCount: 12,
  referralEarnings: 6000,
  categories: ['Fashion', 'Lifestyle'],
  socialLinks: [],
  preferences: {
    availableForCampaigns: true,
    showProfilePublicly: true,
    emailNotifications: false,
  },
};

const defaultWallet: WalletData = {
  balance: 0,
  pending: 0,
  withdrawn: 0,
  monthlyChange: 0,
  lifetimeEarnings: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // State
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [wallet, setWallet] = useState<WalletData>(defaultWallet);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [savedCampaigns, setSavedCampaigns] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<ActiveCampaign[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Loading states
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);

  // Pagination
  const [campaignsPage, setCampaignsPage] = useState(0);
  const [campaignsHasMore, setCampaignsHasMore] = useState(true);
  const [campaignsTotal, setCampaignsTotal] = useState(0);
  const [campaignFilters, setCampaignFilters] = useState<CampaignFilters>({});

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
    refreshData();
  }, []);

  /**
   * Load cached data from AsyncStorage
   */
  const loadCachedData = useCallback(async () => {
    try {
      // Load saved campaigns
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_CAMPAIGNS);
      if (saved) setSavedCampaigns(JSON.parse(saved));

      // Load dark mode
      const dark = await AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (dark) setDarkMode(JSON.parse(dark));

      // Load cached campaigns if using API
      if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
        const cached = await cacheUtils.get<Campaign[]>('campaigns');
        if (cached) setCampaigns(cached);
      }

      // Load cached wallet
      if (featureFlags.isEnabled('USE_API_WALLET')) {
        const cached = await cacheUtils.get<WalletData>('wallet');
        if (cached) setWallet(cached);
      }

      // Load cached notifications
      if (featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
        const cached = await cacheUtils.get<Notification[]>('notifications');
        if (cached) setNotifications(cached);
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch campaigns from API
   */
  const fetchCampaigns = useCallback(
    async (filters: CampaignFilters = {}, reset: boolean = false) => {
      if (loadingCampaigns) return;

      setLoadingCampaigns(true);
      setError(null);
      setCampaignFilters(filters);

      try {
        if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
          const page = reset ? 0 : campaignsPage;
          const result = await campaignService.getCampaigns(filters, page, 20);

          const adapted = adaptCampaignsResponse(result);
          const adaptedCampaigns = adapted.campaigns.map((c) => ({
            ...c,
            isSaved: savedCampaigns.includes(c.id),
          }));

          if (reset) {
            setCampaigns(adaptedCampaigns);
            setCampaignsPage(1);
          } else {
            setCampaigns((prev) => [...prev, ...adaptedCampaigns]);
            setCampaignsPage((prev) => prev + 1);
          }

          setCampaignsHasMore(adapted.hasMore);
          setCampaignsTotal(adapted.total);

          // Cache campaigns
          await cacheUtils.set('campaigns', adaptedCampaigns);
          await AsyncStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(adaptedCampaigns));
        } else {
          // Use mock data (fallback)
          const mockCampaigns: Campaign[] = [];
          setCampaigns(mockCampaigns);
        }
      } catch (err) {
        const apiError = handleAPIError(err);
        setError(apiError.message);

        // Load from cache on error
        if (isNetworkError(apiError)) {
          const cached = await cacheUtils.get<Campaign[]>('campaigns');
          if (cached) {
            setCampaigns(cached);
          }
        }
      } finally {
        setLoadingCampaigns(false);
      }
    },
    [loadingCampaigns, campaignsPage, savedCampaigns]
  );

  /**
   * Load more campaigns (pagination)
   */
  const loadMoreCampaigns = useCallback(async () => {
    if (!campaignsHasMore || loadingCampaigns) return;
    await fetchCampaigns(campaignFilters, false);
  }, [campaignsHasMore, loadingCampaigns, campaignFilters, fetchCampaigns]);

  /**
   * Get campaign by ID
   */
  const getCampaignById = useCallback(
    (id: string) => {
      return campaigns.find((c) => c.id === id);
    },
    [campaigns]
  );

  /**
   * Save campaign (optimistic update)
   */
  const saveCampaign = useCallback(
    async (campaignId: string) => {
      // Optimistic update
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, isSaved: true } : c))
      );
      setSavedCampaigns((prev) => [...prev, campaignId]);
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_CAMPAIGNS, JSON.stringify([...savedCampaigns, campaignId]));

      try {
        if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
          await campaignService.saveCampaign(Number(campaignId));
        }
      } catch (err) {
        // Revert on error
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaignId ? { ...c, isSaved: false } : c))
        );
        setSavedCampaigns((prev) => prev.filter((id) => id !== campaignId));
        const apiError = handleAPIError(err);
        setError(apiError.message);
        throw apiError;
      }
    },
    [savedCampaigns]
  );

  /**
   * Unsave campaign (optimistic update)
   */
  const unsaveCampaign = useCallback(
    async (campaignId: string) => {
      // Optimistic update
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, isSaved: false } : c))
      );
      setSavedCampaigns((prev) => prev.filter((id) => id !== campaignId));
      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_CAMPAIGNS,
        JSON.stringify(savedCampaigns.filter((id) => id !== campaignId))
      );

      try {
        if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
          await campaignService.unsaveCampaign(Number(campaignId));
        }
      } catch (err) {
        // Revert on error
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaignId ? { ...c, isSaved: true } : c))
        );
        setSavedCampaigns((prev) => [...prev, campaignId]);
        const apiError = handleAPIError(err);
        setError(apiError.message);
        throw apiError;
      }
    },
    [savedCampaigns]
  );

  /**
   * Check if campaign is saved
   */
  const isCampaignSaved = useCallback(
    (campaignId: string) => savedCampaigns.includes(campaignId),
    [savedCampaigns]
  );

  /**
   * Submit application
   */
  const applyCampaign = useCallback(
    async (campaignId: string, applicationData: ApplicationFormData) => {
      try {
        if (featureFlags.isEnabled('USE_API_APPLICATIONS')) {
          const request: ApplicationRequest = {
            campaignId: Number(campaignId),
            pitchText: applicationData.pitch,
            availability: applicationData.expectedTimeline,
            expectedTimeline: applicationData.expectedTimeline,
          };

          const apiApplication = await applicationService.submitApplication(request);
          const adapted = adaptApplication(apiApplication);

          setApplications((prev) => [adapted, ...prev]);

          // Update campaign status
          setCampaigns((prev) =>
            prev.map((c) =>
              c.id === campaignId
                ? { ...c, status: 'applied' as const, applicants: (c.applicants || 0) + 1 }
                : c
            )
          );

          // Add notification
          addNotification({
            type: 'application',
            title: 'Application Submitted',
            description: `Your application is under review`,
            time: 'Just now',
            read: false,
          });
        } else {
          // Mock application
          const mockApplication: CampaignApplication = {
            id: Date.now().toString(),
            campaignId,
            creatorId: user.id,
            pitch: applicationData.pitch,
            expectedTimeline: applicationData.expectedTimeline,
            extraDetails: applicationData.extraDetails,
            status: 'pending_review',
            submittedAt: new Date().toISOString(),
          };
          setApplications((prev) => [mockApplication, ...prev]);
        }
      } catch (err) {
        const apiError = handleAPIError(err);
        setError(apiError.message);
        throw apiError;
      }
    },
    [user.id]
  );

  /**
   * Get application by campaign ID
   */
  const getApplication = useCallback(
    (campaignId: string) => {
      return applications.find((a) => a.campaignId === campaignId);
    },
    [applications]
  );

  /**
   * Withdraw application
   */
  const withdrawApplication = useCallback(async (applicationId: string) => {
      try {
        if (featureFlags.isEnabled('USE_API_APPLICATIONS')) {
          await applicationService.withdrawApplication(Number(applicationId));
        }
      setApplications((prev) => prev.filter((a) => a.id !== applicationId));
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
      throw apiError;
    }
  }, []);

  /**
   * Fetch applications
   */
  const fetchApplications = useCallback(async () => {
    if (loadingApplications) return;

    setLoadingApplications(true);
    try {
      if (featureFlags.isEnabled('USE_API_APPLICATIONS')) {
        const result = await applicationService.getApplications(0, 100);
        const adapted = result.items.map(adaptApplication);
        setApplications(adapted);
      }
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    } finally {
      setLoadingApplications(false);
    }
  }, [loadingApplications]);

  /**
   * Fetch wallet
   */
  const fetchWallet = useCallback(async () => {
    if (loadingWallet) return;

    setLoadingWallet(true);
    try {
      if (featureFlags.isEnabled('USE_API_WALLET')) {
        const apiWallet = await walletService.getWallet();
        const adapted = adaptWallet(apiWallet);
        setWallet(adapted);
        await cacheUtils.set('wallet', adapted);
        await AsyncStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(adapted));
      }
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);

      // Load from cache
      if (isNetworkError(apiError)) {
        const cached = await cacheUtils.get<WalletData>('wallet');
        if (cached) setWallet(cached);
      }
    } finally {
      setLoadingWallet(false);
    }
  }, [loadingWallet]);

  /**
   * Fetch transactions
   */
  const fetchTransactions = useCallback(async () => {
    if (loadingTransactions) return;

    setLoadingTransactions(true);
    try {
      if (featureFlags.isEnabled('USE_API_WALLET')) {
        const result = await walletService.getTransactions(0, 100);
        const adapted = result.items.map(adaptTransaction);
        setTransactions(adapted);
      }
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    } finally {
      setLoadingTransactions(false);
    }
  }, [loadingTransactions]);

  /**
   * Request withdrawal
   */
  const requestWithdrawal = useCallback(
    async (amount: number, bankAccountId: string) => {
      try {
        if (featureFlags.isEnabled('USE_API_WALLET')) {
          await walletService.withdrawFunds({
            amount,
            bankAccountId: bankAccountId,
          });

          // Update wallet optimistically
          setWallet((prev) => ({
            ...prev,
            balance: prev.balance - amount,
            withdrawn: prev.withdrawn + amount,
          }));

          // Refresh wallet to get accurate data
          await fetchWallet();
        } else {
          // Mock withdrawal
          setWallet((prev) => ({
            ...prev,
            balance: prev.balance - amount,
            withdrawn: prev.withdrawn + amount,
          }));
        }
      } catch (err) {
        const apiError = handleAPIError(err);
        setError(apiError.message);
        throw apiError;
      }
    },
    [fetchWallet]
  );

  /**
   * Update wallet (local only, for mock mode)
   */
  const updateWallet = useCallback(async (data: Partial<WalletData>) => {
    const updated = { ...wallet, ...data };
    setWallet(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(updated));
  }, [wallet]);

  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(async () => {
    if (loadingNotifications) return;

    setLoadingNotifications(true);
    try {
      if (featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
        const result = await notificationService.getNotifications(0, 100);
        const adapted = result.items.map(adaptNotification);
        setNotifications(adapted);
        await cacheUtils.set('notifications', adapted);
      }
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);

      // Load from cache
      if (isNetworkError(apiError)) {
        const cached = await cacheUtils.get<Notification[]>('notifications');
        if (cached) setNotifications(cached);
      }
    } finally {
      setLoadingNotifications(false);
    }
  }, [loadingNotifications]);

  /**
   * Mark notification as read
   */
  const markNotificationRead = useCallback(
    async (id: string) => {
      // Optimistic update
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

      try {
        if (featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
          await notificationService.markAsRead(id);
        }
      } catch (err) {
        // Revert on error
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
        console.error('Error marking notification read:', err);
      }
    },
    []
  );

  /**
   * Mark all notifications as read
   */
  const markAllNotificationsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      if (featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
        await notificationService.markAllRead();
      }
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  }, []);

  /**
   * Add notification (local only)
   */
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  /**
   * Fetch conversations
   */
  const fetchConversations = useCallback(async () => {
    if (loadingChats) return;

    setLoadingChats(true);
    try {
      if (featureFlags.isEnabled('USE_API_MESSAGING')) {
        const apiConversations = await messagingService.getConversations();
        const adaptedChats = apiConversations.map((conv) =>
          adaptConversationToChatPreview(conv, user.id)
        );
        setChats(adaptedChats);
      }
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    } finally {
      setLoadingChats(false);
    }
  }, [loadingChats, user.id]);

  /**
   * Send message
   */
  const sendMessage = useCallback(
    async (chatId: string, text: string) => {
      try {
        if (featureFlags.isEnabled('USE_API_MESSAGING')) {
          const apiMessage = await messagingService.sendMessage(chatId, text);
          const adapted = adaptMessage(apiMessage, user.id);

          // Update conversation
          setConversations((prev) => {
            const conv = prev.find((c) => c.chatId === chatId);
            if (conv) {
              return prev.map((c) =>
                c.chatId === chatId
                  ? { ...c, messages: [...(c.messages || []), adapted] }
                  : c
              );
            }
            return prev;
          });

          // Update chat preview
          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId
                ? {
                    ...c,
                    lastMessage: text,
                    time: 'Just now',
                  }
                : c
            )
          );
        } else {
          // Mock message
          const mockMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            time: new Date().toLocaleTimeString(),
            status: 'sent',
            chatId,
          };

          setConversations((prev) => {
            const conv = prev.find((c) => c.chatId === chatId);
            if (conv) {
              return prev.map((c) =>
                c.chatId === chatId
                  ? { ...c, messages: [...(c.messages || []), mockMessage] }
                  : c
              );
            }
            return [...prev, { chatId, messages: [mockMessage] }];
          });
        }
      } catch (err) {
        const apiError = handleAPIError(err);
        setError(apiError.message);
        throw apiError;
      }
    },
    [user.id]
  );

  /**
   * Get conversation messages
   */
  const getConversation = useCallback(
    (chatId: string) => {
      const conversation = conversations.find((c) => c.chatId === chatId);
      return conversation?.messages || [];
    },
    [conversations]
  );

  /**
   * Mark chat as read
   */
  const markChatRead = useCallback(
    async (chatId: string) => {
      // Optimistic update
      setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, unread: 0 } : c)));

      try {
        if (featureFlags.isEnabled('USE_API_MESSAGING')) {
          await messagingService.markConversationRead(chatId);
        }
      } catch (err) {
        console.error('Error marking chat read:', err);
      }
    },
    []
  );

  /**
   * Submit deliverable
   */
  const submitDeliverable = useCallback(
    async (
      activeCampaignId: string,
      deliverableId: string,
      file: { name: string; type: 'video' | 'image'; uri: string }
    ) => {
      try {
        if (featureFlags.isEnabled('USE_API_DELIVERABLES')) {
          // Find application ID from active campaign
          const activeCampaign = activeCampaigns.find((ac) => ac.id === activeCampaignId);
          if (!activeCampaign) throw new Error('Active campaign not found');

          // Use campaignId as applicationId for now (can be enhanced later)
          await deliverableService.submitDeliverable(
            activeCampaign.campaignId || '',
            deliverableId,
            {
              file: {
                uri: file.uri,
                type: file.type === 'video' ? 'video/mp4' : 'image/jpeg',
                name: file.name,
              },
            }
          );

          // Update deliverable status
          setDeliverables((prev) =>
            prev.map((d) =>
              d.id === deliverableId ? { ...d, status: 'submitted' as const } : d
            )
          );
        } else {
          // Mock submit
          setDeliverables((prev) =>
            prev.map((d) =>
              d.id === deliverableId ? { ...d, status: 'submitted' as const } : d
            )
          );
        }
      } catch (err) {
        const apiError = handleAPIError(err);
        setError(apiError.message);
        throw apiError;
      }
    },
    [activeCampaigns]
  );

  /**
   * Approve deliverable
   */
  const approveDeliverable = useCallback(
    async (activeCampaignId: string, deliverableId: string) => {
      setDeliverables((prev) =>
        prev.map((d) => (d.id === deliverableId ? { ...d, status: 'approved' as const } : d))
      );
    },
    []
  );

  /**
   * Request deliverable changes
   */
  const requestDeliverableChanges = useCallback(
    async (activeCampaignId: string, deliverableId: string, feedback: string) => {
      setDeliverables((prev) =>
        prev.map((d) =>
          d.id === deliverableId ? { ...d, status: 'changes_requested' as const } : d
        )
      );
    },
    []
  );

  /**
   * Mark deliverable as posted
   */
  const markDeliverablePosted = useCallback(
    async (activeCampaignId: string, deliverableId: string, postUrl?: string) => {
      setDeliverables((prev) =>
        prev.map((d) => (d.id === deliverableId ? { ...d, status: 'posted' as const } : d))
      );
    },
    []
  );

  /**
   * Update active campaign
   */
  const updateActiveCampaign = useCallback((id: string, updates: Partial<ActiveCampaign>) => {
    setActiveCampaigns((prev) =>
      prev.map((ac) => (ac.id === id ? { ...ac, ...updates } : ac))
    );
  }, []);

  /**
   * Complete campaign
   */
  const completeCampaign = useCallback(async (activeCampaignId: string) => {
    setActiveCampaigns((prev) =>
      prev.map((ac) => (ac.id === activeCampaignId ? { ...ac, status: 'completed' } : ac))
    );
  }, []);

  /**
   * Process payment
   */
  const processPayment = useCallback(async (activeCampaignId: string) => {
    // This would trigger payment processing
    // For now, just update the campaign status
    setActiveCampaigns((prev) =>
      prev.map((ac) => (ac.id === activeCampaignId ? { ...ac, paymentStatus: 'paid' } : ac))
    );
  }, []);

  /**
   * Update user profile
   */
  const updateUser = useCallback(
    async (updates: Partial<UserProfile>) => {
      const updated = { ...user, ...updates };
      setUser(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));

      try {
        if (featureFlags.isEnabled('USE_API_PROFILE')) {
          await profileService.updateProfile({
            fullName: updates.name,
            bio: updates.bio,
          });
        }
      } catch (err) {
        console.error('Error updating profile:', err);
      }
    },
    [user]
  );

  /**
   * Toggle dark mode
   */
  const toggleDarkMode = useCallback(async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    await AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(newValue));
  }, [darkMode]);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchCampaigns({}, true),
        fetchApplications(),
        fetchWallet(),
        fetchTransactions(),
        fetchNotifications(),
        fetchConversations(),
      ]);
    } catch (err) {
      const apiError = handleAPIError(err);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCampaigns, fetchApplications, fetchWallet, fetchTransactions, fetchNotifications, fetchConversations]);

  /**
   * Copy referral code
   */
  const copyReferralCode = useCallback(async () => {
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(user.referralCode || '');
      return true;
    } catch (error) {
      console.error('Error copying referral code:', error);
      return false;
    }
  }, [user.referralCode]);

  // Legacy methods for backward compatibility
  const addDeliverable = useCallback((deliverable: Omit<Deliverable, 'id'>) => {
    const newDeliverable: Deliverable = {
      ...deliverable,
      id: Date.now().toString(),
    };
    setDeliverables((prev) => [...prev, newDeliverable]);
  }, []);

  const updateDeliverable = useCallback((id: string, updates: Partial<Deliverable>) => {
    setDeliverables((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  }, []);

  const approveApplication = useCallback((campaignId: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.campaignId === campaignId ? { ...a, status: 'approved' as const } : a
      )
    );
  }, []);

  const rejectApplication = useCallback((campaignId: string, feedback?: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.campaignId === campaignId
          ? { ...a, status: 'rejected' as const, brandFeedback: feedback }
          : a
      )
    );
  }, []);

  const updateCampaignStatus = useCallback(
    (campaignId: string, status: Campaign['status']) => {
      setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? { ...c, status } : c)));
    },
    []
  );

  // Calculate unread notifications
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const value: AppContextType = {
    // Data
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
    error,

    // Loading states
    loadingCampaigns,
    loadingApplications,
    loadingWallet,
    loadingTransactions,
    loadingNotifications,
    loadingChats,

    // Pagination
    campaignsHasMore,
    campaignsTotal,

    // Actions
    fetchCampaigns,
    loadMoreCampaigns,
    getCampaignById,
    saveCampaign,
    unsaveCampaign,
    isCampaignSaved,
    applyCampaign,
    getApplication,
    withdrawApplication,
    fetchApplications,
    fetchWallet,
    fetchTransactions,
    requestWithdrawal,
    updateWallet,
    markNotificationRead,
    markAllNotificationsRead,
    addNotification,
    fetchNotifications,
    sendMessage,
    getConversation,
    markChatRead,
    fetchConversations,
    submitDeliverable,
    approveDeliverable,
    requestDeliverableChanges,
    markDeliverablePosted,
    updateActiveCampaign,
    completeCampaign,
    processPayment,
    updateUser,
    toggleDarkMode,
    refreshData,
    copyReferralCode,

    // Legacy methods
    addDeliverable,
    updateDeliverable,
    addTransaction,
    approveApplication,
    rejectApplication,
    updateCampaignStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

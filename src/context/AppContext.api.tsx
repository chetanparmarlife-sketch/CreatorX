/**
 * AppContext with Real API Integration
 * Migrated from mock data to use Spring Boot backend
 * Maintains backward compatibility with existing screens
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react';
import { AppState, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { featureFlags, POLL_INTERVAL_MS } from '@/src/config/featureFlags';
import {
  campaignService,
  applicationService,
  walletService,
  messagingService,
  notificationService,
  profileService,
  deliverableService,
  socialConnectService,
} from '@/src/api/services';
import {
  adaptCampaignsResponse,
  adaptCampaign,
  adaptApplication,
  adaptNotification,
  adaptConversationToChatPreview,
  adaptMessage,
  adaptConversation,
} from '@/src/api/adapters';
import { handleAPIError, isNetworkError, normalizeApiError } from '@/src/api/errors';
import { API_BASE_URL_READY } from '@/src/config/env';
import { webSocketService, ThreadEvent, MessageEvent } from '@/src/services/WebSocketService';
import { cacheUtils } from '@/src/api/utils/cache';
import { clearApiCacheKeys } from '@/src/storage/cleanup';
import { APP_OWNED_KEYS } from '@/src/storage/schema';
import { safeParseJSON } from '@/src/storage/serialization';
import {
  Campaign,
  ChatPreview,
  Notification,
  Deliverable,
  Message,
  Conversation,
  UserProfile,
  ActiveCampaign,
  CampaignApplication,
} from '@/src/types';
import { CampaignFilters } from '@/src/api/services/campaignService';
import { ApplicationRequest } from '@/src/api/services/applicationService';
import { TransactionDTO, WalletDTO, WithdrawalDTO } from '@/src/api/services/walletService';
import { CreatorSocialAccount, SocialProvider } from '@/src/api/services/socialConnectService';
import { getSession } from '@/src/lib/supabase';
import { getSecureItem } from '@/src/lib/secureStore';

interface ApplicationFormData {
  pitch: string;
  expectedTimeline: string;
  extraDetails?: string;
}

interface AppContextType {
  // Data
  user: UserProfile;
  wallet: WalletDTO | null;
  campaigns: Campaign[];
  applications: CampaignApplication[];
  deliverables: Deliverable[];
  transactions: TransactionDTO[];
  withdrawals: WithdrawalDTO[];
  chats: ChatPreview[];
  conversations: Conversation[];
  messagesByConversation: Record<string, Message[]>;
  savedCampaigns: string[];
  notifications: Notification[];
  unreadNotifications: number;
  unreadNotificationCount: number;
  notificationsHasMore: boolean;
  notificationsPage: number;
  socialAccounts: CreatorSocialAccount[];
  socialAccountsLoading: boolean;
  socialAccountsError: string | null;
  darkMode: boolean;
  isLoading: boolean;
  activeCampaigns: ActiveCampaign[];
  error: string | null;
  notificationsError: string | null;
  walletError: string | null;
  transactionsError: string | null;
  withdrawalsError: string | null;
  messagingError: string | null;
  transactionsHasMore: boolean;
  transactionsPage: number;
  withdrawalsHasMore: boolean;
  withdrawalsPage: number;

  // Loading states
  loadingCampaigns: boolean;
  loadingApplications: boolean;
  walletLoading: boolean;
  transactionsLoading: boolean;
  withdrawalsLoading: boolean;
  loadingNotifications: boolean;
  loadingChats: boolean;

  // Campaign pagination
  campaignsHasMore: boolean;
  campaignsTotal: number;

  // Actions - Campaigns
  fetchCampaigns: (filters?: CampaignFilters, reset?: boolean) => Promise<void>;
  loadMoreCampaigns: () => Promise<void>;
  getCampaignById: (id: string) => Campaign | undefined;
  fetchCampaignById: (id: string) => Promise<Campaign | null>;
  saveCampaign: (campaignId: string) => Promise<void>;
  unsaveCampaign: (campaignId: string) => Promise<void>;
  isCampaignSaved: (campaignId: string) => boolean;

  // Actions - Applications
  applyCampaign: (campaignId: string, applicationData: ApplicationFormData) => Promise<void>;
  getApplication: (campaignId: string) => CampaignApplication | undefined;
  withdrawApplication: (applicationId: string) => Promise<void>;
  fetchApplications: () => Promise<void>;

  // Actions - Wallet
  fetchWalletSummary: () => Promise<void>;
  fetchTransactions: (params?: { page?: number; size?: number; refresh?: boolean }) => Promise<void>;
  fetchWithdrawals: (params?: { page?: number; size?: number; refresh?: boolean }) => Promise<void>;
  refreshWalletAll: () => Promise<void>;

  // Actions - Notifications
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  fetchNotifications: (params?: { page?: number; size?: number; refresh?: boolean }) => Promise<void>;
  fetchUnreadNotificationCount: () => Promise<void>;

  // Actions - Social Connect (metadata only; tokens stay backend-only)
  fetchSocialAccounts: () => Promise<void>;
  refreshSocialAccount: (provider: SocialProvider) => Promise<void>;
  disconnectSocialAccount: (provider: SocialProvider) => Promise<void>;
  getSocialConnectUrl: (provider: SocialProvider) => string | null;

  // Actions - Messaging
  sendMessage: (chatId: string, text: string) => Promise<void>;
  getConversation: (chatId: string) => Message[];
  markChatRead: (chatId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  loadMessages: (conversationId: string, page?: number, size?: number) => Promise<void>;
  startMessagesPolling: () => void;
  stopMessagesPolling: () => void;
  startConversationPolling: (conversationId: string) => void;
  stopConversationPolling: () => void;

  // Actions - Deliverables
  submitDeliverable: (
    activeCampaignId: string,
    deliverableId: string,
    file: { name: string; type: 'video' | 'image'; uri: string },
    description?: string
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
  resetAppState: () => Promise<void>;

  // Actions - Deliverables (legacy)
  addDeliverable: (deliverable: Omit<Deliverable, 'id'>) => void;
  updateDeliverable: (id: string, updates: Partial<Deliverable>) => void;
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
  SOCIAL_ACCOUNTS: '@creator_social_accounts',
  DARK_MODE: '@dark_mode',
  ACTIVE_CAMPAIGNS: '@active_campaigns',
  APPLICATIONS: '@applications',
  ACCESS_TOKEN: '@access_token',
};

const getMessageTimestamp = (message: Message): number | null => {
  if (!message.createdAt) return null;
  const timestamp = Date.parse(message.createdAt);
  return Number.isNaN(timestamp) ? null : timestamp;
};

const normalizeMessages = (messages: Message[]): Message[] => {
  const byId = new Map<string, { message: Message; index: number }>();

  messages.forEach((message, index) => {
    const existing = byId.get(message.id);
    if (!existing) {
      byId.set(message.id, { message, index });
      return;
    }

    const existingTs = getMessageTimestamp(existing.message);
    const incomingTs = getMessageTimestamp(message);

    if (incomingTs !== null && (existingTs === null || incomingTs > existingTs)) {
      byId.set(message.id, { message, index: existing.index });
    }
  });

  const items = Array.from(byId.values());
  items.sort((a, b) => {
    const aTs = getMessageTimestamp(a.message);
    const bTs = getMessageTimestamp(b.message);

    if (aTs !== null && bTs !== null) {
      if (aTs !== bTs) return aTs - bTs;
      return a.index - b.index;
    }

    if (aTs !== null) return -1;
    if (bTs !== null) return 1;
    return a.index - b.index;
  });

  return items.map((item) => item.message);
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

const MESSAGE_POLL_INTERVAL = POLL_INTERVAL_MS;

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // State
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [wallet, setWallet] = useState<WalletDTO | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<CampaignApplication[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalDTO[]>([]);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, Message[]>>({});
  const [savedCampaigns, setSavedCampaigns] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState<ActiveCampaign[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [withdrawalsError, setWithdrawalsError] = useState<string | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<CreatorSocialAccount[]>([]);
  const [socialAccountsLoading, setSocialAccountsLoading] = useState(false);
  const [socialAccountsError, setSocialAccountsError] = useState<string | null>(null);
  const [messagingError, setMessagingError] = useState<string | null>(null);
  const [transactionsPage, setTransactionsPage] = useState(0);
  const [transactionsHasMore, setTransactionsHasMore] = useState(true);
  const [withdrawalsPage, setWithdrawalsPage] = useState(0);
  const [withdrawalsHasMore, setWithdrawalsHasMore] = useState(true);

  // Loading states
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const loadingWallet = walletLoading;

  // Pagination
  const [campaignsPage, setCampaignsPage] = useState(0);
  const [campaignsHasMore, setCampaignsHasMore] = useState(true);
  const [campaignsTotal, setCampaignsTotal] = useState(0);
  const [campaignFilters, setCampaignFilters] = useState<CampaignFilters>({});
  const [notificationsPage, setNotificationsPage] = useState(0);
  const [notificationsHasMore, setNotificationsHasMore] = useState(true);
  const isMountedRef = useRef(true);
  const conversationsPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const conversationsPollInFlightRef = useRef(false);
  const chatListActiveRef = useRef(false);
  const activeConversationRef = useRef<string | null>(null);
  const messagesPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesPollInFlightRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const lastConversationsPollAtRef = useRef<number | null>(null);
  const lastMessagesPollAtRef = useRef<number | null>(null);
  const wsThreadsUnsubRef = useRef<(() => void) | null>(null);
  const wsMessagesUnsubRef = useRef<(() => void) | null>(null);
  const wsFailedRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const runIfMounted = useCallback((fn: () => void) => {
    if (isMountedRef.current) {
      fn();
    }
  }, []);

  const resolveAuthToken = useCallback(async (): Promise<string | null> => {
    const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (storedToken) return storedToken;
    const session = await getSession().catch(() => null);
    return session?.access_token ?? null;
  }, []);

  const resolveMessagingToken = useCallback(async (): Promise<string | null> => {
    const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (storedToken) return storedToken;
    const session = await getSession().catch(() => null);
    return session?.access_token ?? null;
  }, []);

  const isWebSocketEnabled = useCallback(() => {
    return (
      featureFlags.isEnabled('USE_WS_MESSAGING') ||
      featureFlags.isEnabled('USE_WS_MESSAGES')
    );
  }, []);

  const canStartMessagingPolling = useCallback(async () => {
    if (!featureFlags.isEnabled('USE_API_MESSAGING_POLLING')) {
      return false;
    }
    if (!featureFlags.isEnabled('USE_POLLING_MESSAGES')) {
      return false;
    }
    if (!featureFlags.isEnabled('USE_API_MESSAGING')) {
      return false;
    }
    if (isWebSocketEnabled() && !wsFailedRef.current && webSocketService.connected) {
      return false;
    }
    if (!API_BASE_URL_READY) {
      runIfMounted(() => setMessagingError('Messaging unavailable in degraded mode.'));
      return false;
    }
    const token = await resolveMessagingToken();
    if (!token) {
      runIfMounted(() => setMessagingError('Login required to view messages.'));
      return false;
    }

    runIfMounted(() => setMessagingError(null));
    return true;
  }, [isWebSocketEnabled, resolveMessagingToken, runIfMounted]);

  const canStartWebSocketMessaging = useCallback(async () => {
    if (!isWebSocketEnabled()) {
      return false;
    }
    if (!featureFlags.isEnabled('USE_API_MESSAGING')) {
      return false;
    }
    if (!API_BASE_URL_READY) {
      runIfMounted(() => setMessagingError('Messaging unavailable in degraded mode.'));
      return false;
    }
    const token = await resolveMessagingToken();
    if (!token) {
      runIfMounted(() => setMessagingError('Login required to view messages.'));
      return false;
    }
    runIfMounted(() => setMessagingError(null));
    return true;
  }, [isWebSocketEnabled, resolveMessagingToken, runIfMounted]);

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, []);

  /**
   * Load cached data from AsyncStorage
   */
  const loadCachedData = useCallback(async () => {
    try {
      // Load saved campaigns
      const saved = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_CAMPAIGNS);
      if (saved && isMountedRef.current) setSavedCampaigns(safeParseJSON<string[]>(saved, []));

      // Load dark mode
      const dark = await AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (dark && isMountedRef.current) setDarkMode(safeParseJSON<boolean>(dark, true));

      // Load cached campaigns if using API
      if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
        const cached = await cacheUtils.get<Campaign[]>('campaigns');
        if (cached && isMountedRef.current) setCampaigns(cached);
      }

      // Load cached wallet
      if (featureFlags.isEnabled('USE_API_WALLET')) {
        const cached = await cacheUtils.get<WalletDTO>('wallet');
        if (cached && isMountedRef.current) setWallet(cached);
      }

      // Load cached notifications
      if (featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
        const cached = await cacheUtils.get<Notification[]>('notifications');
        if (cached && isMountedRef.current) setNotifications(cached);
      }

      // Load cached social accounts metadata (tokens are never stored on device)
      const socialRaw = await AsyncStorage.getItem(STORAGE_KEYS.SOCIAL_ACCOUNTS);
      if (socialRaw && isMountedRef.current) {
        setSocialAccounts(safeParseJSON<CreatorSocialAccount[]>(socialRaw, []));
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  /**
   * Fetch campaigns from API
   */
  const fetchCampaigns = useCallback(
    async (filters: CampaignFilters = {}, reset: boolean = false) => {
      if (loadingCampaigns) return;

      if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
        const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!storedToken) {
          const session = await getSession().catch(() => null);
          if (!session?.access_token) {
            if (__DEV__) {
              console.log('[Campaigns] Skipping fetch until auth token is ready.');
            }
            runIfMounted(() => setError('Login required to load campaigns.'));
            return;
          }
        }
      }

      runIfMounted(() => {
        setLoadingCampaigns(true);
        setError(null);
        setCampaignFilters(filters);
      });

      try {
        if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
          const page = reset ? 0 : campaignsPage;
          const result = await campaignService.getCampaigns(filters, page, 20);

          const adapted = adaptCampaignsResponse(result);
          const adaptedCampaigns = adapted.campaigns.map((c) => ({
            ...c,
            userState: savedCampaigns.includes(c.id)
              ? 'SAVED'
              : c.userState,
          }));

          if (reset) {
            runIfMounted(() => {
              setCampaigns(adaptedCampaigns);
              setCampaignsPage(1);
            });
          } else {
            runIfMounted(() => {
              setCampaigns((prev) => [...prev, ...adaptedCampaigns]);
              setCampaignsPage((prev) => prev + 1);
            });
          }

          runIfMounted(() => {
            setCampaignsHasMore(adapted.hasMore);
            setCampaignsTotal(adapted.total);
          });

          // Cache campaigns
          await cacheUtils.set('campaigns', adaptedCampaigns);
          await AsyncStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(adaptedCampaigns));
        } else {
          // Use mock data (fallback)
          const mockCampaigns: Campaign[] = [];
          runIfMounted(() => setCampaigns(mockCampaigns));
        }
      } catch (err) {
        const apiError = handleAPIError(err);
        runIfMounted(() => setError(apiError.message));

        // Load from cache on error
        if (isNetworkError(apiError)) {
          const cached = await cacheUtils.get<Campaign[]>('campaigns');
          if (cached) {
            runIfMounted(() => setCampaigns(cached));
          }
        }
      } finally {
        runIfMounted(() => setLoadingCampaigns(false));
      }
    },
    [loadingCampaigns, campaignsPage, savedCampaigns, runIfMounted]
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
   * Fetch campaign by ID from API and merge into state
   */
  const fetchCampaignById = useCallback(
    async (id: string): Promise<Campaign | null> => {
      if (!id) return null;

      if (!API_BASE_URL_READY) {
        runIfMounted(() => setError('Campaigns unavailable in degraded mode.'));
        return null;
      }

      if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
        const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!storedToken) {
          const session = await getSession().catch(() => null);
          if (!session?.access_token) {
            if (__DEV__) {
              console.log('[Campaigns] Skipping fetch until auth token is ready.');
            }
            runIfMounted(() => setError('Login required to load campaign.'));
            return null;
          }
        }
      }

      try {
        if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
          const apiCampaign = await campaignService.getCampaign(id);
          const adapted = adaptCampaign(apiCampaign);
          const withUserState = {
            ...adapted,
            userState: savedCampaigns.includes(adapted.id) ? 'SAVED' : adapted.userState,
          };

          runIfMounted(() => {
            setCampaigns((prev) => {
              const existing = prev.find((c) => c.id === id);
              if (existing) {
                return prev.map((c) => (c.id === id ? withUserState : c));
              }
              return [withUserState, ...prev];
            });
          });

          return withUserState;
        }

        return getCampaignById(id) ?? null;
      } catch (err) {
        const apiError = handleAPIError(err);
        runIfMounted(() => setError(apiError.message));
        return null;
      }
    },
    [getCampaignById, runIfMounted, savedCampaigns]
  );

  /**
   * Save campaign (optimistic update)
   */
  const saveCampaign = useCallback(
    async (campaignId: string) => {
      // Optimistic update
      setCampaigns((prev) =>
        prev.map((c) =>
          c.id === campaignId ? { ...c, userState: 'SAVED' } : c
        )
      );
      setSavedCampaigns((prev) => [...prev, campaignId]);
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_CAMPAIGNS, JSON.stringify([...savedCampaigns, campaignId]));

      try {
        if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
          await campaignService.saveCampaign(campaignId);
        }
      } catch (err) {
        // Revert on error
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId
              ? { ...c, userState: c.userState === 'SAVED' ? undefined : c.userState }
              : c
          )
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
        prev.map((c) =>
          c.id === campaignId
            ? { ...c, userState: c.userState === 'SAVED' ? undefined : c.userState }
            : c
        )
      );
      setSavedCampaigns((prev) => prev.filter((id) => id !== campaignId));
      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_CAMPAIGNS,
        JSON.stringify(savedCampaigns.filter((id) => id !== campaignId))
      );

      try {
        if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
          await campaignService.unsaveCampaign(campaignId);
        }
      } catch (err) {
        // Revert on error
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === campaignId ? { ...c, userState: 'SAVED' } : c
          )
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
            campaignId,
            pitchText: applicationData.pitch,
            availability: applicationData.expectedTimeline,
            expectedTimeline: applicationData.expectedTimeline,
          };

          const apiApplication = await applicationService.submitApplication(request);
          const adapted = adaptApplication(apiApplication);

          runIfMounted(() => setApplications((prev) => [adapted, ...prev]));

          // Update campaign status
          runIfMounted(() =>
            setCampaigns((prev) =>
              prev.map((c) =>
                c.id === campaignId
                  ? { ...c, userState: 'APPLIED', applicants: (c.applicants || 0) + 1 }
                  : c
              )
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
            status: 'APPLIED',
            submittedAt: new Date().toISOString(),
          };
          runIfMounted(() => setApplications((prev) => [mockApplication, ...prev]));
        }
      } catch (err) {
        const apiError = handleAPIError(err);
        runIfMounted(() => setError(apiError.message));
        throw apiError;
      }
    },
    [user.id, runIfMounted]
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
          await applicationService.withdrawApplication(applicationId);
        }
      runIfMounted(() => setApplications((prev) => prev.filter((a) => a.id !== applicationId)));
    } catch (err) {
      const apiError = handleAPIError(err);
      runIfMounted(() => setError(apiError.message));
      throw apiError;
    }
  }, [runIfMounted]);

  /**
   * Fetch applications
   */
  const fetchApplications = useCallback(async () => {
    if (loadingApplications) return;

    runIfMounted(() => setLoadingApplications(true));
    try {
      if (featureFlags.isEnabled('USE_API_APPLICATIONS')) {
        const result = await applicationService.getApplications(0, 100);
        const adapted = result.items.map(adaptApplication);
        runIfMounted(() => setApplications(adapted));
      }
    } catch (err) {
      const apiError = handleAPIError(err);
      runIfMounted(() => setError(apiError.message));
    } finally {
      runIfMounted(() => setLoadingApplications(false));
    }
  }, [loadingApplications, runIfMounted]);

  /**
   * Fetch wallet summary
   */
  const fetchWalletSummary = useCallback(async () => {
    if (walletLoading) return;

    try {
      if (featureFlags.isEnabled('USE_API_WALLET')) {
        const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!storedToken) {
          const session = await getSession().catch(() => null);
          if (!session?.access_token) {
            if (__DEV__) {
              console.log('[Wallet] Skipping fetch — no auth token yet');
            }
            runIfMounted(() => {
              setError('Login required to load wallet.');
              setWalletError('Login required to load wallet.');
            });
            return;
          }
        }

        runIfMounted(() => {
          setWalletLoading(true);
          setWalletError(null);
        });
        if (__DEV__) {
          console.log('[Wallet] Fetching summary');
        }
        const apiWallet = await walletService.getWallet();
        runIfMounted(() => setWallet(apiWallet));
        await cacheUtils.set('wallet', apiWallet);
        await AsyncStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(apiWallet));
      } else {
        runIfMounted(() => setWallet(null));
      }
    } catch (err) {
      const apiError = handleAPIError(err);
      runIfMounted(() => {
        setError(apiError.message);
        setWalletError(apiError.message);
      });

      if (isNetworkError(apiError)) {
        const cached = await cacheUtils.get<WalletDTO>('wallet');
        if (cached) runIfMounted(() => setWallet(cached));
      }
    } finally {
      runIfMounted(() => setWalletLoading(false));
    }
  }, [walletLoading, runIfMounted]);

  /**
   * Fetch transactions
   */
  const fetchTransactions = useCallback(
    async ({ page = 0, size = 20, refresh = false } = {}) => {
      if (transactionsLoading) return;
      const shouldReplace = refresh || page === 0;

      try {
        if (featureFlags.isEnabled('USE_API_WALLET')) {
          if (shouldReplace) {
            runIfMounted(() => {
              setTransactions([]);
              setTransactionsPage(0);
              setTransactionsHasMore(true);
            });
          }
          const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
          if (!storedToken) {
            const session = await getSession().catch(() => null);
            if (!session?.access_token) {
              if (__DEV__) {
                console.log('[Wallet] Skipping transactions fetch — no auth token yet');
              }
              runIfMounted(() => setError('Login required to load transactions.'));
              runIfMounted(() => setTransactionsError('Login required to load transactions.'));
              return;
            }
          }

          runIfMounted(() => {
            setTransactionsLoading(true);
            setTransactionsError(null);
          });
          if (__DEV__) {
            console.log('[Wallet] Fetching transactions', { page, size });
          }
          const result = await walletService.getTransactions(page, size);
          runIfMounted(() => {
            setTransactions((prev) => {
              if (shouldReplace) {
                return result.items;
              }
              const existingIds = new Set(prev.map((item) => item.id));
              const deduped = result.items.filter((item) => !existingIds.has(item.id));
              return [...prev, ...deduped];
            });
            const loadedCount = page * size + result.items.length;
            const totalCount = Number.isFinite(result.total) ? result.total : null;
            setTransactionsHasMore(
              totalCount !== null ? loadedCount < totalCount && result.items.length > 0 : result.items.length === size
            );
            setTransactionsPage(page);
          });
        } else if (refresh || page === 0) {
          runIfMounted(() => {
            setTransactions([]);
            setTransactionsHasMore(false);
            setTransactionsPage(0);
          });
        }
      } catch (err) {
        const apiError = handleAPIError(err);
        runIfMounted(() => {
          setError(apiError.message);
          setTransactionsError(apiError.message);
        });
      } finally {
        runIfMounted(() => setTransactionsLoading(false));
      }
    },
    [transactionsLoading, runIfMounted]
  );

  /**
   * Fetch withdrawals
   */
  const fetchWithdrawals = useCallback(
    async ({ page = 0, size = 20, refresh = false } = {}) => {
      if (withdrawalsLoading) return;
      const shouldReplace = refresh || page === 0;

      try {
        if (featureFlags.isEnabled('USE_API_WALLET')) {
          if (shouldReplace) {
            runIfMounted(() => {
              setWithdrawals([]);
              setWithdrawalsPage(0);
              setWithdrawalsHasMore(true);
            });
          }
          const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
          if (!storedToken) {
            const session = await getSession().catch(() => null);
            if (!session?.access_token) {
              if (__DEV__) {
                console.log('[Wallet] Skipping withdrawals fetch — no auth token yet');
              }
              runIfMounted(() => setError('Login required to load withdrawals.'));
              runIfMounted(() => setWithdrawalsError('Login required to load withdrawals.'));
              return;
            }
          }

          runIfMounted(() => {
            setWithdrawalsLoading(true);
            setWithdrawalsError(null);
          });
          if (__DEV__) {
            console.log('[Wallet] Fetching withdrawals', { page, size });
          }
          const result = await walletService.getWithdrawals(page, size);
          runIfMounted(() => {
            setWithdrawals((prev) => {
              if (shouldReplace) {
                return result.items;
              }
              const existingIds = new Set(prev.map((item) => item.id));
              const deduped = result.items.filter((item) => !existingIds.has(item.id));
              return [...prev, ...deduped];
            });
            const loadedCount = page * size + result.items.length;
            const totalCount = Number.isFinite(result.total) ? result.total : null;
            setWithdrawalsHasMore(
              totalCount !== null ? loadedCount < totalCount && result.items.length > 0 : result.items.length === size
            );
            setWithdrawalsPage(page);
          });
        } else if (refresh || page === 0) {
          runIfMounted(() => {
            setWithdrawals([]);
            setWithdrawalsHasMore(false);
            setWithdrawalsPage(0);
          });
        }
      } catch (err) {
        const apiError = handleAPIError(err);
        runIfMounted(() => {
          setError(apiError.message);
          setWithdrawalsError(apiError.message);
        });
      } finally {
        runIfMounted(() => setWithdrawalsLoading(false));
      }
    },
    [withdrawalsLoading, runIfMounted]
  );

  const refreshWalletAll = useCallback(async () => {
    await Promise.all([
      fetchWalletSummary(),
      fetchTransactions({ page: 0, size: 20, refresh: true }),
      fetchWithdrawals({ page: 0, size: 20, refresh: true }),
    ]);
  }, [fetchWalletSummary, fetchTransactions, fetchWithdrawals]);

  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(
    async ({ page = 0, size = 20, refresh = false }: { page?: number; size?: number; refresh?: boolean } = {}) => {
      if (loadingNotifications) return;

      const shouldReplace = refresh || page === 0;

      runIfMounted(() => {
        setLoadingNotifications(true);
        setNotificationsError(null);
      });

      try {
        if (featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
          const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
          if (!storedToken) {
            const session = await getSession().catch(() => null);
            if (!session?.access_token) {
              if (__DEV__) {
                console.log('[Notifications] Skipping fetch until auth token is ready.');
              }
              runIfMounted(() => setLoadingNotifications(false));
              runIfMounted(() => setError('Login required to load notifications.'));
              return;
            }
          }

          const result = await notificationService.getNotifications(page, size);
          const adapted = result.items.map(adaptNotification);
          let mergedNotifications: Notification[] = [];
          runIfMounted(() => {
            setNotifications((prev) => {
              if (shouldReplace) {
                mergedNotifications = adapted;
                return adapted;
              }
              const existingIds = new Set(prev.map((item) => item.id));
              const deduped = adapted.filter((item) => !existingIds.has(item.id));
              mergedNotifications = [...prev, ...deduped];
              return mergedNotifications;
            });
            setNotificationsPage(page);
            const loadedCount = page * size + adapted.length;
            const totalCount = Number.isFinite(result.total) ? result.total : null;
            setNotificationsHasMore(
              totalCount !== null ? loadedCount < totalCount && adapted.length > 0 : adapted.length === size
            );
          });
          if (mergedNotifications.length > 0 || shouldReplace) {
            await cacheUtils.set('notifications', mergedNotifications);
          }
        }
        if (!featureFlags.isEnabled('USE_API_NOTIFICATIONS') && shouldReplace) {
          runIfMounted(() => {
            setNotificationsPage(0);
            setNotificationsHasMore(false);
          });
        }
      } catch (err) {
        const apiError = handleAPIError(err);
        runIfMounted(() => {
          setError(apiError.message);
          setNotificationsError(apiError.message);
        });

        // Load from cache
        if (isNetworkError(apiError)) {
          const cached = await cacheUtils.get<Notification[]>('notifications');
          if (cached) runIfMounted(() => setNotifications(cached));
        }
      } finally {
        runIfMounted(() => setLoadingNotifications(false));
      }
    },
    [loadingNotifications, runIfMounted]
  );

  /**
   * Fetch unread notification count
   */
  const fetchUnreadNotificationCount = useCallback(async () => {
    if (!featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
      runIfMounted(() => setUnreadNotificationCount(0));
      return;
    }

    const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!storedToken) {
      const session = await getSession().catch(() => null);
      if (!session?.access_token) {
        if (__DEV__) {
          console.log('[Notifications] Skipping unread count until auth token is ready.');
        }
        runIfMounted(() => setNotificationsError('Login required to load notifications.'));
        return;
      }
    }

    try {
      const result = await notificationService.getUnreadCount();
      runIfMounted(() => {
        setUnreadNotificationCount(result.count);
        setNotificationsError(null);
      });
    } catch (err) {
      const apiError = handleAPIError(err);
      runIfMounted(() => setNotificationsError(apiError.message));
    }
  }, [runIfMounted]);

  // Bootstrap notifications when authenticated
  useEffect(() => {
    if (!featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
      return;
    }
    fetchNotifications({ page: 0, size: 20, refresh: true });
    fetchUnreadNotificationCount();
  }, [fetchNotifications, fetchUnreadNotificationCount]);

  // Refresh unread count on app resume
  useEffect(() => {
    if (!featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
      return;
    }
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        fetchUnreadNotificationCount();
      }
    });
    return () => subscription.remove();
  }, [fetchUnreadNotificationCount]);

  /**
   * Mark notification as read
   */
  const markNotificationRead = useCallback(
    async (id: string) => {
      const prev = notifications.find((n) => n.id === id);
      const previousReadState = prev?.read;
      // Optimistic update
      runIfMounted(() =>
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
      );

      try {
        if (featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
          await notificationService.markNotificationRead(id);
          await fetchUnreadNotificationCount();
        }
      } catch (err) {
        // Revert on error
        if (previousReadState !== undefined) {
          runIfMounted(() =>
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, read: previousReadState as boolean } : n))
            )
          );
        }
        console.error('Error marking notification read:', err);
      }
    },
    [fetchUnreadNotificationCount, notifications, runIfMounted]
  );

  /**
   * Mark all notifications as read
   */
  const markAllNotificationsRead = useCallback(async () => {
    // Optimistic update
    runIfMounted(() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))));

    try {
      if (featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
        await notificationService.markAllRead();
        await fetchUnreadNotificationCount();
      }
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  }, [fetchUnreadNotificationCount, runIfMounted]);

  /**
   * Add notification (local only)
   */
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    if (featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
      return;
    }
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  /**
   * Social connect: fetch account metadata only.
   * OAuth tokens are stored on the backend; the app never stores them.
   */
  const fetchSocialAccounts = useCallback(async () => {
    if (!API_BASE_URL_READY) {
      runIfMounted(() => setSocialAccountsError('Social connect unavailable in degraded mode.'));
      return;
    }

    const token = await resolveAuthToken();
    if (!token) {
      runIfMounted(() => setSocialAccountsError('Login required to view social accounts.'));
      return;
    }

    runIfMounted(() => {
      setSocialAccountsLoading(true);
      setSocialAccountsError(null);
    });

    try {
      const accounts = await socialConnectService.getSocialAccounts();
      runIfMounted(() => setSocialAccounts(accounts));
      await AsyncStorage.setItem(STORAGE_KEYS.SOCIAL_ACCOUNTS, JSON.stringify(accounts));
    } catch (err) {
      const apiError = normalizeApiError(err);
      runIfMounted(() => setSocialAccountsError(apiError.message));
    } finally {
      runIfMounted(() => setSocialAccountsLoading(false));
    }
  }, [resolveAuthToken, runIfMounted]);

  useEffect(() => {
    const supportedProviders = new Set<SocialProvider>(['instagram', 'facebook']);

    const handleSocialCallback = async (url: string) => {
      try {
        const parsed = new URL(url);
        if (parsed.hostname !== 'social-connect') return;

        const provider = (parsed.searchParams.get('provider') || '').toLowerCase() as SocialProvider;
        const status = parsed.searchParams.get('status') || '';
        if (!supportedProviders.has(provider)) return;

        if (status === 'success') {
          await fetchSocialAccounts();
          Alert.alert('Connected', `${provider} connected successfully.`);
          return;
        }

        Alert.alert('Failed', 'Social connect failed. Please try again.');
      } catch {
        // Ignore malformed URLs.
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      void handleSocialCallback(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) {
        void handleSocialCallback(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [fetchSocialAccounts]);

  // Trigger backend refresh to pull latest metrics.
  const refreshSocialAccount = useCallback(
    async (provider: SocialProvider) => {
      if (!API_BASE_URL_READY) {
        runIfMounted(() => setSocialAccountsError('Social connect unavailable in degraded mode.'));
        return;
      }

      const token = await resolveAuthToken();
      if (!token) {
        runIfMounted(() => setSocialAccountsError('Login required to refresh social accounts.'));
        return;
      }

      try {
        await socialConnectService.refresh(provider);
        await fetchSocialAccounts();
      } catch (err) {
        const apiError = normalizeApiError(err);
        runIfMounted(() => setSocialAccountsError(apiError.message));
      }
    },
    [fetchSocialAccounts, resolveAuthToken, runIfMounted]
  );

  // Disconnect provider on backend; removes access and stored tokens server-side.
  const disconnectSocialAccount = useCallback(
    async (provider: SocialProvider) => {
      if (!API_BASE_URL_READY) {
        runIfMounted(() => setSocialAccountsError('Social connect unavailable in degraded mode.'));
        return;
      }

      const token = await resolveAuthToken();
      if (!token) {
        runIfMounted(() => setSocialAccountsError('Login required to disconnect social accounts.'));
        return;
      }

      try {
        await socialConnectService.disconnect(provider);
        await fetchSocialAccounts();
      } catch (err) {
        const apiError = normalizeApiError(err);
        runIfMounted(() => setSocialAccountsError(apiError.message));
      }
    },
    [fetchSocialAccounts, resolveAuthToken, runIfMounted]
  );

  const getSocialConnectUrl = useCallback((provider: SocialProvider) => {
    return socialConnectService.getConnectUrl(provider);
  }, []);

  /**
   * Fetch conversations
   */
  const fetchConversations = useCallback(async () => {
    if (loadingChats) return;

    runIfMounted(() => setLoadingChats(true));
    try {
      if (featureFlags.isEnabled('USE_API_MESSAGING')) {
        if (!API_BASE_URL_READY) {
          runIfMounted(() => setMessagingError('Messaging unavailable in degraded mode.'));
          return;
        }
        const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (!storedToken) {
          const session = await getSession().catch(() => null);
          if (!session?.access_token) {
            runIfMounted(() => setMessagingError('Login required to view messages.'));
            return;
          }
        }

        const apiConversations = await messagingService.getConversations();
        const adaptedChats = apiConversations.map((conv) =>
          adaptConversationToChatPreview(conv, user.id)
        );
        runIfMounted(() => {
          setChats((prev) => {
            const prevById = new Map(prev.map((item) => [item.id, item]));
            const merged = adaptedChats.map((chat) => {
              const existing = prevById.get(chat.id);
              if (!existing) return chat;
              const hasNewUnread = chat.unread > existing.unread;
              return {
                ...chat,
                lastMessage: chat.lastMessage || (hasNewUnread ? 'New message received' : existing.lastMessage),
                time: chat.time || existing.time,
                online: existing.online,
              };
            });
            const mergedIds = new Set(merged.map((chat) => chat.id));
            const extras = prev.filter((chat) => !mergedIds.has(chat.id));
            return [...merged, ...extras];
          });
          setMessagingError(null);
        });
      }
    } catch (err) {
      const apiError = handleAPIError(err);
      runIfMounted(() => {
        setError(apiError.message);
        if (apiError.code === 'AUTH_REQUIRED' || apiError.status === 401 || apiError.code === 'CONFIG_MISSING') {
          setMessagingError(apiError.message);
        }
      });
    } finally {
      runIfMounted(() => setLoadingChats(false));
    }
  }, [loadingChats, user.id, runIfMounted]);

  /**
   * Load messages for a conversation
   */
  const loadMessages = useCallback(
    async (conversationId: string, page: number = 0, size: number = 50) => {
      try {
        if (featureFlags.isEnabled('USE_API_MESSAGING')) {
          if (!API_BASE_URL_READY) {
            runIfMounted(() => setMessagingError('Messaging unavailable in degraded mode.'));
            return;
          }
          const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
          if (!storedToken) {
            const session = await getSession().catch(() => null);
            if (!session?.access_token) {
              runIfMounted(() => setMessagingError('Login required to view messages.'));
              return;
            }
          }

          const response = await messagingService.getMessages(conversationId, page, size);
          const items = Array.isArray(response) ? response : response.items ?? [];
          const adapted = items.map((message) => adaptMessage(message, user.id));

          let mergedMessages: Message[] = [];
          runIfMounted(() => {
            setMessagesByConversation((prev) => {
              const existing = prev[conversationId] ?? [];
              const mergedInput = page > 0 ? [...existing, ...adapted] : [...adapted, ...existing];
              mergedMessages = normalizeMessages(mergedInput);
              return { ...prev, [conversationId]: mergedMessages };
            });
            setChats((prev) => {
              const latest = mergedMessages[mergedMessages.length - 1];
              if (!latest) return prev;
              return prev.map((chat) =>
                chat.id === conversationId
                  ? {
                      ...chat,
                      lastMessage: latest.text,
                      time: latest.time,
                    }
                  : chat
              );
            });
            setMessagingError(null);
          });
        } else {
          runIfMounted(() => {
            setMessagesByConversation((prev) => ({
              ...prev,
              [conversationId]: normalizeMessages(prev[conversationId] ?? []),
            }));
          });
        }
      } catch (err) {
        const apiError = handleAPIError(err);
        runIfMounted(() => {
          setError(apiError.message);
          if (apiError.code === 'AUTH_REQUIRED' || apiError.status === 401 || apiError.code === 'CONFIG_MISSING') {
            setMessagingError(apiError.message);
          } else if (isNetworkError(apiError)) {
            setMessagingError('Network error. Retrying messages...');
          }
        });
        if (apiError.code === 'AUTH_REQUIRED' || apiError.status === 401) {
          stopConversationPolling();
        }
      }
    },
    [runIfMounted, user.id]
  );

  const upsertChatPreview = useCallback(
    (conversation: Conversation) => {
      const adapted = adaptConversationToChatPreview(conversation, user.id);
      runIfMounted(() => {
        setChats((prev) => {
          const prevById = new Map(prev.map((item) => [item.id, item]));
          const existing = prevById.get(adapted.id);
          if (!existing) {
            return [adapted, ...prev];
          }
          const hasNewUnread = adapted.unread > existing.unread;
          return prev.map((chat) =>
            chat.id === adapted.id
              ? {
                  ...adapted,
                  lastMessage: adapted.lastMessage || (hasNewUnread ? 'New message received' : existing.lastMessage),
                  time: adapted.time || existing.time,
                  online: existing.online,
                }
              : chat
          );
        });
      });
    },
    [runIfMounted, user.id]
  );

  const handleThreadEvent = useCallback(
    (event: ThreadEvent) => {
      const conversation = 'thread' in event ? event.thread : event;
      if (!conversation?.id) return;
      upsertChatPreview(conversation);
    },
    [upsertChatPreview]
  );

  const handleMessageEvent = useCallback(
    (event: MessageEvent) => {
      if (!event?.conversationId) return;
      const adapted = adaptMessage(event, user.id);
      runIfMounted(() => {
        setMessagesByConversation((prev) => {
          const existing = prev[adapted.chatId] ?? [];
          const merged = normalizeMessages([...existing, adapted]);
          return { ...prev, [adapted.chatId]: merged };
        });
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id !== adapted.chatId) return chat;
            const shouldIncrementUnread =
              adapted.sender === 'other' && activeConversationRef.current !== adapted.chatId;
            return {
              ...chat,
              lastMessage: adapted.text,
              time: adapted.time,
              unread: shouldIncrementUnread ? chat.unread + 1 : chat.unread,
            };
          })
        );
      });
    },
    [runIfMounted, user.id]
  );

  const stopMessagesPolling = useCallback(() => {
    if (conversationsPollRef.current) {
      clearInterval(conversationsPollRef.current);
      conversationsPollRef.current = null;
    }
    conversationsPollInFlightRef.current = false;
    chatListActiveRef.current = false;
    if (wsThreadsUnsubRef.current) {
      wsThreadsUnsubRef.current();
      wsThreadsUnsubRef.current = null;
    }
    if (!activeConversationRef.current) {
      webSocketService.disconnect();
      wsFailedRef.current = false;
    }
  }, []);

  const stopConversationPolling = useCallback(() => {
    if (messagesPollRef.current) {
      clearInterval(messagesPollRef.current);
      messagesPollRef.current = null;
    }
    messagesPollInFlightRef.current = false;
    activeConversationRef.current = null;
    if (wsMessagesUnsubRef.current) {
      wsMessagesUnsubRef.current();
      wsMessagesUnsubRef.current = null;
    }
    if (!chatListActiveRef.current) {
      webSocketService.disconnect();
      wsFailedRef.current = false;
    }
  }, []);

  const stopPollingIntervalsOnly = useCallback(() => {
    if (conversationsPollRef.current) {
      clearInterval(conversationsPollRef.current);
      conversationsPollRef.current = null;
    }
    if (messagesPollRef.current) {
      clearInterval(messagesPollRef.current);
      messagesPollRef.current = null;
    }
  }, []);

  const startMessagesPollingInterval = useCallback(() => {
    chatListActiveRef.current = true;
    if (conversationsPollRef.current) return;

    const start = async () => {
      if (!(await canStartMessagingPolling())) {
        stopMessagesPolling();
        return;
      }

      const poll = async () => {
        if (!isMountedRef.current) return;
        if (!chatListActiveRef.current) return;
        if (appStateRef.current !== 'active') return;
        if (!(await canStartMessagingPolling())) {
          stopMessagesPolling();
          return;
        }
        if (conversationsPollInFlightRef.current) return;
        conversationsPollInFlightRef.current = true;
        try {
          await fetchConversations();
          lastConversationsPollAtRef.current = Date.now();
          if (__DEV__) {
            console.log('[Messaging] Conversations polled', new Date(lastConversationsPollAtRef.current).toISOString());
          }
        } finally {
          conversationsPollInFlightRef.current = false;
        }
      };

      if (__DEV__) {
        console.log('[Messaging] Start conversations polling');
      }
      poll();
      conversationsPollRef.current = setInterval(poll, MESSAGE_POLL_INTERVAL);
    };

    void start();
  }, [canStartMessagingPolling, fetchConversations, stopMessagesPolling]);

  const startWebSocketThreads = useCallback(() => {
    chatListActiveRef.current = true;
    if (wsThreadsUnsubRef.current) return;

    const start = async () => {
      if (!(await canStartWebSocketMessaging())) {
        wsFailedRef.current = true;
        startMessagesPollingInterval();
        return;
      }

      const token = await resolveMessagingToken();
      if (!token) {
        wsFailedRef.current = true;
        startMessagesPollingInterval();
        return;
      }

      try {
        await webSocketService.connect(token);
        if (webSocketService.connected && !wsThreadsUnsubRef.current) {
          wsThreadsUnsubRef.current = webSocketService.subscribeToThreads(handleThreadEvent);
        }
        wsFailedRef.current = false;
      } catch (error) {
        wsFailedRef.current = true;
        const apiError = normalizeApiError(error);
        runIfMounted(() => setMessagingError(apiError.message));
        startMessagesPollingInterval();
      }
    };

    void start();
  }, [
    canStartWebSocketMessaging,
    handleThreadEvent,
    resolveMessagingToken,
    runIfMounted,
    startMessagesPollingInterval,
  ]);

  const startMessagesPolling = useCallback(() => {
    chatListActiveRef.current = true;
    if (isWebSocketEnabled() && !wsFailedRef.current) {
      return startWebSocketThreads();
    }
    return startMessagesPollingInterval();
  }, [isWebSocketEnabled, startMessagesPollingInterval, startWebSocketThreads]);

  const startConversationPollingInterval = useCallback(
    (conversationId: string) => {
      if (!conversationId) return;
      if (activeConversationRef.current !== conversationId) {
        stopConversationPolling();
        activeConversationRef.current = conversationId;
      }
      if (messagesPollRef.current) return;

      const start = async () => {
        if (!(await canStartMessagingPolling())) {
          stopConversationPolling();
          return;
        }

        const poll = async () => {
          if (!isMountedRef.current) return;
          if (appStateRef.current !== 'active') return;
          if (!(await canStartMessagingPolling())) {
            stopConversationPolling();
            return;
          }
          if (messagesPollInFlightRef.current) return;
          messagesPollInFlightRef.current = true;
          try {
            await loadMessages(conversationId, 0, 50);
            lastMessagesPollAtRef.current = Date.now();
            if (__DEV__) {
              console.log('[Messaging] Messages polled', new Date(lastMessagesPollAtRef.current).toISOString());
            }
          } finally {
            messagesPollInFlightRef.current = false;
          }
        };

        if (__DEV__) {
          console.log('[Messaging] Start conversation polling', conversationId);
        }
        poll();
        messagesPollRef.current = setInterval(poll, MESSAGE_POLL_INTERVAL);
      };

      void start();
    },
    [canStartMessagingPolling, loadMessages, stopConversationPolling]
  );

  const startWebSocketConversation = useCallback(
    (conversationId: string) => {
      if (!conversationId) return;
      if (activeConversationRef.current !== conversationId) {
        stopConversationPolling();
        activeConversationRef.current = conversationId;
      }
      if (wsMessagesUnsubRef.current) return;

      const start = async () => {
        if (!(await canStartWebSocketMessaging())) {
          wsFailedRef.current = true;
          startConversationPollingInterval(conversationId);
          return;
        }

        const token = await resolveMessagingToken();
        if (!token) {
          wsFailedRef.current = true;
          startConversationPollingInterval(conversationId);
          return;
        }

        try {
          await webSocketService.connect(token);
          if (webSocketService.connected && !wsMessagesUnsubRef.current) {
            wsMessagesUnsubRef.current = webSocketService.subscribeToThreadMessages(conversationId, handleMessageEvent);
          }
          wsFailedRef.current = false;
        } catch (error) {
          wsFailedRef.current = true;
          const apiError = normalizeApiError(error);
          runIfMounted(() => setMessagingError(apiError.message));
          startConversationPollingInterval(conversationId);
        }
      };

      void start();
    },
    [
      canStartWebSocketMessaging,
      handleMessageEvent,
      resolveMessagingToken,
      runIfMounted,
      startConversationPollingInterval,
      stopConversationPolling,
    ]
  );

  const startConversationPolling = useCallback(
    (conversationId: string) => {
      if (!conversationId) return;
      if (isWebSocketEnabled() && !wsFailedRef.current) {
        return startWebSocketConversation(conversationId);
      }
      return startConversationPollingInterval(conversationId);
    },
    [isWebSocketEnabled, startConversationPollingInterval, startWebSocketConversation]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      appStateRef.current = state;
      if (state !== 'active') {
        stopMessagesPolling();
        stopConversationPolling();
        webSocketService.disconnect();
        return;
      }
      if (chatListActiveRef.current) {
        startMessagesPolling();
      }
      if (activeConversationRef.current) {
        startConversationPolling(activeConversationRef.current);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [startConversationPolling, startMessagesPolling, stopMessagesPolling, stopConversationPolling]);

  useEffect(() => {
    const unsubscribeError = webSocketService.onError((error) => {
      const apiError = normalizeApiError(error);
      wsFailedRef.current = true;
      runIfMounted(() => setMessagingError(apiError.message));
      if (chatListActiveRef.current) {
        startMessagesPollingInterval();
      }
      if (activeConversationRef.current) {
        startConversationPollingInterval(activeConversationRef.current);
      }
    });

    const unsubscribeDisconnect = webSocketService.onDisconnect(() => {
      wsThreadsUnsubRef.current = null;
      wsMessagesUnsubRef.current = null;
      if (chatListActiveRef.current) {
        startMessagesPollingInterval();
      }
      if (activeConversationRef.current) {
        startConversationPollingInterval(activeConversationRef.current);
      }
    });

    const unsubscribeConnect = webSocketService.onConnect(() => {
      wsFailedRef.current = false;
      stopPollingIntervalsOnly();
      if (chatListActiveRef.current && !wsThreadsUnsubRef.current) {
        wsThreadsUnsubRef.current = webSocketService.subscribeToThreads(handleThreadEvent);
      }
      if (activeConversationRef.current && !wsMessagesUnsubRef.current) {
        wsMessagesUnsubRef.current = webSocketService.subscribeToThreadMessages(
          activeConversationRef.current,
          handleMessageEvent
        );
      }
    });

    return () => {
      unsubscribeError();
      unsubscribeDisconnect();
      unsubscribeConnect();
    };
  }, [
    handleMessageEvent,
    handleThreadEvent,
    runIfMounted,
    startConversationPollingInterval,
    startMessagesPollingInterval,
    stopPollingIntervalsOnly,
  ]);

  /**
   * Send message
   */
  const sendMessage = useCallback(
    async (chatId: string, text: string) => {
      try {
        if (featureFlags.isEnabled('USE_API_MESSAGING')) {
          const apiMessage = await messagingService.sendMessage(chatId, text);
          const adapted = adaptMessage(apiMessage, user.id);

          runIfMounted(() => {
            setMessagesByConversation((prev) => {
              const existing = prev[chatId] ?? [];
              return { ...prev, [chatId]: normalizeMessages([...existing, adapted]) };
            });
          });

          // Update chat preview
          runIfMounted(() =>
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
            createdAt: new Date().toISOString(),
          };

          runIfMounted(() => {
            setMessagesByConversation((prev) => {
              const existing = prev[chatId] ?? [];
              return { ...prev, [chatId]: normalizeMessages([...existing, mockMessage]) };
            });
          });
        }
      } catch (err) {
        const apiError = handleAPIError(err);
        runIfMounted(() => setError(apiError.message));
        throw apiError;
      }
    },
    [runIfMounted, user.id]
  );

  /**
   * Get conversation messages
   */
  const getConversation = useCallback(
    (chatId: string) => {
      return normalizeMessages(messagesByConversation[chatId] ?? []);
    },
    [messagesByConversation]
  );

  /**
   * Mark chat as read
   */
  const markChatRead = useCallback(
    async (chatId: string) => {
      // Optimistic update
      runIfMounted(() => setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, unread: 0 } : c))));

      try {
        if (featureFlags.isEnabled('USE_API_MESSAGING')) {
          await messagingService.markConversationRead(chatId);
        }
      } catch (err) {
        console.error('Error marking chat read:', err);
      }
    },
    [runIfMounted]
  );

  /**
   * Submit deliverable
   */
  const submitDeliverable = useCallback(
    async (
      activeCampaignId: string,
      deliverableId: string,
      file: { name: string; type: 'video' | 'image'; uri: string },
      description?: string
    ) => {
      try {
        if (featureFlags.isEnabled('USE_API_DELIVERABLES')) {
          const activeCampaign = activeCampaigns.find((ac) => ac.id === activeCampaignId);
          if (!activeCampaign) throw new Error('Active campaign not found');

          const explicitApplicationId = (activeCampaign as any)?.applicationId as string | undefined;
          const selectedApplication =
            applications.find(
              (application) =>
                application.campaignId === activeCampaign.campaignId &&
                application.status === 'SELECTED'
            ) ||
            applications.find(
              (application) => application.campaignId === activeCampaign.campaignId
            );
          const applicationId = explicitApplicationId || selectedApplication?.id;

          if (!applicationId) {
            throw new Error('Unable to resolve application for this campaign.');
          }

          await deliverableService.submitDeliverable(applicationId, deliverableId, {
            file: {
              uri: file.uri,
              type: file.type === 'video' ? 'video/mp4' : 'image/jpeg',
              name: file.name,
            },
            description,
          });

          runIfMounted(() =>
            setDeliverables((prev) =>
              prev.map((d) =>
                d.id === deliverableId ? { ...d, status: 'submitted' as const } : d
              )
            )
          );
        } else {
          runIfMounted(() =>
            setDeliverables((prev) =>
              prev.map((d) =>
                d.id === deliverableId ? { ...d, status: 'submitted' as const } : d
              )
            )
          );
        }
      } catch (err) {
        const apiError = handleAPIError(err);
        runIfMounted(() => setError(apiError.message));
        throw apiError;
      }
    },
    [activeCampaigns, applications, runIfMounted]
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
    if (!API_BASE_URL_READY) {
      return;
    }

    const requiresAuth =
      featureFlags.isEnabled('USE_API_CAMPAIGNS') ||
      featureFlags.isEnabled('USE_API_APPLICATIONS') ||
      featureFlags.isEnabled('USE_API_WALLET') ||
      featureFlags.isEnabled('USE_API_NOTIFICATIONS') ||
      featureFlags.isEnabled('USE_API_MESSAGING');

    if (requiresAuth) {
      const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
      const session = storedToken ? null : await getSession().catch(() => null);
      const token = storedToken || session?.access_token;
      if (!token) {
        return;
      }
    }

    runIfMounted(() => {
      setIsLoading(true);
      setError(null);
    });

    try {
      const tasks: Promise<void>[] = [];
      if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
        tasks.push(fetchCampaigns({}, true));
      }
      if (featureFlags.isEnabled('USE_API_APPLICATIONS')) {
        tasks.push(fetchApplications());
      }
      if (featureFlags.isEnabled('USE_API_WALLET')) {
        tasks.push(refreshWalletAll());
      }
      if (featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
        tasks.push(fetchNotifications({ page: 0, size: 20, refresh: true }));
        tasks.push(fetchUnreadNotificationCount());
      }
      if (featureFlags.isEnabled('USE_API_MESSAGING')) {
        tasks.push(fetchConversations());
      }
      await Promise.all(tasks);
    } catch (err) {
      const apiError = handleAPIError(err);
      runIfMounted(() => setError(apiError.message));
    } finally {
      runIfMounted(() => setIsLoading(false));
    }
  }, [
    fetchCampaigns,
    fetchApplications,
    refreshWalletAll,
    fetchNotifications,
    fetchUnreadNotificationCount,
    fetchConversations,
  ]);

  /**
   * Reset app state on logout
   */
  const resetAppState = useCallback(async () => {
    setUser(defaultUser);
    setWallet(null);
    setCampaigns([]);
    setApplications([]);
    setDeliverables([]);
    setTransactions([]);
    setWithdrawals([]);
    setChats([]);
    setConversations([]);
    setMessagesByConversation({});
    setSavedCampaigns([]);
    setNotifications([]);
    setUnreadNotificationCount(0);
    setSocialAccounts([]);
    setSocialAccountsError(null);
    setSocialAccountsLoading(false);
    setActiveCampaigns([]);
    setDarkMode(true);
    setIsLoading(false);
    setNotificationsError(null);
    setError(null);
    setLoadingCampaigns(false);
    setLoadingApplications(false);
    setWalletLoading(false);
    setTransactionsLoading(false);
    setWithdrawalsLoading(false);
    setLoadingNotifications(false);
    setLoadingChats(false);
    setCampaignsPage(0);
    setCampaignsHasMore(true);
    setCampaignsTotal(0);
    setCampaignFilters({});

    try {
      await AsyncStorage.multiRemove(APP_OWNED_KEYS);
      await clearApiCacheKeys();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }, []);

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

  const approveApplication = useCallback((campaignId: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.campaignId === campaignId ? { ...a, status: 'SELECTED' } : a
      )
    );
  }, []);

  const rejectApplication = useCallback((campaignId: string, feedback?: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.campaignId === campaignId
          ? { ...a, status: 'REJECTED', brandFeedback: feedback }
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
  const resolvedUnreadNotificationCount = featureFlags.isEnabled('USE_API_NOTIFICATIONS')
    ? unreadNotificationCount
    : notifications.filter((n) => !n.read).length;
  const unreadNotifications = resolvedUnreadNotificationCount;

  const value: AppContextType = {
    // Data
    user,
    wallet,
    campaigns,
    applications,
    deliverables,
    transactions,
    withdrawals,
    chats,
    conversations,
    messagesByConversation,
    savedCampaigns,
    notifications,
    unreadNotifications,
    unreadNotificationCount: resolvedUnreadNotificationCount,
    notificationsHasMore,
    notificationsPage,
    socialAccounts,
    socialAccountsLoading,
    socialAccountsError,
    darkMode,
    isLoading,
    activeCampaigns,
    error,
    notificationsError,
    walletError,
    transactionsError,
    withdrawalsError,
    messagingError,
    transactionsHasMore,
    transactionsPage,
    withdrawalsHasMore,
    withdrawalsPage,

    // Loading states
    loadingCampaigns,
    loadingApplications,
    walletLoading,
    transactionsLoading,
    withdrawalsLoading,
    loadingNotifications,
    loadingChats,

    // Pagination
    campaignsHasMore,
    campaignsTotal,

    // Actions
    fetchCampaigns,
    loadMoreCampaigns,
    getCampaignById,
    fetchCampaignById,
    saveCampaign,
    unsaveCampaign,
    isCampaignSaved,
    applyCampaign,
    getApplication,
    withdrawApplication,
    fetchApplications,
    fetchWalletSummary,
    fetchTransactions,
    fetchWithdrawals,
    refreshWalletAll,
    markNotificationRead,
    markAllNotificationsRead,
    addNotification,
    fetchNotifications,
    fetchUnreadNotificationCount,
    fetchSocialAccounts,
    refreshSocialAccount,
    disconnectSocialAccount,
    getSocialConnectUrl,
    sendMessage,
    getConversation,
    markChatRead,
    fetchConversations,
    loadMessages,
    startMessagesPolling,
    stopMessagesPolling,
    startConversationPolling,
    stopConversationPolling,
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
    resetAppState,

    // Legacy methods
    addDeliverable,
    updateDeliverable,
    approveApplication,
    rejectApplication,
    updateCampaignStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// NOTE: Keep all hooks/Provider logic above. Do not leave partial blocks before exports.
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

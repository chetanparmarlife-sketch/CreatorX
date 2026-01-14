/**
 * CampaignContext
 * Manages campaigns, applications, active campaigns, saved campaigns, and deliverables
 * Extracted from AppContext.api.tsx
 */

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Campaign, CampaignApplication, ActiveCampaign, Deliverable } from '@/src/types';
import { campaignService, CampaignFilters } from '@/src/api/services/campaignService';
import { applicationService, ApplicationRequest } from '@/src/api/services/applicationService';
import { adaptCampaignsResponse, adaptCampaign, adaptApplication } from '@/src/api/adapters';
import { handleAPIError, isNetworkError } from '@/src/api/errors';
import { featureFlags } from '@/src/config/featureFlags';
import { API_BASE_URL_READY } from '@/src/config/env';
import { getSecureItem } from '@/src/lib/secureStore';
import { getSession } from '@/src/lib/supabase';
import { cacheUtils } from '@/src/api/utils/cache';
import {
    useRunIfMounted,
    STORAGE_KEYS,
    loadFromCache,
    saveToCache,
    safeParseJSON,
} from './contextUtils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ApplicationFormData {
    pitch: string;
    expectedTimeline: string;
    extraDetails?: string;
}

export interface CampaignContextType {
    // State
    campaigns: Campaign[];
    savedCampaigns: string[];
    applications: CampaignApplication[];
    activeCampaigns: ActiveCampaign[];
    deliverables: Deliverable[];
    campaignsPage: number;
    campaignsHasMore: boolean;
    campaignsTotal: number;
    campaignFilters: CampaignFilters;
    loadingCampaigns: boolean;
    loadingApplications: boolean;
    campaignError: string | null;

    // Actions - Campaigns
    fetchCampaigns: (filters?: CampaignFilters, reset?: boolean) => Promise<void>;
    loadMoreCampaigns: () => Promise<void>;
    getCampaignById: (id: string) => Campaign | undefined;
    fetchCampaignById: (id: string) => Promise<Campaign | null>;
    saveCampaign: (campaignId: string) => Promise<void>;
    unsaveCampaign: (campaignId: string) => Promise<void>;
    isCampaignSaved: (campaignId: string) => boolean;
    updateCampaignStatus: (campaignId: string, status: Campaign['status']) => void;

    // Actions - Applications
    applyCampaign: (campaignId: string, applicationData: ApplicationFormData) => Promise<void>;
    getApplication: (campaignId: string) => CampaignApplication | undefined;
    withdrawApplication: (applicationId: string) => Promise<void>;
    fetchApplications: () => Promise<void>;
    approveApplication: (campaignId: string) => void;
    rejectApplication: (campaignId: string, feedback?: string) => void;

    // Actions - Active Campaigns
    updateActiveCampaign: (id: string, updates: Partial<ActiveCampaign>) => void;
    completeCampaign: (activeCampaignId: string) => Promise<void>;
    processPayment: (activeCampaignId: string) => Promise<void>;

    // Actions - Deliverables
    addDeliverable: (deliverable: Omit<Deliverable, 'id'>) => void;
    updateDeliverable: (id: string, updates: Partial<Deliverable>) => void;
    submitDeliverable: (
        activeCampaignId: string,
        deliverableId: string,
        file: { name: string; type: 'video' | 'image'; uri: string },
        description?: string
    ) => Promise<void>;
    approveDeliverable: (activeCampaignId: string, deliverableId: string) => Promise<void>;
    requestDeliverableChanges: (activeCampaignId: string, deliverableId: string, feedback: string) => Promise<void>;
    markDeliverablePosted: (activeCampaignId: string, deliverableId: string, postUrl?: string) => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function CampaignProvider({ children }: { children: ReactNode }) {
    const { runIfMounted } = useRunIfMounted();

    // Campaign State
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [savedCampaigns, setSavedCampaigns] = useState<string[]>([]);
    const [applications, setApplications] = useState<CampaignApplication[]>([]);
    const [activeCampaigns, setActiveCampaigns] = useState<ActiveCampaign[]>([]);
    const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
    const [campaignsPage, setCampaignsPage] = useState(0);
    const [campaignsHasMore, setCampaignsHasMore] = useState(true);
    const [campaignsTotal, setCampaignsTotal] = useState(0);
    const [campaignFilters, setCampaignFilters] = useState<CampaignFilters>({});
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);
    const [loadingApplications, setLoadingApplications] = useState(false);
    const [campaignError, setCampaignError] = useState<string | null>(null);

    /**
     * Check if we have a valid auth token
     */
    const hasAuthToken = useCallback(async (): Promise<boolean> => {
        const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (storedToken) return true;

        const session = await getSession().catch(() => null);
        return !!session?.access_token;
    }, []);

    /**
     * Load cached data on mount
     */
    const loadCachedData = useCallback(async () => {
        try {
            // Load saved campaigns
            const saved = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_CAMPAIGNS);
            if (saved) {
                runIfMounted(() => setSavedCampaigns(safeParseJSON<string[]>(saved, [])));
            }

            // Load cached campaigns
            if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
                const cached = await loadFromCache<Campaign[]>('campaigns');
                if (cached) {
                    runIfMounted(() => setCampaigns(cached));
                }
            }

            // Load active campaigns
            const activeRaw = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_CAMPAIGNS);
            if (activeRaw) {
                runIfMounted(() => setActiveCampaigns(safeParseJSON<ActiveCampaign[]>(activeRaw, [])));
            }

            // Load applications
            const appsRaw = await AsyncStorage.getItem(STORAGE_KEYS.APPLICATIONS);
            if (appsRaw) {
                runIfMounted(() => setApplications(safeParseJSON<CampaignApplication[]>(appsRaw, [])));
            }
        } catch (error) {
            console.error('[CampaignContext] Error loading cached data:', error);
        }
    }, [runIfMounted]);

    // Load cached data on mount
    React.useEffect(() => {
        loadCachedData();
    }, [loadCachedData]);

    /**
     * Fetch campaigns from API
     */
    const fetchCampaigns = useCallback(
        async (filters: CampaignFilters = {}, reset: boolean = false) => {
            if (loadingCampaigns) return;

            if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
                if (!(await hasAuthToken())) {
                    if (__DEV__) {
                        console.log('[Campaigns] Skipping fetch until auth token is ready.');
                    }
                    runIfMounted(() => setCampaignError('Login required to load campaigns.'));
                    return;
                }
            }

            runIfMounted(() => {
                setLoadingCampaigns(true);
                setCampaignError(null);
                setCampaignFilters(filters);
            });

            try {
                if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
                    const page = reset ? 0 : campaignsPage;
                    const result = await campaignService.getCampaigns(filters, page, 20);

                    const adapted = adaptCampaignsResponse(result);
                    const adaptedCampaigns = adapted.campaigns.map((c) => ({
                        ...c,
                        userState: savedCampaigns.includes(c.id) ? 'SAVED' : c.userState,
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
                runIfMounted(() => setCampaignError(apiError.message));

                // Load from cache on error
                if (isNetworkError(apiError)) {
                    const cached = await loadFromCache<Campaign[]>('campaigns');
                    if (cached) {
                        runIfMounted(() => setCampaigns(cached));
                    }
                }
            } finally {
                runIfMounted(() => setLoadingCampaigns(false));
            }
        },
        [loadingCampaigns, campaignsPage, savedCampaigns, runIfMounted, hasAuthToken]
    );

    /**
     * Load more campaigns (pagination)
     */
    const loadMoreCampaigns = useCallback(async () => {
        if (!campaignsHasMore || loadingCampaigns) return;
        await fetchCampaigns(campaignFilters, false);
    }, [campaignsHasMore, loadingCampaigns, campaignFilters, fetchCampaigns]);

    /**
     * Get campaign by ID from state
     */
    const getCampaignById = useCallback(
        (id: string) => campaigns.find((c) => c.id === id),
        [campaigns]
    );

    /**
     * Fetch campaign by ID from API
     */
    const fetchCampaignById = useCallback(
        async (id: string): Promise<Campaign | null> => {
            if (!id) return null;

            if (!API_BASE_URL_READY) {
                runIfMounted(() => setCampaignError('Campaigns unavailable in degraded mode.'));
                return null;
            }

            if (featureFlags.isEnabled('USE_API_CAMPAIGNS')) {
                if (!(await hasAuthToken())) {
                    if (__DEV__) {
                        console.log('[Campaigns] Skipping fetch until auth token is ready.');
                    }
                    runIfMounted(() => setCampaignError('Login required to load campaign.'));
                    return null;
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
                runIfMounted(() => setCampaignError(apiError.message));
                return null;
            }
        },
        [getCampaignById, runIfMounted, savedCampaigns, hasAuthToken]
    );

    /**
     * Save campaign (optimistic update)
     */
    const saveCampaign = useCallback(
        async (campaignId: string) => {
            // Optimistic update
            setCampaigns((prev) =>
                prev.map((c) => (c.id === campaignId ? { ...c, userState: 'SAVED' } : c))
            );
            setSavedCampaigns((prev) => [...prev, campaignId]);
            await AsyncStorage.setItem(
                STORAGE_KEYS.SAVED_CAMPAIGNS,
                JSON.stringify([...savedCampaigns, campaignId])
            );

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
                setCampaignError(apiError.message);
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
                    prev.map((c) => (c.id === campaignId ? { ...c, userState: 'SAVED' } : c))
                );
                setSavedCampaigns((prev) => [...prev, campaignId]);
                const apiError = handleAPIError(err);
                setCampaignError(apiError.message);
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
     * Update campaign status
     */
    const updateCampaignStatus = useCallback((campaignId: string, status: Campaign['status']) => {
        setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? { ...c, status } : c)));
    }, []);

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
                } else {
                    // Mock application
                    const mockApplication: CampaignApplication = {
                        id: Date.now().toString(),
                        campaignId,
                        creatorId: 'mock-user',
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
                runIfMounted(() => setCampaignError(apiError.message));
                throw apiError;
            }
        },
        [runIfMounted]
    );

    /**
     * Get application by campaign ID
     */
    const getApplication = useCallback(
        (campaignId: string) => applications.find((a) => a.campaignId === campaignId),
        [applications]
    );

    /**
     * Withdraw application
     */
    const withdrawApplication = useCallback(
        async (applicationId: string) => {
            try {
                if (featureFlags.isEnabled('USE_API_APPLICATIONS')) {
                    await applicationService.withdrawApplication(applicationId);
                }
                runIfMounted(() => setApplications((prev) => prev.filter((a) => a.id !== applicationId)));
            } catch (err) {
                const apiError = handleAPIError(err);
                runIfMounted(() => setCampaignError(apiError.message));
                throw apiError;
            }
        },
        [runIfMounted]
    );

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
            runIfMounted(() => setCampaignError(apiError.message));
        } finally {
            runIfMounted(() => setLoadingApplications(false));
        }
    }, [loadingApplications, runIfMounted]);

    /**
     * Approve application (legacy, local only)
     */
    const approveApplication = useCallback((campaignId: string) => {
        setApplications((prev) =>
            prev.map((a) => (a.campaignId === campaignId ? { ...a, status: 'APPROVED' as const } : a))
        );
    }, []);

    /**
     * Reject application (legacy, local only)
     */
    const rejectApplication = useCallback((campaignId: string, feedback?: string) => {
        setApplications((prev) =>
            prev.map((a) =>
                a.campaignId === campaignId ? { ...a, status: 'REJECTED' as const, feedback } : a
            )
        );
    }, []);

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
    const completeCampaign = useCallback(
        async (activeCampaignId: string) => {
            const activeCampaign = activeCampaigns.find((ac) => ac.id === activeCampaignId);
            if (!activeCampaign) return;

            runIfMounted(() =>
                setActiveCampaigns((prev) =>
                    prev.map((ac) =>
                        ac.id === activeCampaignId
                            ? { ...ac, paymentStatus: 'processing' as const, completedAt: new Date().toISOString() }
                            : ac
                    )
                )
            );

            // Update linked campaign status
            const campaignId = activeCampaign.campaignId;
            if (campaignId) {
                runIfMounted(() =>
                    setCampaigns((prev) =>
                        prev.map((c) => (c.id === campaignId ? { ...c, status: 'completed' as const } : c))
                    )
                );
            }
        },
        [activeCampaigns, runIfMounted]
    );

    /**
     * Process payment (local simulation)
     */
    const processPayment = useCallback(
        async (activeCampaignId: string) => {
            runIfMounted(() =>
                setActiveCampaigns((prev) =>
                    prev.map((ac) =>
                        ac.id === activeCampaignId ? { ...ac, paymentStatus: 'paid' as const } : ac
                    )
                )
            );
        },
        [runIfMounted]
    );

    /**
     * Add deliverable (legacy, local only)
     */
    const addDeliverable = useCallback((deliverable: Omit<Deliverable, 'id'>) => {
        const newDeliverable: Deliverable = {
            ...deliverable,
            id: Date.now().toString(),
        };
        setDeliverables((prev) => [...prev, newDeliverable]);
    }, []);

    /**
     * Update deliverable (legacy, local only)
     */
    const updateDeliverable = useCallback((id: string, updates: Partial<Deliverable>) => {
        setDeliverables((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    }, []);

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
            runIfMounted(() =>
                setActiveCampaigns((prev) =>
                    prev.map((ac) => {
                        if (ac.id !== activeCampaignId) return ac;
                        return {
                            ...ac,
                            deliverables: ac.deliverables.map((d) =>
                                d.id === deliverableId ? { ...d, status: 'draft_submitted' as const } : d
                            ),
                        };
                    })
                )
            );
        },
        [runIfMounted]
    );

    /**
     * Approve deliverable
     */
    const approveDeliverable = useCallback(
        async (activeCampaignId: string, deliverableId: string) => {
            runIfMounted(() =>
                setActiveCampaigns((prev) =>
                    prev.map((ac) => {
                        if (ac.id !== activeCampaignId) return ac;
                        return {
                            ...ac,
                            deliverables: ac.deliverables.map((d) =>
                                d.id === deliverableId ? { ...d, status: 'approved' as const } : d
                            ),
                        };
                    })
                )
            );
        },
        [runIfMounted]
    );

    /**
     * Request deliverable changes
     */
    const requestDeliverableChanges = useCallback(
        async (activeCampaignId: string, deliverableId: string, feedback: string) => {
            runIfMounted(() =>
                setActiveCampaigns((prev) =>
                    prev.map((ac) => {
                        if (ac.id !== activeCampaignId) return ac;
                        return {
                            ...ac,
                            deliverables: ac.deliverables.map((d) =>
                                d.id === deliverableId
                                    ? { ...d, status: 'changes_requested' as const, feedback }
                                    : d
                            ),
                        };
                    })
                )
            );
        },
        [runIfMounted]
    );

    /**
     * Mark deliverable as posted
     */
    const markDeliverablePosted = useCallback(
        async (activeCampaignId: string, deliverableId: string, postUrl?: string) => {
            runIfMounted(() =>
                setActiveCampaigns((prev) =>
                    prev.map((ac) => {
                        if (ac.id !== activeCampaignId) return ac;
                        return {
                            ...ac,
                            deliverables: ac.deliverables.map((d) =>
                                d.id === deliverableId ? { ...d, status: 'posted' as const, postUrl } : d
                            ),
                        };
                    })
                )
            );
        },
        [runIfMounted]
    );

    // Context value
    const value: CampaignContextType = {
        campaigns,
        savedCampaigns,
        applications,
        activeCampaigns,
        deliverables,
        campaignsPage,
        campaignsHasMore,
        campaignsTotal,
        campaignFilters,
        loadingCampaigns,
        loadingApplications,
        campaignError,
        fetchCampaigns,
        loadMoreCampaigns,
        getCampaignById,
        fetchCampaignById,
        saveCampaign,
        unsaveCampaign,
        isCampaignSaved,
        updateCampaignStatus,
        applyCampaign,
        getApplication,
        withdrawApplication,
        fetchApplications,
        approveApplication,
        rejectApplication,
        updateActiveCampaign,
        completeCampaign,
        processPayment,
        addDeliverable,
        updateDeliverable,
        submitDeliverable,
        approveDeliverable,
        requestDeliverableChanges,
        markDeliverablePosted,
    };

    return (
        <CampaignContext.Provider value={value}>
            {children}
        </CampaignContext.Provider>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useCampaign(): CampaignContextType {
    const context = useContext(CampaignContext);
    if (context === undefined) {
        throw new Error('useCampaign must be used within a CampaignProvider');
    }
    return context;
}

// Legacy aliases for compatibility
export const useCampaigns = useCampaign;

/**
 * ProfileContext
 * Manages user profile and social accounts
 * Extracted from AppContext.api.tsx
 */

import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    ReactNode,
} from 'react';
import { Alert } from 'react-native';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/src/types';
import { profileService } from '@/src/api/services/profileService';
import { socialConnectService, CreatorSocialAccount, SocialProvider } from '@/src/api/services/socialConnectService';
import { normalizeApiError } from '@/src/api/errors';
import { featureFlags } from '@/src/config/featureFlags';
import { API_BASE_URL_READY } from '@/src/config/env';
import { getSecureItem } from '@/src/lib/secureStore';
import { getSession } from '@/src/lib/supabase';
import {
    useRunIfMounted,
    STORAGE_KEYS,
    safeParseJSON,
} from './contextUtils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ProfileContextType {
    // State
    user: UserProfile;
    socialAccounts: CreatorSocialAccount[];
    socialAccountsLoading: boolean;
    socialAccountsError: string | null;
    darkMode: boolean;
    isLoading: boolean;

    // Actions - User Profile
    updateUser: (updates: Partial<UserProfile>) => Promise<void>;
    copyReferralCode: () => Promise<boolean>;

    // Actions - Social Accounts
    fetchSocialAccounts: () => Promise<void>;
    refreshSocialAccount: (provider: SocialProvider) => Promise<void>;
    disconnectSocialAccount: (provider: SocialProvider) => Promise<void>;
    getSocialConnectUrl: (provider: SocialProvider) => string | null;

    // Actions - UI
    toggleDarkMode: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Default User
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function ProfileProvider({ children }: { children: ReactNode }) {
    const { runIfMounted } = useRunIfMounted();

    // State
    const [user, setUser] = useState<UserProfile>(defaultUser);
    const [socialAccounts, setSocialAccounts] = useState<CreatorSocialAccount[]>([]);
    const [socialAccountsLoading, setSocialAccountsLoading] = useState(false);
    const [socialAccountsError, setSocialAccountsError] = useState<string | null>(null);
    const [darkMode, setDarkMode] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Check if we have a valid auth token
     */
    const resolveAuthToken = useCallback(async (): Promise<string | null> => {
        const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (storedToken) return storedToken;
        const session = await getSession().catch(() => null);
        return session?.access_token ?? null;
    }, []);

    /**
     * Load cached data on mount
     */
    useEffect(() => {
        const loadCachedData = async () => {
            try {
                // Load dark mode
                const darkRaw = await AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE);
                if (darkRaw) {
                    runIfMounted(() => setDarkMode(safeParseJSON<boolean>(darkRaw, true)));
                }

                // Load user profile
                const userRaw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
                if (userRaw) {
                    runIfMounted(() => setUser(safeParseJSON<UserProfile>(userRaw, defaultUser)));
                }

                // Load social accounts
                const socialRaw = await AsyncStorage.getItem(STORAGE_KEYS.SOCIAL_ACCOUNTS);
                if (socialRaw) {
                    runIfMounted(() => setSocialAccounts(safeParseJSON<CreatorSocialAccount[]>(socialRaw, [])));
                }
            } catch (error) {
                console.error('[ProfileContext] Error loading cached data:', error);
            } finally {
                runIfMounted(() => setIsLoading(false));
            }
        };
        loadCachedData();
    }, [runIfMounted]);

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
     * Copy referral code to clipboard
     */
    const copyReferralCode = useCallback(async (): Promise<boolean> => {
        try {
            const Clipboard = require('expo-clipboard');
            await Clipboard.setStringAsync(user.referralCode);
            return true;
        } catch (error) {
            console.error('Failed to copy referral code:', error);
            return false;
        }
    }, [user.referralCode]);

    /**
     * Toggle dark mode
     */
    const toggleDarkMode = useCallback(() => {
        setDarkMode((prev) => {
            const newValue = !prev;
            AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(newValue));
            return newValue;
        });
    }, []);

    /**
     * Fetch social accounts
     */
    const fetchSocialAccounts = useCallback(async () => {
        // Check feature flag first
        if (!featureFlags.isEnabled('USE_API_SOCIAL_CONNECT')) {
            runIfMounted(() => setSocialAccountsError(null));
            return; // Use cached data only
        }

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

    /**
     * Refresh social account
     */
    const refreshSocialAccount = useCallback(
        async (provider: SocialProvider) => {
            // Check feature flag first
            if (!featureFlags.isEnabled('USE_API_SOCIAL_CONNECT')) {
                runIfMounted(() => setSocialAccountsError('Social connect is disabled.'));
                return;
            }

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

    /**
     * Disconnect social account
     */
    const disconnectSocialAccount = useCallback(
        async (provider: SocialProvider) => {
            // Check feature flag first
            if (!featureFlags.isEnabled('USE_API_SOCIAL_CONNECT')) {
                runIfMounted(() => setSocialAccountsError('Social connect is disabled.'));
                return;
            }

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

    /**
     * Get social connect URL
     */
    const getSocialConnectUrl = useCallback((provider: SocialProvider): string | null => {
        // Check feature flag first
        if (!featureFlags.isEnabled('USE_API_SOCIAL_CONNECT')) {
            return null; // Disable connect URLs when flag is off
        }
        return socialConnectService.getConnectUrl(provider);
    }, []);

    /**
     * Handle social connect deep link callback
     */
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

    // Context value
    const value: ProfileContextType = {
        user,
        socialAccounts,
        socialAccountsLoading,
        socialAccountsError,
        darkMode,
        isLoading,
        updateUser,
        copyReferralCode,
        fetchSocialAccounts,
        refreshSocialAccount,
        disconnectSocialAccount,
        getSocialConnectUrl,
        toggleDarkMode,
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useProfile(): ProfileContextType {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}

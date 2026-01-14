/**
 * NotificationContext
 * Manages notification state, pagination, and read/unread functionality
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
import { AppState } from 'react-native';
import { Notification } from '@/src/types';
import { notificationService } from '@/src/api/services/notificationService';
import { adaptNotification } from '@/src/api/adapters';
import { handleAPIError, isNetworkError } from '@/src/api/errors';
import { featureFlags } from '@/src/config/featureFlags';
import { API_BASE_URL_READY } from '@/src/config/env';
import { getSecureItem } from '@/src/lib/secureStore';
import { getSession } from '@/src/lib/supabase';
import {
    useRunIfMounted,
    STORAGE_KEYS,
    loadFromCache,
    saveToCache,
    DEFAULT_PAGE_SIZE,
} from './contextUtils';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationContextType {
    // State
    notifications: Notification[];
    unreadNotificationCount: number;
    notificationsPage: number;
    notificationsHasMore: boolean;
    loadingNotifications: boolean;
    notificationsError: string | null;

    // Actions
    fetchNotifications: (options?: {
        page?: number;
        size?: number;
        refresh?: boolean;
    }) => Promise<void>;
    fetchUnreadNotificationCount: () => Promise<void>;
    markNotificationRead: (id: string) => Promise<void>;
    markAllNotificationsRead: () => Promise<void>;
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    loadMoreNotifications: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { runIfMounted } = useRunIfMounted();

    // State
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const [notificationsPage, setNotificationsPage] = useState(0);
    const [notificationsHasMore, setNotificationsHasMore] = useState(true);
    const [loadingNotifications, setLoadingNotifications] = useState(false);
    const [notificationsError, setNotificationsError] = useState<string | null>(null);

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
     * Fetch notifications with pagination
     */
    const fetchNotifications = useCallback(
        async ({ page = 0, size = DEFAULT_PAGE_SIZE, refresh = false } = {}) => {
            if (loadingNotifications) return;

            const shouldReplace = refresh || page === 0;

            runIfMounted(() => {
                setLoadingNotifications(true);
                setNotificationsError(null);
            });

            try {
                if (featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
                    if (!(await hasAuthToken())) {
                        if (__DEV__) {
                            console.log('[Notifications] Skipping fetch until auth token is ready.');
                        }
                        runIfMounted(() => {
                            setLoadingNotifications(false);
                            setNotificationsError('Login required to load notifications.');
                        });
                        return;
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
                            totalCount !== null
                                ? loadedCount < totalCount && adapted.length > 0
                                : adapted.length === size
                        );
                    });

                    if (mergedNotifications.length > 0 || shouldReplace) {
                        await saveToCache('notifications', mergedNotifications);
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
                    setNotificationsError(apiError.message);
                });

                // Load from cache on network error
                if (isNetworkError(apiError)) {
                    const cached = await loadFromCache<Notification[]>('notifications');
                    if (cached) runIfMounted(() => setNotifications(cached));
                }
            } finally {
                runIfMounted(() => setLoadingNotifications(false));
            }
        },
        [loadingNotifications, runIfMounted, hasAuthToken]
    );

    /**
     * Fetch unread notification count
     */
    const fetchUnreadNotificationCount = useCallback(async () => {
        if (!featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
            runIfMounted(() => setUnreadNotificationCount(0));
            return;
        }

        if (!(await hasAuthToken())) {
            if (__DEV__) {
                console.log('[Notifications] Skipping unread count until auth token is ready.');
            }
            runIfMounted(() => setNotificationsError('Login required to load notifications.'));
            return;
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
    }, [runIfMounted, hasAuthToken]);

    /**
     * Mark single notification as read
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
                            prev.map((n) => (n.id === id ? { ...n, read: previousReadState } : n))
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
        runIfMounted(() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        );

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
     * Add notification locally (for mock mode)
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
     * Load more notifications (pagination helper)
     */
    const loadMoreNotifications = useCallback(async () => {
        if (!notificationsHasMore || loadingNotifications) return;
        await fetchNotifications({ page: notificationsPage + 1, size: DEFAULT_PAGE_SIZE });
    }, [notificationsHasMore, loadingNotifications, notificationsPage, fetchNotifications]);

    /**
     * Refresh notifications (pull-to-refresh helper)
     */
    const refreshNotifications = useCallback(async () => {
        await fetchNotifications({ page: 0, size: DEFAULT_PAGE_SIZE, refresh: true });
        await fetchUnreadNotificationCount();
    }, [fetchNotifications, fetchUnreadNotificationCount]);

    // Bootstrap notifications when mounted
    useEffect(() => {
        if (!featureFlags.isEnabled('USE_API_NOTIFICATIONS')) {
            return;
        }
        fetchNotifications({ page: 0, size: DEFAULT_PAGE_SIZE, refresh: true });
        fetchUnreadNotificationCount();
    }, []);

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

    // Context value
    const value: NotificationContextType = {
        notifications,
        unreadNotificationCount,
        notificationsPage,
        notificationsHasMore,
        loadingNotifications,
        notificationsError,
        fetchNotifications,
        fetchUnreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        loadMoreNotifications,
        refreshNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useNotification(): NotificationContextType {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}

// Legacy alias for compatibility
export const useNotifications = useNotification;

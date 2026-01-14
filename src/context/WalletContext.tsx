/**
 * WalletContext
 * Manages wallet summary, transactions, and withdrawals with pagination
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
import { WalletDTO, TransactionDTO, WithdrawalDTO } from '@/src/api/types';
import { walletService } from '@/src/api/services/walletService';
import { handleAPIError, isNetworkError } from '@/src/api/errors';
import { featureFlags } from '@/src/config/featureFlags';
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

export interface WalletContextType {
    // State
    wallet: WalletDTO | null;
    transactions: TransactionDTO[];
    withdrawals: WithdrawalDTO[];
    walletLoading: boolean;
    transactionsLoading: boolean;
    withdrawalsLoading: boolean;
    walletError: string | null;
    transactionsError: string | null;
    withdrawalsError: string | null;
    transactionsPage: number;
    transactionsHasMore: boolean;
    withdrawalsPage: number;
    withdrawalsHasMore: boolean;

    // Actions
    fetchWalletSummary: () => Promise<void>;
    fetchTransactions: (params?: { page?: number; size?: number; refresh?: boolean }) => Promise<void>;
    fetchWithdrawals: (params?: { page?: number; size?: number; refresh?: boolean }) => Promise<void>;
    refreshWalletAll: () => Promise<void>;
    loadMoreTransactions: () => Promise<void>;
    loadMoreWithdrawals: () => Promise<void>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: ReactNode }) {
    const { runIfMounted } = useRunIfMounted();

    // State
    const [wallet, setWallet] = useState<WalletDTO | null>(null);
    const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalDTO[]>([]);
    const [walletLoading, setWalletLoading] = useState(false);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
    const [walletError, setWalletError] = useState<string | null>(null);
    const [transactionsError, setTransactionsError] = useState<string | null>(null);
    const [withdrawalsError, setWithdrawalsError] = useState<string | null>(null);
    const [transactionsPage, setTransactionsPage] = useState(0);
    const [transactionsHasMore, setTransactionsHasMore] = useState(true);
    const [withdrawalsPage, setWithdrawalsPage] = useState(0);
    const [withdrawalsHasMore, setWithdrawalsHasMore] = useState(true);

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
     * Fetch wallet summary
     */
    const fetchWalletSummary = useCallback(async () => {
        if (walletLoading) return;

        try {
            if (featureFlags.isEnabled('USE_API_WALLET')) {
                if (!(await hasAuthToken())) {
                    if (__DEV__) {
                        console.log('[Wallet] Skipping fetch — no auth token yet');
                    }
                    runIfMounted(() => {
                        setWalletError('Login required to load wallet.');
                    });
                    return;
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
                await saveToCache('wallet', apiWallet);
                await AsyncStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(apiWallet));
            } else {
                runIfMounted(() => setWallet(null));
            }
        } catch (err) {
            const apiError = handleAPIError(err);
            runIfMounted(() => {
                setWalletError(apiError.message);
            });

            if (isNetworkError(apiError)) {
                const cached = await loadFromCache<WalletDTO>('wallet');
                if (cached) runIfMounted(() => setWallet(cached));
            }
        } finally {
            runIfMounted(() => setWalletLoading(false));
        }
    }, [walletLoading, runIfMounted, hasAuthToken]);

    /**
     * Fetch transactions with pagination
     */
    const fetchTransactions = useCallback(
        async ({ page = 0, size = DEFAULT_PAGE_SIZE, refresh = false } = {}) => {
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

                    if (!(await hasAuthToken())) {
                        if (__DEV__) {
                            console.log('[Wallet] Skipping transactions fetch — no auth token yet');
                        }
                        runIfMounted(() => {
                            setTransactionsError('Login required to load transactions.');
                        });
                        return;
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
                            totalCount !== null
                                ? loadedCount < totalCount && result.items.length > 0
                                : result.items.length === size
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
                    setTransactionsError(apiError.message);
                });
            } finally {
                runIfMounted(() => setTransactionsLoading(false));
            }
        },
        [transactionsLoading, runIfMounted, hasAuthToken]
    );

    /**
     * Fetch withdrawals with pagination
     */
    const fetchWithdrawals = useCallback(
        async ({ page = 0, size = DEFAULT_PAGE_SIZE, refresh = false } = {}) => {
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

                    if (!(await hasAuthToken())) {
                        if (__DEV__) {
                            console.log('[Wallet] Skipping withdrawals fetch — no auth token yet');
                        }
                        runIfMounted(() => {
                            setWithdrawalsError('Login required to load withdrawals.');
                        });
                        return;
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
                            totalCount !== null
                                ? loadedCount < totalCount && result.items.length > 0
                                : result.items.length === size
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
                    setWithdrawalsError(apiError.message);
                });
            } finally {
                runIfMounted(() => setWithdrawalsLoading(false));
            }
        },
        [withdrawalsLoading, runIfMounted, hasAuthToken]
    );

    /**
     * Refresh all wallet data
     */
    const refreshWalletAll = useCallback(async () => {
        await Promise.all([
            fetchWalletSummary(),
            fetchTransactions({ page: 0, size: DEFAULT_PAGE_SIZE, refresh: true }),
            fetchWithdrawals({ page: 0, size: DEFAULT_PAGE_SIZE, refresh: true }),
        ]);
    }, [fetchWalletSummary, fetchTransactions, fetchWithdrawals]);

    /**
     * Load more transactions (pagination helper)
     */
    const loadMoreTransactions = useCallback(async () => {
        if (!transactionsHasMore || transactionsLoading) return;
        await fetchTransactions({ page: transactionsPage + 1, size: DEFAULT_PAGE_SIZE });
    }, [transactionsHasMore, transactionsLoading, transactionsPage, fetchTransactions]);

    /**
     * Load more withdrawals (pagination helper)
     */
    const loadMoreWithdrawals = useCallback(async () => {
        if (!withdrawalsHasMore || withdrawalsLoading) return;
        await fetchWithdrawals({ page: withdrawalsPage + 1, size: DEFAULT_PAGE_SIZE });
    }, [withdrawalsHasMore, withdrawalsLoading, withdrawalsPage, fetchWithdrawals]);

    // Context value
    const value: WalletContextType = {
        wallet,
        transactions,
        withdrawals,
        walletLoading,
        transactionsLoading,
        withdrawalsLoading,
        walletError,
        transactionsError,
        withdrawalsError,
        transactionsPage,
        transactionsHasMore,
        withdrawalsPage,
        withdrawalsHasMore,
        fetchWalletSummary,
        fetchTransactions,
        fetchWithdrawals,
        refreshWalletAll,
        loadMoreTransactions,
        loadMoreWithdrawals,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useWallet(): WalletContextType {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}

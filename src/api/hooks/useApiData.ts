/**
 * Custom hooks for API data fetching with loading states and error handling
 */

import { useState, useCallback, useEffect } from 'react';
import { ApiError } from '../types';
import { cacheUtils } from '../utils/cache';

interface UseApiDataState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  refreshing: boolean;
}

interface UseApiDataOptions {
  cacheKey?: string;
  cacheTTL?: number;
  autoFetch?: boolean;
  onError?: (error: ApiError) => void;
}

/**
 * Hook for fetching data with loading and error states
 */
export function useApiData<T>(
  fetchFn: () => Promise<T>,
  options: UseApiDataOptions = {}
): [UseApiDataState<T>, () => Promise<void>, () => void] {
  const { cacheKey, cacheTTL, autoFetch = true, onError } = options;

  const [state, setState] = useState<UseApiDataState<T>>({
    data: null,
    loading: autoFetch,
    error: null,
    refreshing: false,
  });

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setState((prev) => ({ ...prev, refreshing: true, error: null }));
    } else {
      setState((prev) => ({ ...prev, loading: true, error: null }));
    }

    try {
      // Try cache first if not refreshing
      if (cacheKey && !isRefresh) {
        const cached = await cacheUtils.get<T>(cacheKey);
        if (cached) {
          setState({ data: cached, loading: false, error: null, refreshing: false });
          // Fetch in background to update cache
          fetchFn()
            .then((data) => {
              cacheUtils.set(cacheKey, data, cacheTTL);
              setState((prev) => ({ ...prev, data }));
            })
            .catch(() => {
              // Silently fail background refresh
            });
          return;
        }
      }

      // Fetch from API
      const data = await fetchFn();

      // Cache the result
      if (cacheKey) {
        await cacheUtils.set(cacheKey, data, cacheTTL);
      }

      setState({ data, loading: false, error: null, refreshing: false });
    } catch (error) {
      const apiError = error as ApiError;

      // Try to return cached data on error
      if (cacheKey) {
        const cached = await cacheUtils.get<T>(cacheKey);
        if (cached) {
          setState({
            data: cached,
            loading: false,
            error: apiError,
            refreshing: false,
          });
          if (onError) onError(apiError);
          return;
        }
      }

      setState({ data: null, loading: false, error: apiError, refreshing: false });
      if (onError) onError(apiError);
    }
  }, [fetchFn, cacheKey, cacheTTL, onError]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null, refreshing: false });
    if (cacheKey) {
      cacheUtils.remove(cacheKey);
    }
  }, [cacheKey]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return [state, refresh, reset];
}

/**
 * Hook for paginated data with infinite scroll support
 */
export function usePaginatedApiData<T>(
  fetchFn: (page: number, size: number) => Promise<{ items: T[]; total: number; hasMore: boolean }>,
  pageSize = 20
): {
  items: T[];
  loading: boolean;
  error: ApiError | null;
  refreshing: boolean;
  hasMore: boolean;
  total: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
} {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const loadPage = useCallback(
    async (pageNum: number, isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
        setPage(0);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await fetchFn(pageNum, pageSize);

        if (isRefresh) {
          setItems(response.items);
          setPage(1);
        } else {
          setItems((prev) => (pageNum === 0 ? response.items : [...prev, ...response.items]));
          setPage((prev) => prev + 1);
        }

        setHasMore(response.hasMore);
        setTotal(response.total);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchFn, pageSize]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || refreshing) return;
    await loadPage(page);
  }, [hasMore, loading, refreshing, page, loadPage]);

  const refresh = useCallback(async () => {
    await loadPage(0, true);
  }, [loadPage]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    setTotal(0);
    setError(null);
  }, []);

  useEffect(() => {
    loadPage(0);
  }, []);

  return {
    items,
    loading,
    error,
    refreshing,
    hasMore,
    total,
    loadMore,
    refresh,
    reset,
  };
}


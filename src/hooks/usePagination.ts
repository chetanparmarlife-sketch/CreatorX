/**
 * Pagination hook for handling paginated API responses
 * Provides loading states, refresh, and load more functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { Page } from '@/src/api/types';

export interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  autoLoad?: boolean;
}

export interface UsePaginationResult<T> {
  data: T[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: Error | null;
  page: number;
  hasMore: boolean;
  total: number;
  totalPages: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook for managing paginated data
 * @param fetchFn - Function that fetches paginated data
 * @param options - Configuration options
 * @returns Pagination state and methods
 */
export function usePagination<T>(
  fetchFn: (page: number, size: number) => Promise<Page<T>>,
  options: UsePaginationOptions = {}
): UsePaginationResult<T> {
  const {
    initialPage = 0,
    pageSize = 20,
    autoLoad = true,
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  /**
   * Load more data (next page)
   */
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || refreshing) return;

    setLoadingMore(true);
    setError(null);

    try {
      const result = await fetchFn(page, pageSize);
      
      setData((prev) => [...prev, ...result.items]);
      setPage((prev) => prev + 1);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setHasMore(result.page < result.totalPages - 1);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load more');
      setError(error);
      console.error('Load more error:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [page, pageSize, hasMore, loadingMore, refreshing, fetchFn]);

  /**
   * Refresh data (reset to first page)
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    setPage(initialPage);
    setHasMore(true);

    try {
      const result = await fetchFn(initialPage, pageSize);
      
      setData(result.items);
      setPage(initialPage + 1);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setHasMore(result.page < result.totalPages - 1);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to refresh');
      setError(error);
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [initialPage, pageSize, fetchFn]);

  /**
   * Reset pagination state
   */
  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    setTotal(0);
    setTotalPages(0);
  }, [initialPage]);

  /**
   * Initial load
   */
  useEffect(() => {
    if (autoLoad) {
      setLoading(true);
      refresh().finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    refreshing,
    loadingMore,
    error,
    page,
    hasMore,
    total,
    totalPages,
    loadMore,
    refresh,
    reset,
  };
}



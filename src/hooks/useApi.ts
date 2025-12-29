/**
 * Custom hook for API calls with loading and error states
 */

import { useState, useCallback } from 'react';
import { ApiError } from '@/src/api/types';
import { cacheUtils } from '@/src/api/utils/cache';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

interface UseApiOptions {
  cacheKey?: string;
  cacheTTL?: number;
  skipCache?: boolean;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): [UseApiState<T>, () => Promise<void>, () => void] {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Try to get from cache first if cacheKey is provided
      if (options.cacheKey && !options.skipCache) {
        const cached = await cacheUtils.get<T>(options.cacheKey);
        if (cached) {
          setState({ data: cached, loading: false, error: null });
          // Still fetch in background to update cache
          apiCall()
            .then((data) => {
              cacheUtils.set(options.cacheKey!, data, options.cacheTTL);
              setState((prev) => ({ ...prev, data }));
            })
            .catch(() => {
              // Silently fail background refresh
            });
          return;
        }
      }

      // Fetch from API
      const data = await apiCall();

      // Cache the result if cacheKey is provided
      if (options.cacheKey) {
        await cacheUtils.set(options.cacheKey, data, options.cacheTTL);
      }

      setState({ data, loading: false, error: null });
    } catch (error) {
      const apiError = error as ApiError;
      
      // Try to return cached data on error if available
      if (options.cacheKey) {
        const cached = await cacheUtils.get<T>(options.cacheKey);
        if (cached) {
          setState({ data: cached, loading: false, error: apiError });
          return;
        }
      }

      setState({ data: null, loading: false, error: apiError });
    }
  }, [apiCall, options.cacheKey, options.cacheTTL, options.skipCache]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
    if (options.cacheKey) {
      cacheUtils.remove(options.cacheKey);
    }
  }, [options.cacheKey]);

  return [state, execute, reset];
}


/**
 * Axios API client with JWT token interceptor, refresh token logic, and error handling
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_BASE_URL_READY, API_TIMEOUT, STORAGE_KEYS } from '@/src/config/env';
import { APIError, normalizeApiError } from './errors';
import { deleteSecureItem, getSecureItem, setSecureItem } from '@/src/lib/secureStore';
import { getSession } from '@/src/lib/supabase';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL || undefined,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();

    if (__DEV__) {
      console.log('[API] Base URL:', API_BASE_URL);
    }
  }

  private setupInterceptors() {
    // Request interceptor - attach JWT token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (!API_BASE_URL_READY) {
          return Promise.reject(
            normalizeApiError({ code: 'CONFIG_MISSING', message: 'API base URL missing. Configure EXPO_PUBLIC_API_BASE_URL.' })
          );
        }

        // Skip token attachment for auth endpoints
        if (config.url?.includes('/auth/register') || 
            config.url?.includes('/auth/login') ||
            config.url?.includes('/auth/forgot-password') ||
            config.url?.includes('/auth/verify-otp') ||
            config.url?.includes('/auth/refresh-token') ||
            config.url?.includes('/auth/refresh')) {
          return config;
        }

        const baseURL = config.baseURL || API_BASE_URL;
        if (!__DEV__ && baseURL?.startsWith('http://')) {
          throw new Error(
            'Refusing to use insecure HTTP API base URL. Set EXPO_PUBLIC_API_BASE_URL=https://<host>/api/v1.'
          );
        }
        if (__DEV__ && baseURL?.startsWith('http://') && !baseURL.includes('localhost')) {
          console.warn(`[API] Insecure base URL in dev: ${baseURL}`);
        }

        try {
          const storedToken = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
          let token = storedToken;
          if (!token) {
            const session = await getSession().catch(() => null);
            token = session?.access_token ?? null;
            if (token) {
              await setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, token);
            }
          }
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          if (!token) {
            return Promise.reject(
              normalizeApiError({ code: 'AUTH_REQUIRED', message: 'Login required to access this resource.' })
            );
          }
        } catch (error) {
          console.error('Error getting token from storage:', error);
        }

        // Log request in development
        if (__DEV__) {
          const requestUrl = config.url || '';
          const normalizedBase = baseURL?.replace(/\/+$/, '') || '';
          const normalizedPath = requestUrl.startsWith('http')
            ? requestUrl
            : `${normalizedBase}${requestUrl.startsWith('/') ? '' : '/'}${requestUrl}`;
          const hasAuthHeader = Boolean(config.headers?.Authorization);

          console.log('[API Request]', {
            method: config.method,
            url: requestUrl,
            baseURL,
            fullUrl: normalizedPath,
            hasAuthHeader,
            params: config.params,
            data: config.data,
          });
        }

        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors and refresh token
    this.client.interceptors.response.use(
      (response) => {
        // Log response in development
        if (__DEV__) {
          console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }
        return response;
      },
      async (error: AxiosError<APIError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise<string | null>((resolve, reject) => {
              this.failedQueue.push({ 
                resolve: resolve as (value?: unknown) => void, 
                reject 
              });
            })
              .then((token) => {
                if (token && originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Get refresh token from storage
            const refreshToken = await getSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
            
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Call backend refresh token endpoint
            const refreshResponse = await axios.post<{ accessToken: string; refreshToken?: string }>(
              `${API_BASE_URL}/auth/refresh`,
              { refreshToken },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );

            const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

            // Store new tokens
            await setSecureItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            if (newRefreshToken) {
              await setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
            }

            // Update authorization header
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            // Process queued requests with new token
            this.processQueue(null, accessToken);

            // Retry original request
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            this.processQueue(refreshError, null);
            await this.clearAuth();
            
            // You might want to emit an event here to trigger navigation to login
            // For now, we'll just reject the error
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        const normalizedError = normalizeApiError(error);
        if (__DEV__) {
          console.warn('[API Error]', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            status: normalizedError.status,
            message: normalizedError.message,
            code: normalizedError.code,
          });
        }

        return Promise.reject(normalizedError);
      }
    );
  }

  private processQueue(error: unknown, token: string | null = null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private async clearAuth() {
    try {
      await deleteSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
      await deleteSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER]);
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  }

  // Public methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // For file uploads (multipart/form-data)
  async postFormData<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

/**
 * API Client for CreatorX Brand Dashboard
 * 
 * Handles all HTTP requests to the backend API with:
 * - Automatic JWT token injection in headers
 * - 401 response handling with automatic token refresh
 * - Request queuing during token refresh
 * - Redirect to login on auth failure
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { tokenStorage } from '@/lib/auth/tokenStorage'

// ==================== Types ====================

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  details?: Record<string, string>
}

// ==================== API Client Class ====================

class ApiClient {
  private client: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (reason?: unknown) => void
  }> = []

  constructor() {
    const baseURL = this.resolveBaseUrl()

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      // Include cookies in requests
      withCredentials: true,
    })

    this.setupInterceptors()
  }

  private resolveBaseUrl(): string {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || ''
    const isProd = process.env.NODE_ENV === 'production'
    const isLocal = baseURL.includes('localhost') || baseURL.includes('127.0.0.1')
    const isBuildTime = typeof window === 'undefined'

    if (!baseURL) {
      if (isProd && !isBuildTime) {
        console.error('[API] NEXT_PUBLIC_API_BASE_URL is not set in production runtime.')
      } else if (!isProd) {
        console.warn('[API] NEXT_PUBLIC_API_BASE_URL is not set; API calls will fail.')
      }
      // Return empty — build-time prerendering doesn't need a real URL.
      return ''
    }

    if (isProd && isLocal) {
      throw new Error('Refusing to use localhost API base URL in production.')
    }

    return baseURL
  }

  private setupInterceptors() {
    // ==================== Request Interceptor ====================
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        // Let browser set Content-Type for FormData (includes correct boundary)
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type']
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // ==================== Response Interceptor ====================
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Don't retry for login/refresh endpoints
          if (originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/refresh')) {
            return Promise.reject(this.formatError(error))
          }

          if (this.isRefreshing) {
            // Queue this request while refresh is in progress
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`
                }
                return this.client(originalRequest)
              })
              .catch((err) => Promise.reject(err))
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const newToken = await this.performTokenRefresh()

            if (newToken) {
              await this.setTokens(newToken)
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`
              }
              this.processQueue(null, newToken)
              return this.client(originalRequest)
            } else {
              // Refresh failed, redirect to login
              await this.handleAuthFailure()
              return Promise.reject(this.formatError(error))
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null)
            await this.handleAuthFailure()
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
          console.warn('[API] Access forbidden:', originalRequest.url)
        }

        return Promise.reject(this.formatError(error))
      }
    )
  }

  /**
   * Perform token refresh via backend endpoint
   */
  private async performTokenRefresh(): Promise<string | null> {
    try {
      // Refresh through a Next.js route that reads the HttpOnly refresh cookie instead of localStorage.
      const response = await fetch('/api/auth/refresh-token', { method: 'POST' })

      if (response.ok) {
        const data = await response.json()
        const token = data.token as string | undefined
        if (!token) return null
        // Store refreshed token in HttpOnly cookies via API route instead of localStorage.
        await this.setTokens(token)

        console.log('[API] Token refreshed successfully')
        return token
      }

      return null
    } catch (error) {
      console.error('[API] Token refresh failed:', error)
      return null
    }
  }

  /**
   * Process queued requests after refresh
   */
  private processQueue(error: unknown, token: string | null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error)
      } else {
        promise.resolve(token)
      }
    })
    this.failedQueue = []
  }

  /**
   * Handle authentication failure - clear data and redirect
   */
  private async handleAuthFailure() {
    await this.clearAuth()

    if (typeof window !== 'undefined') {
      // Store current path for redirect after login
      const currentPath = window.location.pathname
      if (currentPath !== '/login') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
      }
    }
  }

  /**
   * Format error into consistent structure
   */
  private formatError(error: AxiosError<ApiError>): ApiError {
    return {
      timestamp: new Date().toISOString(),
      status: error.response?.status || 500,
      error: error.response?.data?.error || 'Request Failed',
      message: error.response?.data?.message || error.message || 'An error occurred',
      path: error.config?.url || '',
      details: error.response?.data?.details,
    }
  }

  // ==================== Token Management ====================

  private async getAccessToken(): Promise<string | null> {
    // Read access token through the HttpOnly cookie route instead of localStorage.
    return tokenStorage.getAccessToken()
  }

  public async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    // Store tokens through secure HttpOnly cookie route instead of localStorage.setItem.
    await tokenStorage.setTokens(accessToken, refreshToken)
  }

  public async clearAuth(): Promise<void> {
    // Clear tokens through secure HttpOnly cookie route instead of localStorage.removeItem.
    await tokenStorage.clearTokens()
  }

  // ==================== HTTP Methods ====================

  public async get<T>(url: string, config?: Partial<InternalAxiosRequestConfig>): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  public async post<T>(url: string, data?: unknown, config?: Partial<InternalAxiosRequestConfig>): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  public async put<T>(url: string, data?: unknown, config?: Partial<InternalAxiosRequestConfig>): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  public async patch<T>(url: string, data?: unknown, config?: Partial<InternalAxiosRequestConfig>): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  public async delete<T>(url: string, config?: Partial<InternalAxiosRequestConfig>): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  /**
   * Upload file with multipart form data
   */
  public async upload<T>(url: string, formData: FormData): Promise<T> {
    // Axios automatically sets the correct Content-Type with boundary for FormData
    const response = await this.client.post<T>(url, formData)
    return response.data
  }
}

// ==================== Export Singleton ====================

export const apiClient = new ApiClient()

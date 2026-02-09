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

// ==================== Types ====================

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  details?: Record<string, string>
}

// ==================== Storage Keys ====================

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'creatorx_access_token',
  REFRESH_TOKEN: 'creatorx_refresh_token',
  USER: 'creatorx_user',
  TOKEN_EXPIRY: 'creatorx_token_expiry',
} as const

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

    if (!baseURL) {
      if (isProd) {
        throw new Error('NEXT_PUBLIC_API_BASE_URL is required in production.')
      }
      console.warn('[API] NEXT_PUBLIC_API_BASE_URL is not set; API calls will fail.')
    }

    if (isProd && isLocal) {
      throw new Error('Refusing to use localhost API base URL in production.')
    }

    return baseURL
  }

  private setupInterceptors() {
    // ==================== Request Interceptor ====================
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken()
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
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
              this.setTokens(newToken)
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`
              }
              this.processQueue(null, newToken)
              return this.client(originalRequest)
            } else {
              // Refresh failed, redirect to login
              this.handleAuthFailure()
              return Promise.reject(this.formatError(error))
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null)
            this.handleAuthFailure()
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
      const refreshToken = this.getRefreshToken()

      if (!refreshToken) {
        console.warn('[API] No refresh token available')
        return null
      }

      // Call backend refresh endpoint
      const response = await axios.post<{ token: string; expiresIn: number }>(
        `${this.client.defaults.baseURL}/auth/refresh-token`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (response.data?.token) {
        // Update stored token and expiry
        const expiryTime = Date.now() + (response.data.expiresIn * 1000)

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.token)
          localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString())

          // Also update cookie for middleware
          const secure = window.location.protocol === 'https:' ? '; Secure' : ''
          document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=${response.data.token}; Path=/; Max-Age=${response.data.expiresIn}${secure}; SameSite=Lax`
        }

        console.log('[API] Token refreshed successfully')
        return response.data.token
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
  private handleAuthFailure() {
    this.clearAuth()

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

  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  public setTokens(accessToken: string, refreshToken?: string): void {
    if (typeof window === 'undefined') return

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken)

    if (refreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
    }
  }

  public clearAuth(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY)

    // Clear cookie
    document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
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

/**
 * API Client for CreatorX Admin Dashboard
 * 
 * Handles all HTTP requests with JWT token management,
 * automatic token refresh, and error handling.
 * Uses admin-specific storage keys.
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

// Admin-specific storage keys (separate from brand dashboard)
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'creatorx_admin_access_token',
  REFRESH_TOKEN: 'creatorx_admin_refresh_token',
  USER: 'creatorx_admin_user',
  TOKEN_EXPIRY: 'creatorx_admin_token_expiry',
} as const

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
      withCredentials: true,
    })

    this.setupInterceptors()
  }

  private resolveBaseUrl(): string {
    // Use environment variable or fallback to placeholder that gets replaced at runtime
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || ''

    if (!baseURL && typeof window !== 'undefined') {
      console.warn('[Admin API] NEXT_PUBLIC_API_BASE_URL is not set. API calls will fail.')
    }

    return baseURL
  }

  private setupInterceptors() {
    // Request interceptor - add JWT token
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

    // Response interceptor - handle 401 and refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/refresh')) {
            return Promise.reject(this.formatError(error))
          }

          if (this.isRefreshing) {
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

        return Promise.reject(this.formatError(error))
      }
    )
  }

  private async performTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) return null

      const response = await axios.post<{ token: string; expiresIn: number }>(
        `${this.client.defaults.baseURL}/auth/refresh-token`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (response.data?.token) {
        const expiresAt = Date.now() + (response.data.expiresIn * 1000)

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.token)
          localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiresAt.toString())

          // Update cookie for middleware
          const secure = window.location.protocol === 'https:' ? '; Secure' : ''
          document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=${response.data.token}; Path=/; Max-Age=${response.data.expiresIn}${secure}; SameSite=Lax`
        }

        return response.data.token
      }

      return null
    } catch (error) {
      console.error('[Admin API] Token refresh failed:', error)
      return null
    }
  }

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

  private handleAuthFailure() {
    this.clearAuth()
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      if (currentPath !== '/login') {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
      }
    }
  }

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

  // Token management
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

    document.cookie = `${STORAGE_KEYS.ACCESS_TOKEN}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }

  // HTTP methods
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

  public async getBlob(url: string, config?: Partial<InternalAxiosRequestConfig>): Promise<Blob> {
    const response = await this.client.get(url, { ...config, responseType: 'blob' })
    return response.data as Blob
  }
}

export const apiClient = new ApiClient()

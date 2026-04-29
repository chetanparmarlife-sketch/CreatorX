/**
 * API Client for CreatorX Admin Dashboard
 * 
 * Handles all HTTP requests with JWT token management,
 * automatic token refresh, and error handling.
 * Uses HttpOnly cookie-backed token storage instead of localStorage token keys.
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
    // Support both NEXT_PUBLIC_API_URL and NEXT_PUBLIC_API_BASE_URL for compatibility
    const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || ''

    if (!baseURL && typeof window !== 'undefined') {
      console.warn('[Admin API] NEXT_PUBLIC_API_URL is not set. API calls will fail.')
    }

    return baseURL
  }

  private setupInterceptors() {
    // Request interceptor - add JWT token from HttpOnly cookie route instead of localStorage.
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAccessToken()
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
              // Refresh route already rotated HttpOnly cookies, so do not rewrite tokens in localStorage.
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`
              }
              this.processQueue(null, newToken)
              return this.client(originalRequest)
            } else {
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

        return Promise.reject(this.formatError(error))
      }
    )
  }

  private async performTokenRefresh(): Promise<string | null> {
    try {
      // Refresh through a Next.js route that reads the HttpOnly refresh cookie instead of localStorage.
      const response = await fetch('/api/auth/refresh-token', { method: 'POST' })

      if (response.ok) {
        const data = await response.json()
        const token = data.token as string | undefined
        if (!token) return null
        // Refresh route already stores the refreshed admin token in HttpOnly cookies instead of localStorage.

        return token
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

  private async handleAuthFailure() {
    // Clear HttpOnly token cookies via API route instead of localStorage token removal.
    await this.clearAuth()
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
  private async getAccessToken(): Promise<string | null> {
    // Read access token through the HttpOnly cookie route instead of localStorage.
    return tokenStorage.getAccessToken()
  }

  public async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    // Store admin tokens through secure HttpOnly cookie route instead of localStorage.setItem.
    await tokenStorage.setTokens(accessToken, refreshToken)
  }

  public async clearAuth(): Promise<void> {
    // Clear admin tokens through secure HttpOnly cookie route instead of localStorage.removeItem.
    await tokenStorage.clearTokens()
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

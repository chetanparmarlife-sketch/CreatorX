/**
 * API Client for CreatorX Brand Dashboard
 * 
 * This client handles all HTTP requests to the backend API.
 * It includes JWT token management, automatic token refresh,
 * request/response interceptors, and error handling.
 * 
 * Architecture matches the React Native app's API client.
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { ApiError } from '@/lib/types'

// Storage keys (using localStorage for web, similar to AsyncStorage in RN)
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'creatorx_access_token',
  REFRESH_TOKEN: 'creatorx_refresh_token',
  USER: 'creatorx_user',
} as const

class ApiClient {
  private client: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: unknown) => void
    reject: (reason?: unknown) => void
  }> = []

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:8080/api/v1'

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
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
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - handle errors and refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Queue request while token is being refreshed
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`
                }
                return this.client(originalRequest)
              })
              .catch((err) => {
                return Promise.reject(err)
              })
          }

          originalRequest._retry = true
          this.isRefreshing = true

          try {
            const newToken = await this.refreshToken()
            if (newToken) {
              this.setAccessToken(newToken)
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`
              }
              this.processQueue(null)
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            this.processQueue(refreshError)
            this.clearAuth()
            // Redirect to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login'
            }
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        // Handle other errors
        const apiError: ApiError = {
          timestamp: new Date().toISOString(),
          status: error.response?.status || 500,
          error: error.response?.data?.error || 'Unknown Error',
          message: error.response?.data?.message || error.message || 'An error occurred',
          path: error.config?.url || '',
          details: error.response?.data?.details,
        }

        return Promise.reject(apiError)
      }
    )
  }

  private async refreshToken(): Promise<string | null> {
    try {
      // Try to refresh using Supabase if available
      if (typeof window !== 'undefined' && (window as any).supabase) {
        const { data, error } = await (window as any).supabase.auth.refreshSession()
        if (!error && data?.session?.access_token) {
          return data.session.access_token
        }
      }

      // Fallback: use stored refresh token
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      // Call backend refresh endpoint if available
      // For now, return null to trigger re-authentication
      return null
    } catch (error) {
      console.error('Token refresh failed:', error)
      return null
    }
  }

  private processQueue(error: unknown) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error)
      } else {
        promise.resolve(this.getAccessToken())
      }
    })
    this.failedQueue = []
  }

  // Token management
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  }

  private setAccessToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
  }

  private setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token)
  }

  public setTokens(accessToken: string, refreshToken?: string): void {
    this.setAccessToken(accessToken)
    if (refreshToken) {
      this.setRefreshToken(refreshToken)
    }
  }

  public clearAuth(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER)
  }

  // HTTP methods
  public async get<T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  public async post<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  public async put<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  public async patch<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  public async delete<T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
}

// Export singleton instance
export const apiClient = new ApiClient()


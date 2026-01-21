/**
 * Authentication API Service - Brand Dashboard
 *
 * PRODUCTION IMPLEMENTATION: Uses backend JWT authentication.
 * NO DEMO MODE - All authentication requires real credentials.
 *
 * Backend endpoints:
 * - POST /api/v1/auth/login → { token, user, expiresIn }
 * - POST /api/v1/auth/refresh-token → { token, expiresIn }
 * - POST /api/v1/auth/logout
 * - GET /api/v1/auth/me → user profile
 */

import { apiClient } from './client'
import type { UserRole } from '@/lib/types'

// ==================== Types ====================

export interface User {
  id: string
  email: string
  role: UserRole
  name?: string
  companyName?: string
  createdAt?: string
}

export interface LoginResponse {
  token: string
  user: User
  expiresIn: number // seconds until token expires
}

export interface RefreshResponse {
  token: string
  expiresIn: number
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// ==================== Storage Keys ====================

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'creatorx_access_token',
  REFRESH_TOKEN: 'creatorx_refresh_token',
  USER: 'creatorx_user',
  TOKEN_EXPIRY: 'creatorx_token_expiry',
} as const

// Token refresh buffer - refresh 2 minutes before expiry
const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000

// ==================== Cookie Helpers ====================

/**
 * Set a cookie with security options
 */
function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  const sameSite = '; SameSite=Lax'

  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}${secure}${sameSite}`
}

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null

  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

/**
 * Delete a cookie
 */
function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

// ==================== Token Storage (Hybrid: Cookie + localStorage) ====================

/**
 * Store authentication tokens
 * Uses cookies for access token (accessible by middleware) + localStorage for user data
 */
function storeAuthData(token: string, user: User, expiresIn: number): void {
  if (typeof window === 'undefined') return

  // Store token in cookie (accessible by middleware)
  setCookie(STORAGE_KEYS.ACCESS_TOKEN, token, expiresIn)

  // Also store in localStorage for client-side access
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)

  // Store expiry time
  const expiryTime = Date.now() + (expiresIn * 1000)
  localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiryTime.toString())

  // Store user data
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

  // Update API client
  apiClient.setTokens(token)
}

/**
 * Store refresh token
 */
function storeRefreshToken(refreshToken: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
}

/**
 * Clear all authentication data
 */
function clearAuthData(): void {
  if (typeof window === 'undefined') return

  // Clear cookie
  deleteCookie(STORAGE_KEYS.ACCESS_TOKEN)

  // Clear localStorage
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY)

  // Clear API client
  apiClient.clearAuth()
}

// ==================== Public API ====================

/**
 * Login with email and password
 * Authenticates with backend and stores JWT token
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    })

    if (!response.token) {
      throw new Error('No token received from server')
    }

    // Store auth data
    storeAuthData(response.token, response.user, response.expiresIn)

    // If backend returns refresh token, store it
    if ((response as any).refreshToken) {
      storeRefreshToken((response as any).refreshToken)
    }

    console.log('[Auth] Login successful for:', response.user.email)
    return response
  } catch (error: any) {
    console.error('[Auth] Login failed:', error)

    // Enhance error message
    if (error.status === 401) {
      throw new Error('Invalid email or password')
    }
    if (error.status === 403) {
      throw new Error('Account is disabled or not verified')
    }

    throw new Error(error.message || 'Login failed. Please try again.')
  }
}

/**
 * Register new brand user
 */
export async function register(
  email: string,
  password: string,
  name: string,
  companyName?: string
): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/register', {
      email,
      password,
      name,
      role: 'BRAND',
      companyName,
    })

    if (response.token) {
      storeAuthData(response.token, response.user, response.expiresIn)
    }

    return response
  } catch (error: any) {
    console.error('[Auth] Registration failed:', error)

    if (error.status === 409) {
      throw new Error('An account with this email already exists')
    }

    throw new Error(error.message || 'Registration failed. Please try again.')
  }
}

/**
 * Logout current user
 * Clears tokens locally and notifies backend
 */
export async function logout(): Promise<void> {
  try {
    // Notify backend (fire and forget)
    await apiClient.post('/auth/logout').catch(() => {
      // Ignore backend errors during logout
    })
  } finally {
    // Always clear local data
    clearAuthData()
    console.log('[Auth] Logged out')
  }
}

/**
 * Refresh the access token
 * Called automatically by API client on 401, or proactively before expiry
 */
export async function refreshToken(): Promise<string | null> {
  try {
    // First try using stored refresh token
    const storedRefreshToken = getRefreshToken()

    if (storedRefreshToken) {
      const response = await apiClient.post<RefreshResponse>('/auth/refresh-token', {
        refreshToken: storedRefreshToken,
      })

      if (response.token) {
        // Update stored token
        const user = getStoredUser()
        if (user) {
          storeAuthData(response.token, user, response.expiresIn)
        } else {
          // Just update the token
          setCookie(STORAGE_KEYS.ACCESS_TOKEN, response.token, response.expiresIn)
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.token)
          apiClient.setTokens(response.token)
        }

        console.log('[Auth] Token refreshed successfully')
        return response.token
      }
    }

    return null
  } catch (error) {
    console.error('[Auth] Token refresh failed:', error)
    return null
  }
}

/**
 * Get current user from backend
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me')

  // Update stored user data
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response))

  return response
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false

  const token = getAccessToken()
  if (!token) return false

  // Check if token is expired
  const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)
  if (expiry) {
    const expiryTime = parseInt(expiry, 10)
    if (Date.now() >= expiryTime) {
      return false
    }
  }

  return true
}

/**
 * Check if token needs refresh (within buffer period)
 */
export function needsTokenRefresh(): boolean {
  if (typeof window === 'undefined') return false

  const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)
  if (!expiry) return false

  const expiryTime = parseInt(expiry, 10)
  const now = Date.now()

  // Return true if within buffer period but not yet expired
  return now >= expiryTime - TOKEN_REFRESH_BUFFER_MS && now < expiryTime
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null

  // Try localStorage first (faster)
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  if (token) return token

  // Fallback to cookie
  return getCookie(STORAGE_KEYS.ACCESS_TOKEN)
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
}

/**
 * Get stored user data
 */
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null

  const userData = localStorage.getItem(STORAGE_KEYS.USER)
  if (!userData) return null

  try {
    return JSON.parse(userData)
  } catch {
    return null
  }
}

/**
 * Get full auth state
 */
export function getAuthState(): AuthState {
  const user = getStoredUser()
  const token = getAccessToken()

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
  }
}

/**
 * Check if user has a specific role
 */
export function hasRole(role: UserRole): boolean {
  const user = getStoredUser()
  return user?.role === role
}

/**
 * Check if current user is a brand
 */
export function isBrand(): boolean {
  const user = getStoredUser()
  return user?.role === 'BRAND'
}

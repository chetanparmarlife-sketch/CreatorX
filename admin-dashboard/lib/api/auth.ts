/**
 * Authentication API Service - Admin Dashboard
 *
 * PRODUCTION IMPLEMENTATION: Uses backend JWT authentication.
 * ADMIN ONLY: Verifies user has ADMIN role after login.
 *
 * Backend endpoints:
 * - POST /api/v1/auth/login → { token, user, expiresIn }
 * - POST /api/v1/auth/refresh-token → { token, expiresIn }
 * - GET /api/v1/auth/me → user profile
 */

import { apiClient } from './client'

// ==================== Types ====================

export type UserRole = 'ADMIN' | 'BRAND' | 'CREATOR'

export interface User {
  id: string
  email: string
  role: UserRole
  name?: string
  createdAt?: string
}

export interface LoginResponse {
  token: string
  user: User
  expiresIn: number
}

export interface RefreshResponse {
  token: string
  expiresIn: number
}

// ==================== Storage Keys ====================

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'creatorx_admin_access_token',
  REFRESH_TOKEN: 'creatorx_admin_refresh_token',
  USER: 'creatorx_admin_user',
  TOKEN_EXPIRY: 'creatorx_admin_token_expiry',
} as const

const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000

// ==================== Cookie Helpers ====================

function setCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === 'undefined') return

  const isHttps = window.location.protocol === 'https:'
  let cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`
  if (isHttps) cookie += '; Secure'

  document.cookie = cookie
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=')
    if (cookieName === name) {
      return decodeURIComponent(cookieValue)
    }
  }
  return null
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

// ==================== Token Storage ====================

function storeAuthData(token: string, user: User, expiresIn: number): void {
  if (typeof window === 'undefined') return

  setCookie(STORAGE_KEYS.ACCESS_TOKEN, token, expiresIn)
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)

  const expiresAt = Date.now() + (expiresIn * 1000)
  localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiresAt.toString())
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

  apiClient.setTokens(token)
}

function storeRefreshToken(refreshToken: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
}

function clearAuthData(): void {
  if (typeof window === 'undefined') return

  deleteCookie(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER)
  localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY)

  apiClient.clearAuth()
}

// ==================== Public API ====================

/**
 * Login with email and password (ADMIN ONLY)
 * Verifies user has ADMIN role after successful authentication
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

    // ⚠️ CRITICAL: Verify user has ADMIN role
    if (response.user.role !== 'ADMIN') {
      throw new AdminAccessDeniedError(
        'Admin access only. This dashboard is restricted to administrators.',
        response.user.role
      )
    }

    storeAuthData(response.token, response.user, response.expiresIn)

    if ((response as any).refreshToken) {
      storeRefreshToken((response as any).refreshToken)
    }

    console.log('[Admin Auth] Login successful for:', response.user.email)
    return response
  } catch (error: any) {
    console.error('[Admin Auth] Login failed:', error)

    if (error instanceof AdminAccessDeniedError) {
      throw error
    }
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
 * Custom error for non-admin users attempting admin login
 */
export class AdminAccessDeniedError extends Error {
  actualRole: UserRole

  constructor(message: string, actualRole: UserRole) {
    super(message)
    this.name = 'AdminAccessDeniedError'
    this.actualRole = actualRole
  }
}

/**
 * Logout current admin user
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout').catch(() => { })
  } finally {
    clearAuthData()
    console.log('[Admin Auth] Logged out')
  }
}

/**
 * Refresh the access token
 */
export async function refreshToken(): Promise<string | null> {
  try {
    const storedRefreshToken = getRefreshToken()

    if (storedRefreshToken) {
      const response = await apiClient.post<RefreshResponse>('/auth/refresh-token', {
        refreshToken: storedRefreshToken,
      })

      if (response.token) {
        const user = getStoredUser()

        // Verify still has ADMIN role
        if (user && user.role !== 'ADMIN') {
          clearAuthData()
          throw new Error('Admin access revoked')
        }

        if (user) {
          storeAuthData(response.token, user, response.expiresIn)
        }

        console.log('[Admin Auth] Token refreshed successfully')
        return response.token
      }
    }

    return null
  } catch (error) {
    console.error('[Admin Auth] Token refresh failed:', error)
    return null
  }
}

/**
 * Get current admin user from backend
 * Backend returns { user: { id, email, role, ... }, message }
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<{ user: User; message?: string }>('/auth/me')

  const user = response.user ?? (response as unknown as User)

  // Verify ADMIN role
  if (user.role !== 'ADMIN') {
    clearAuthData()
    throw new AdminAccessDeniedError('Admin access required', user.role)
  }

  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  return user
}

/**
 * Check if admin user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false

  const token = getAccessToken()
  if (!token) return false

  // Check expiry
  const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)
  if (expiry && Date.now() >= parseInt(expiry, 10)) {
    return false
  }

  // Verify ADMIN role
  const user = getStoredUser()
  if (!user || user.role !== 'ADMIN') {
    return false
  }

  return true
}

/**
 * Check if token needs refresh
 */
export function needsTokenRefresh(): boolean {
  if (typeof window === 'undefined') return false

  const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)
  if (!expiry) return false

  const expiryTime = parseInt(expiry, 10)
  const now = Date.now()

  return now >= expiryTime - TOKEN_REFRESH_BUFFER_MS && now < expiryTime
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || getCookie(STORAGE_KEYS.ACCESS_TOKEN)
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
}

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

export function isAdmin(): boolean {
  const user = getStoredUser()
  return user?.role === 'ADMIN'
}

/**
 * Authentication API Service - Admin Dashboard
 *
 * PRODUCTION IMPLEMENTATION: Uses backend JWT authentication.
 * ADMIN ONLY: Verifies user has ADMIN role after login.
 * Tokens are stored in HttpOnly cookies instead of localStorage to reduce XSS risk.
 *
 * Backend endpoints:
 * - POST /api/v1/auth/login → { token, user, expiresIn }
 * - POST /api/v1/auth/refresh-token → { token, expiresIn }
 * - GET /api/v1/auth/me → user profile
 */

import { apiClient } from './client'
import { tokenStorage } from '@/lib/auth/tokenStorage'

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

// ==================== Non-Token Storage ====================

const USER_STORAGE_KEY = 'creatorx_admin_user'

function storeUser(user: User): void {
  if (typeof window === 'undefined') return
  // User profile is non-token state; admin auth tokens moved from localStorage to HttpOnly cookies.
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

function clearStoredUser(): void {
  if (typeof window === 'undefined') return
  // Logout now clears only non-sensitive cached admin user data from localStorage.
  localStorage.removeItem(USER_STORAGE_KEY)
}

// ==================== Token Storage ====================

async function storeAuthData(token: string, user: User, refreshToken?: string): Promise<void> {
  // Store admin tokens in HttpOnly cookies via API route instead of localStorage token keys.
  await apiClient.setTokens(token, refreshToken)
  storeUser(user)
}

async function clearAuthData(): Promise<void> {
  // Clear HttpOnly token cookies via API route instead of localStorage.removeItem token calls.
  await apiClient.clearAuth()
  clearStoredUser()
}

// ==================== Public API ====================

/**
 * Login with email and password (ADMIN ONLY)
 * Verifies user has ADMIN role after successful authentication
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse & { refreshToken?: string }>('/auth/login', {
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

    // Persist backend tokens in HttpOnly cookies rather than readable localStorage.
    await storeAuthData(response.token, response.user, response.refreshToken)

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
    // Always clear HttpOnly token cookies and cached non-token user data.
    await clearAuthData()
    console.log('[Admin Auth] Logged out')
  }
}

/**
 * Refresh the access token
 */
export async function refreshToken(): Promise<string | null> {
  try {
    // Refresh through a Next.js route that reads the HttpOnly refresh cookie instead of localStorage.
    const response = await fetch('/api/auth/refresh-token', { method: 'POST' })

    if (response.ok) {
      const data = await response.json()
      const token = data.token as string | undefined
      if (token) {
        const user = getStoredUser()

        // Verify still has ADMIN role
        if (user && user.role !== 'ADMIN') {
          await clearAuthData()
          throw new Error('Admin access revoked')
        }

        console.log('[Admin Auth] Token refreshed successfully')
        return token
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
    await clearAuthData()
    throw new AdminAccessDeniedError('Admin access required', user.role)
  }

  storeUser(user)
  return user
}

/**
 * Check if admin user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  // Authentication now checks the HttpOnly cookie-backed token route instead of localStorage.
  const token = await tokenStorage.getAccessToken()
  if (!token) return false

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
  // Token expiry is no longer stored in localStorage; failed API requests handle auth expiry.
  return false
}

export async function getAccessToken(): Promise<string | null> {
  // Read the admin access token through the API route backed by HttpOnly cookies.
  return tokenStorage.getAccessToken()
}

export async function getRefreshToken(): Promise<string | null> {
  // Refresh token remains unavailable to JavaScript after moving out of localStorage.
  return tokenStorage.getRefreshToken()
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null

  const userData = localStorage.getItem(USER_STORAGE_KEY)
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

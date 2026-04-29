/**
 * Authentication API Service - Brand Dashboard
 *
 * Uses backend JWT authentication while storing tokens in HttpOnly cookies
 * through Next.js API routes. This replaces the previous localStorage token
 * storage that exposed access and refresh tokens to JavaScript.
 */

import { apiClient } from './client'
import { tokenStorage } from '@/lib/auth/tokenStorage'
import type { UserRole } from '@/lib/types'

export interface User {
  id: string
  email: string
  role: UserRole
  name?: string
  companyName?: string
  onboardingStatus?: string
  createdAt?: string
}

export interface LoginResponse {
  token: string
  user: User
  expiresIn: number
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

const USER_STORAGE_KEY = 'creatorx_user'

function storeUser(user: User): void {
  if (typeof window === 'undefined') return
  // User profile is non-token state; tokens moved from localStorage to HttpOnly cookies.
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

function clearStoredUser(): void {
  if (typeof window === 'undefined') return
  // Logout now clears only non-sensitive cached user data from localStorage.
  localStorage.removeItem(USER_STORAGE_KEY)
}

async function storeAuthData(token: string, user: User, refreshToken?: string): Promise<void> {
  // Store tokens in HttpOnly cookies via API route instead of localStorage token keys.
  await apiClient.setTokens(token, refreshToken)
  storeUser(user)
}

async function clearAuthData(): Promise<void> {
  // Clear HttpOnly token cookies via API route instead of localStorage.removeItem token calls.
  await apiClient.clearAuth()
  clearStoredUser()
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse & { refreshToken?: string }>('/auth/login', {
      email,
      password,
    })

    if (!response.token) {
      throw new Error('No token received from server')
    }

    // Persist backend tokens in HttpOnly cookies rather than readable localStorage.
    await storeAuthData(response.token, response.user, response.refreshToken)

    console.log('[Auth] Login successful for:', response.user.email)
    return response
  } catch (error: any) {
    console.error('[Auth] Login failed:', error)

    if (error.status === 401) {
      throw new Error('Invalid email or password')
    }
    if (error.status === 403) {
      throw new Error('Account is disabled or not verified')
    }

    throw new Error(error.message || 'Login failed. Please try again.')
  }
}

export async function register(
  email: string,
  password: string,
  name: string,
  companyName?: string
): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse & { refreshToken?: string }>('/auth/register', {
      email,
      password,
      name,
      role: 'BRAND',
      companyName,
    })

    if (response.token) {
      // Persist signup tokens in HttpOnly cookies rather than readable localStorage.
      await storeAuthData(response.token, response.user, response.refreshToken)
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

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout').catch(() => {
      // Ignore backend errors during logout.
    })
  } finally {
    // Always clear HttpOnly token cookies and cached user data.
    await clearAuthData()
    console.log('[Auth] Logged out')
  }
}

export async function refreshToken(): Promise<string | null> {
  try {
    // Refresh through a Next.js route that reads the HttpOnly refresh cookie instead of localStorage.
    const response = await fetch('/api/auth/refresh-token', { method: 'POST' })
    if (response.ok) {
      const data = await response.json()
      const token = data.token as string | undefined
      if (!token) return null
      console.log('[Auth] Token refreshed successfully')
      return token
    }

    return null
  } catch (error) {
    console.error('[Auth] Token refresh failed:', error)
    return null
  }
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<{ user: User; message?: string }>('/auth/me')
  const user = response.user ?? (response as unknown as User)
  storeUser(user)
  return user
}

export async function isAuthenticated(): Promise<boolean> {
  // Authentication now checks the HttpOnly cookie-backed token route instead of localStorage.
  return tokenStorage.isAccessTokenValid()
}

export function needsTokenRefresh(): boolean {
  // Token expiry is no longer stored in localStorage; failed API requests handle auth expiry.
  return false
}

export async function getAccessToken(): Promise<string | null> {
  // Read access token through the API route backed by HttpOnly cookies.
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

export async function getAuthState(): Promise<AuthState> {
  const user = getStoredUser()
  const token = await getAccessToken()

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
  }
}

export function hasRole(role: UserRole): boolean {
  const user = getStoredUser()
  return user?.role === role
}

export function isBrand(): boolean {
  const user = getStoredUser()
  return user?.role === 'BRAND'
}

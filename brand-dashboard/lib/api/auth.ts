/**
 * Authentication API Service
 * 
 * Handles authentication operations: login, register, logout, and token management.
 * Uses Supabase for authentication (matching React Native app architecture).
 */

import { apiClient } from './client'
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/lib/types'

/**
 * Login with email and password
 * Uses Supabase Auth, then links user to backend
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    // For web, we'll use Supabase client-side
    // In a real implementation, you'd use @supabase/supabase-js
    // For now, we'll call the backend directly
    
    // If Supabase is available, use it
    if (typeof window !== 'undefined' && (window as any).supabase) {
      const { data, error } = await (window as any).supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.session) {
        // Store tokens
        apiClient.setTokens(data.session.access_token, data.session.refresh_token)

        // Link user to backend if needed
        try {
          const linkResponse = await apiClient.post<AuthResponse>('/auth/link-supabase-user', {
            supabaseUserId: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || email,
            role: 'BRAND', // Brand dashboard
          })
          
          // Store tokens from Supabase session in response if not present
          if (!linkResponse.accessToken && data.session.access_token) {
            linkResponse.accessToken = data.session.access_token
            linkResponse.refreshToken = data.session.refresh_token
          }
          
          return linkResponse
        } catch (linkError) {
          // User might already be linked, try to get current user
          const currentUser = await getCurrentUser()
          // Add tokens from Supabase session
          if (data.session && !currentUser.accessToken) {
            currentUser.accessToken = data.session.access_token
            currentUser.refreshToken = data.session.refresh_token
          }
          return currentUser
        }
      }
    }

    // Fallback: direct backend login (if backend supports it)
    // Note: Backend /auth/login currently throws error indicating Supabase is required
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', { email, password } as LoginRequest)
      // If backend returns tokens, store them
      if (response.accessToken) {
        apiClient.setTokens(response.accessToken, response.refreshToken || '')
      }
      return response
    } catch (loginError: any) {
      // If Supabase is not available and backend login fails, provide helpful error
      throw new Error(
        loginError.message || 
        'Supabase authentication is required. Please ensure Supabase is configured.'
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

/**
 * Register new brand user
 */
export async function register(
  email: string,
  password: string,
  name: string,
  phone?: string,
  companyName?: string,
  industry?: string,
  website?: string
): Promise<AuthResponse> {
  try {
    // Use Supabase for registration
    if (typeof window !== 'undefined' && (window as any).supabase) {
      const { data, error } = await (window as any).supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'BRAND',
          },
        },
      })

      if (error) throw error

      if (data.session) {
        apiClient.setTokens(data.session.access_token, data.session.refresh_token)

        // Link user to backend with brand profile info
        const linkResponse = await apiClient.post<AuthResponse>('/auth/link-supabase-user', {
          supabaseUserId: data.user.id,
          email: data.user.email,
          name,
          role: 'BRAND',
          phone,
          companyName: companyName || name,
          industry: industry,
          website: website,
        })

        return linkResponse
      }
    }

    // Fallback: direct backend registration
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
      role: 'BRAND',
      phone,
    } as RegisterRequest)

    return response
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  const response = await apiClient.get<AuthResponse>('/auth/me')
  return response
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    // Sign out from Supabase if available
    if (typeof window !== 'undefined' && (window as any).supabase) {
      await (window as any).supabase.auth.signOut()
    }

    // Clear tokens and user data
    apiClient.clearAuth()
  } catch (error) {
    console.error('Logout error:', error)
    // Clear auth even if logout fails
    apiClient.clearAuth()
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem('creatorx_access_token')
  return !!token
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('creatorx_access_token')
}


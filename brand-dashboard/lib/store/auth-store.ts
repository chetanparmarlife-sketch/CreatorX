/**
 * Authentication Store (Zustand)
 * 
 * Global state management for authentication.
 * Matches the pattern used in React Native app.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { AuthResponse } from '@/lib/types'
import { getCurrentUser, logout as apiLogout } from '@/lib/api/auth'

interface AuthState {
  user: AuthResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: AuthResponse | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (user: AuthResponse) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get): AuthState => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user: AuthResponse | null) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      login: (user: AuthResponse) => {
        set({
          user,
          isAuthenticated: true,
          error: null,
        })
      },

      logout: async () => {
        try {
          await apiLogout()
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          })
        } catch (error) {
          console.error('Logout error:', error)
          // Clear state even if API call fails
          set({
            user: null,
            isAuthenticated: false,
          })
        }
      },

      checkAuth: async () => {
        set({ isLoading: true, error: null })
        try {
          const user = await getCurrentUser()
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Authentication failed',
          })
        }
      },
    }),
    {
      name: 'creatorx-auth-storage',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : undefined)),
      partialize: (state: AuthState) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)


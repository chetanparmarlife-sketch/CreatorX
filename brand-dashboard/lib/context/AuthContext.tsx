/**
 * Authentication Context for Brand Dashboard
 *
 * Provides centralized authentication state management:
 * - User state and authentication status
 * - Login/logout/refresh methods
 * - Automatic token refresh before expiry
 * - Session persistence across page refreshes
 *
 * Usage:
 * 1. Wrap app in <AuthProvider> (in layout.tsx)
 * 2. Use useAuth() hook in components
 */

'use client'

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
    login as authLogin,
    logout as authLogout,
    refreshToken as authRefreshToken,
    getCurrentUser,
    getStoredUser,
    isAuthenticated as checkIsAuthenticated,
    needsTokenRefresh,
    type User,
    type LoginResponse,
} from '@/lib/api/auth'
import {
    scheduleTokenRefresh,
    cancelTokenRefresh,
} from '@/lib/auth/tokenStorage'

// ==================== Types ====================

export interface AuthContextType {
    // State
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null

    // Actions
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    refreshToken: () => Promise<void>
    clearError: () => void

    // Utils
    refreshUser: () => Promise<void>
}

interface AuthProviderProps {
    children: ReactNode
}

// ==================== Context ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Token refresh check interval (every 30 seconds)
const TOKEN_CHECK_INTERVAL_MS = 30 * 1000

// ==================== Provider Component ====================

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const pathname = usePathname()

    // ==================== Initialization ====================

    /**
     * Initialize auth state on mount
     */
    useEffect(() => {
        initializeAuth()

        // Set up periodic token refresh check
        const intervalId = setInterval(() => {
            if (needsTokenRefresh()) {
                handleTokenRefresh()
            }
        }, TOKEN_CHECK_INTERVAL_MS)

        return () => {
            clearInterval(intervalId)
            cancelTokenRefresh()
        }
    }, [])

    /**
     * Check for existing session on mount
     */
    const initializeAuth = useCallback(async () => {
        try {
            setIsLoading(true)

            // Check HttpOnly cookie-backed auth instead of localStorage token presence.
            if (!(await checkIsAuthenticated())) {
                setUser(null)
                setIsLoading(false)
                return
            }

            // Try to get stored user first (instant)
            const storedUser = getStoredUser()
            if (storedUser) {
                setUser(storedUser)
            }

            // Verify with backend (async)
            try {
                const currentUser = await getCurrentUser()
                setUser(currentUser)

                // Schedule proactive token refresh
                scheduleTokenRefresh(handleTokenRefresh)
            } catch (err) {
                console.warn('[Auth] Failed to verify user with backend:', err)
                // Keep stored user if backend is temporarily unavailable
                if (!storedUser) {
                    setUser(null)
                }
            }
        } catch (err) {
            console.error('[Auth] Initialization failed:', err)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // ==================== Token Refresh ====================

    /**
     * Handle token refresh
     */
    const handleTokenRefresh = useCallback(async (): Promise<void> => {
        try {
            const newToken = await authRefreshToken()
            if (newToken) {
                console.log('[Auth] Token refreshed successfully')
                // Re-schedule next refresh
                scheduleTokenRefresh(handleTokenRefresh)
            } else {
                console.warn('[Auth] Token refresh returned null')
                // Token refresh failed, but don't logout yet - let API calls handle 401
            }
        } catch (err) {
            console.error('[Auth] Token refresh failed:', err)
        }
    }, [])

    // ==================== Login ====================

    /**
     * Login with email and password
     */
    const login = useCallback(async (email: string, password: string): Promise<void> => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await authLogin(email, password)
            setUser(response.user)

            // Schedule proactive token refresh
            scheduleTokenRefresh(handleTokenRefresh)

            // Redirect to dashboard or intended destination
            const params = new URLSearchParams(window.location.search)
            const redirectTo = params.get('redirect') || '/'
            router.push(redirectTo)
        } catch (err: any) {
            const message = err.message || 'Login failed. Please try again.'
            setError(message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [router, handleTokenRefresh])

    // ==================== Logout ====================

    /**
     * Logout current user
     */
    const logout = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true)
            cancelTokenRefresh()
            await authLogout()
        } catch (err) {
            console.error('[Auth] Logout error:', err)
        } finally {
            setUser(null)
            setIsLoading(false)
            router.push('/login')
        }
    }, [router])

    // ==================== Utils ====================

    /**
     * Refresh user data from backend
     */
    const refreshUser = useCallback(async (): Promise<void> => {
        try {
            const currentUser = await getCurrentUser()
            setUser(currentUser)
        } catch (err) {
            console.error('[Auth] Failed to refresh user:', err)
        }
    }, [])

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setError(null)
    }, [])

    // ==================== Context Value ====================

    const value = useMemo<AuthContextType>(() => ({
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        refreshToken: handleTokenRefresh,
        clearError,
        refreshUser,
    }), [user, isLoading, error, login, logout, handleTokenRefresh, clearError, refreshUser])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// ==================== Hook ====================

/**
 * Hook to access authentication context
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

// ==================== HOC for Protected Routes ====================

/**
 * Higher-order component to protect routes
 * Redirects to login if not authenticated
 */
export function withAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>
): React.FC<P> {
    return function ProtectedRoute(props: P) {
        const { isAuthenticated, isLoading } = useAuth()
        const router = useRouter()
        const pathname = usePathname()

        useEffect(() => {
            if (!isLoading && !isAuthenticated) {
                router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
            }
        }, [isAuthenticated, isLoading, router, pathname])

        // Show loading state
        if (isLoading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                </div>
            )
        }

        // Don't render if not authenticated
        if (!isAuthenticated) {
            return null
        }

        return <WrappedComponent {...props} />
    }
}

// ==================== Utility Components ====================

/**
 * Component that only renders children if authenticated
 */
export function AuthenticatedOnly({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading || !isAuthenticated) {
        return null
    }

    return <>{children}</>
}

/**
 * Component that only renders children if NOT authenticated
 */
export function UnauthenticatedOnly({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading || isAuthenticated) {
        return null
    }

    return <>{children}</>
}

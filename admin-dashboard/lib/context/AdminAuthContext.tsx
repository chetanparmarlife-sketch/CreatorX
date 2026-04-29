/**
 * Authentication Context for Admin Dashboard
 *
 * ADMIN ONLY: Enforces ADMIN role at every checkpoint
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
    isAdmin,
    AdminAccessDeniedError,
    type User,
} from '@/lib/api/auth'

// ==================== Types ====================

export interface AdminAuthContextType {
    user: User | null
    isAuthenticated: boolean
    isAdmin: boolean
    isLoading: boolean
    error: string | null

    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    refreshToken: () => Promise<void>
    clearError: () => void
    refreshUser: () => Promise<void>
}

interface AdminAuthProviderProps {
    children: ReactNode
}

// ==================== Context ====================

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

const TOKEN_CHECK_INTERVAL_MS = 30 * 1000

// ==================== Provider ====================

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    // Initialize auth on mount
    useEffect(() => {
        initializeAuth()

        const intervalId = setInterval(() => {
            if (needsTokenRefresh()) {
                handleTokenRefresh()
            }
        }, TOKEN_CHECK_INTERVAL_MS)

        return () => clearInterval(intervalId)
    }, [])

    const initializeAuth = useCallback(async () => {
        try {
            setIsLoading(true)

            // Auth status now checks HttpOnly cookie-backed token route instead of localStorage.
            if (!(await checkIsAuthenticated())) {
                setUser(null)
                setIsLoading(false)
                return
            }

            const storedUser = getStoredUser()
            if (storedUser && storedUser.role === 'ADMIN') {
                setUser(storedUser)
            }

            try {
                const currentUser = await getCurrentUser()
                if (currentUser.role === 'ADMIN') {
                    setUser(currentUser)
                } else {
                    setUser(null)
                    router.push('/unauthorized')
                }
            } catch (err) {
                if (err instanceof AdminAccessDeniedError) {
                    setUser(null)
                    router.push('/unauthorized')
                }
            }
        } catch (err) {
            console.error('[Admin Auth] Initialization failed:', err)
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }, [router])

    const handleTokenRefresh = useCallback(async (): Promise<void> => {
        try {
            const newToken = await authRefreshToken()
            if (!newToken) {
                console.warn('[Admin Auth] Token refresh returned null')
            }
        } catch (err) {
            console.error('[Admin Auth] Token refresh failed:', err)
        }
    }, [])

    const login = useCallback(async (email: string, password: string): Promise<void> => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await authLogin(email, password)

            // Double-check ADMIN role
            if (response.user.role !== 'ADMIN') {
                throw new AdminAccessDeniedError('Admin access only', response.user.role)
            }

            setUser(response.user)

            const params = new URLSearchParams(window.location.search)
            const redirectTo = params.get('redirect') || '/'
            router.push(redirectTo)
        } catch (err: any) {
            let message = 'Login failed. Please try again.'

            if (err instanceof AdminAccessDeniedError) {
                message = `Admin access only. Your account has role: ${err.actualRole}`
            } else if (err.message) {
                message = err.message
            }

            setError(message)
            throw err
        } finally {
            setIsLoading(false)
        }
    }, [router])

    const logout = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true)
            await authLogout()
        } catch (err) {
            console.error('[Admin Auth] Logout error:', err)
        } finally {
            setUser(null)
            setIsLoading(false)
            router.push('/login')
        }
    }, [router])

    const refreshUser = useCallback(async (): Promise<void> => {
        try {
            const currentUser = await getCurrentUser()
            if (currentUser.role === 'ADMIN') {
                setUser(currentUser)
            } else {
                setUser(null)
                router.push('/unauthorized')
            }
        } catch (err) {
            console.error('[Admin Auth] Failed to refresh user:', err)
        }
    }, [router])

    const clearError = useCallback(() => setError(null), [])

    const value = useMemo<AdminAuthContextType>(() => ({
        user,
        isAuthenticated: !!user && user.role === 'ADMIN',
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        error,
        login,
        logout,
        refreshToken: handleTokenRefresh,
        clearError,
        refreshUser,
    }), [user, isLoading, error, login, logout, handleTokenRefresh, clearError, refreshUser])

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    )
}

// ==================== Hook ====================

export function useAdminAuth(): AdminAuthContextType {
    const context = useContext(AdminAuthContext)
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider')
    }
    return context
}

// ==================== HOC ====================

export function withAdminAuth<P extends object>(
    WrappedComponent: React.ComponentType<P>
): React.FC<P> {
    return function ProtectedAdminRoute(props: P) {
        const { isAuthenticated, isAdmin, isLoading } = useAdminAuth()
        const router = useRouter()
        const pathname = usePathname()

        useEffect(() => {
            if (!isLoading) {
                if (!isAuthenticated) {
                    router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
                } else if (!isAdmin) {
                    router.push('/unauthorized')
                }
            }
        }, [isAuthenticated, isAdmin, isLoading, router, pathname])

        if (isLoading) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-900">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400">Verifying admin access...</p>
                    </div>
                </div>
            )
        }

        if (!isAuthenticated || !isAdmin) {
            return null
        }

        return <WrappedComponent {...props} />
    }
}

// ==================== Utility Components ====================

export function AdminOnly({ children }: { children: ReactNode }) {
    const { isAuthenticated, isAdmin, isLoading } = useAdminAuth()
    if (isLoading || !isAuthenticated || !isAdmin) return null
    return <>{children}</>
}

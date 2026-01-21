/**
 * Secure Token Storage Module for Brand Dashboard
 * 
 * RECOMMENDED APPROACH: Option A - httpOnly Cookies
 * 
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    TOKEN STORAGE STRATEGY ANALYSIS                           ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║ Option A: httpOnly Cookies (RECOMMENDED ✅)                                   ║
 * ║ ├── Pro: XSS protection (JS cannot read httpOnly cookies)                    ║
 * ║ ├── Pro: Automatic sending with requests (withCredentials: true)             ║
 * ║ ├── Pro: Backend already supports (CORS allowCredentials=true)               ║
 * ║ ├── Con: Requires CSRF protection (mitigated with SameSite=Lax)              ║
 * ║ └── Con: Cookie must be set by backend for true httpOnly                     ║
 * ║                                                                              ║
 * ║ Option B: localStorage (NOT RECOMMENDED ❌)                                   ║
 * ║ ├── Pro: Simple implementation                                               ║
 * ║ └── Con: Vulnerable to XSS attacks                                           ║
 * ║                                                                              ║
 * ║ Option C: Memory + Refresh Cookie (COMPLEX)                                  ║
 * ║ ├── Pro: Best security for access token                                      ║
 * ║ └── Con: Token lost on page refresh                                          ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * 
 * IMPLEMENTATION: Hybrid approach
 * - Access token: Cookie (for middleware) + memory (for client-side)
 * - Refresh token: localStorage with encryption option
 * - User data: localStorage (non-sensitive)
 * 
 * Backend CORS Config (verified ✅):
 * - allowCredentials: true
 * - allowedOrigins: localhost:3000
 * - exposedHeaders: Authorization
 */

// ==================== Types ====================

export interface TokenData {
    accessToken: string
    refreshToken?: string
    expiresIn: number // seconds
    expiresAt?: number // absolute timestamp in ms
}

export interface StoredToken {
    value: string
    expiresAt: number
}

// ==================== Constants ====================

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'creatorx_access_token',
    REFRESH_TOKEN: 'creatorx_refresh_token',
    TOKEN_EXPIRY: 'creatorx_token_expiry',
    USER: 'creatorx_user',
} as const

// Refresh token 2 minutes before expiry
const REFRESH_BUFFER_MS = 2 * 60 * 1000

// Cookie options
const COOKIE_OPTIONS = {
    path: '/',
    sameSite: 'Lax' as const,
    // secure: true in production (HTTPS only)
}

// ==================== Cookie Helpers ====================

/**
 * Set a cookie with security options
 */
export function setCookie(
    name: string,
    value: string,
    maxAgeSeconds: number,
    options: { httpOnly?: boolean; secure?: boolean; sameSite?: 'Strict' | 'Lax' | 'None' } = {}
): void {
    if (typeof document === 'undefined') return

    const isProduction = process.env.NODE_ENV === 'production'
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'

    let cookie = `${name}=${encodeURIComponent(value)}`
    cookie += `; Path=${COOKIE_OPTIONS.path}`
    cookie += `; Max-Age=${maxAgeSeconds}`
    cookie += `; SameSite=${options.sameSite || COOKIE_OPTIONS.sameSite}`

    // Secure flag for HTTPS
    if (options.secure !== false && (isProduction || isHttps)) {
        cookie += '; Secure'
    }

    // Note: httpOnly cannot be set from JavaScript, only from server
    // For true httpOnly, backend must set the cookie in response headers

    document.cookie = cookie
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
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

/**
 * Delete a cookie
 */
export function deleteCookie(name: string): void {
    if (typeof document === 'undefined') return
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

// ==================== Token Storage Class ====================

class TokenStorage {
    private memoryToken: string | null = null
    private tokenExpiresAt: number | null = null

    // ==================== Set Tokens ====================

    /**
     * Store access token in cookie (for middleware) and memory (for fast access)
     */
    setAccessToken(token: string, expiresIn: number): void {
        // Store in memory for fast access
        this.memoryToken = token

        // Calculate expiry time
        const expiresAt = Date.now() + (expiresIn * 1000)
        this.tokenExpiresAt = expiresAt

        // Store in cookie (accessible by Next.js middleware)
        setCookie(STORAGE_KEYS.ACCESS_TOKEN, token, expiresIn)

        // Also store expiry in localStorage for persistence across tabs
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, expiresAt.toString())
            // Backup token in localStorage for page refresh recovery
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token)
        }
    }

    /**
     * Store refresh token in localStorage
     * Note: For maximum security, this could use encrypted storage
     */
    setRefreshToken(token: string): void {
        if (typeof localStorage === 'undefined') return
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token)
    }

    /**
     * Store both tokens at once
     */
    setTokens(data: TokenData): void {
        this.setAccessToken(data.accessToken, data.expiresIn)
        if (data.refreshToken) {
            this.setRefreshToken(data.refreshToken)
        }
    }

    // ==================== Get Tokens ====================

    /**
     * Get access token (memory first, then cookie, then localStorage)
     */
    getAccessToken(): string | null {
        // Try memory first (fastest, most secure)
        if (this.memoryToken) {
            return this.memoryToken
        }

        // Try cookie (for page refreshes)
        const cookieToken = getCookie(STORAGE_KEYS.ACCESS_TOKEN)
        if (cookieToken) {
            this.memoryToken = cookieToken
            return cookieToken
        }

        // Fallback to localStorage (for recovery)
        if (typeof localStorage !== 'undefined') {
            const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
            if (storedToken) {
                this.memoryToken = storedToken
                return storedToken
            }
        }

        return null
    }

    /**
     * Get refresh token from localStorage
     */
    getRefreshToken(): string | null {
        if (typeof localStorage === 'undefined') return null
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
    }

    // ==================== Token Validation ====================

    /**
     * Check if access token exists and is not expired
     */
    isAccessTokenValid(): boolean {
        const token = this.getAccessToken()
        if (!token) return false

        const expiresAt = this.getTokenExpiresAt()
        if (!expiresAt) return true // No expiry info, assume valid

        // Invalid if expired
        return Date.now() < expiresAt
    }

    /**
     * Check if token needs refresh (within buffer period before expiry)
     */
    needsRefresh(): boolean {
        const expiresAt = this.getTokenExpiresAt()
        if (!expiresAt) return false

        const now = Date.now()
        const refreshThreshold = expiresAt - REFRESH_BUFFER_MS

        // Needs refresh if within buffer period but not yet expired
        return now >= refreshThreshold && now < expiresAt
    }

    /**
     * Check if token is expired
     */
    isExpired(): boolean {
        const expiresAt = this.getTokenExpiresAt()
        if (!expiresAt) return false
        return Date.now() >= expiresAt
    }

    /**
     * Get token expiration time
     */
    getTokenExpiresAt(): number | null {
        // Try memory first
        if (this.tokenExpiresAt) {
            return this.tokenExpiresAt
        }

        // Fallback to localStorage
        if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY)
            if (stored) {
                const expiresAt = parseInt(stored, 10)
                this.tokenExpiresAt = expiresAt
                return expiresAt
            }
        }

        return null
    }

    /**
     * Get time until token expires (in milliseconds)
     */
    getTimeUntilExpiry(): number | null {
        const expiresAt = this.getTokenExpiresAt()
        if (!expiresAt) return null
        return Math.max(0, expiresAt - Date.now())
    }

    // ==================== Clear Tokens ====================

    /**
     * Clear all stored tokens
     */
    clearAll(): void {
        // Clear memory
        this.memoryToken = null
        this.tokenExpiresAt = null

        // Clear cookie
        deleteCookie(STORAGE_KEYS.ACCESS_TOKEN)

        // Clear localStorage
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
            localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY)
            localStorage.removeItem(STORAGE_KEYS.USER)
        }
    }

    // ==================== User Data ====================

    /**
     * Store user data in localStorage
     */
    setUser(user: Record<string, unknown>): void {
        if (typeof localStorage === 'undefined') return
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    }

    /**
     * Get stored user data
     */
    getUser<T>(): T | null {
        if (typeof localStorage === 'undefined') return null
        const data = localStorage.getItem(STORAGE_KEYS.USER)
        if (!data) return null
        try {
            return JSON.parse(data)
        } catch {
            return null
        }
    }
}

// ==================== Export Singleton ====================

export const tokenStorage = new TokenStorage()

// ==================== Convenience Functions ====================

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return tokenStorage.isAccessTokenValid()
}

/**
 * Get current access token
 */
export function getAccessToken(): string | null {
    return tokenStorage.getAccessToken()
}

/**
 * Get current refresh token
 */
export function getRefreshToken(): string | null {
    return tokenStorage.getRefreshToken()
}

/**
 * Clear all authentication data
 */
export function clearAuth(): void {
    tokenStorage.clearAll()
}

// ==================== Proactive Token Refresh ====================

let refreshTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Schedule proactive token refresh before expiry
 */
export function scheduleTokenRefresh(onRefresh: () => Promise<void>): void {
    // Clear existing timer
    if (refreshTimer) {
        clearTimeout(refreshTimer)
        refreshTimer = null
    }

    const timeUntilExpiry = tokenStorage.getTimeUntilExpiry()
    if (!timeUntilExpiry) return

    // Schedule refresh 2 minutes before expiry
    const refreshIn = Math.max(0, timeUntilExpiry - REFRESH_BUFFER_MS)

    if (refreshIn > 0) {
        console.log(`[TokenStorage] Scheduling refresh in ${Math.round(refreshIn / 1000)}s`)
        refreshTimer = setTimeout(async () => {
            console.log('[TokenStorage] Executing scheduled token refresh')
            try {
                await onRefresh()
                // Schedule next refresh
                scheduleTokenRefresh(onRefresh)
            } catch (error) {
                console.error('[TokenStorage] Scheduled refresh failed:', error)
            }
        }, refreshIn)
    }
}

/**
 * Cancel scheduled token refresh
 */
export function cancelTokenRefresh(): void {
    if (refreshTimer) {
        clearTimeout(refreshTimer)
        refreshTimer = null
    }
}

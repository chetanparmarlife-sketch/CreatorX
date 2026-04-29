/**
 * tokenStorage.ts
 * Manages auth token storage using HttpOnly cookies via API routes.
 * Tokens are never accessible to JavaScript directly through localStorage.
 * This replaces the old localStorage approach which was vulnerable to XSS attacks.
 */

export type TokenData = {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
}

export const tokenStorage = {
  async setTokens(accessToken: string, refreshToken?: string | null) {
    // Store in HttpOnly cookies via API route instead of localStorage token keys.
    await fetch('/api/auth/set-tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, refreshToken }),
    })
  },

  async getAccessToken(): Promise<string | null> {
    // Read from a server-side cookie route instead of localStorage token keys.
    const res = await fetch('/api/auth/get-token')
    if (!res.ok) return null
    const data = await res.json()
    return data.token ?? null
  },

  async getRefreshToken(): Promise<string | null> {
    // Refresh tokens stay HttpOnly and are not exposed to JavaScript like the old localStorage value.
    return null
  },

  async clearTokens() {
    // Clear HttpOnly cookies via API route instead of removing readable localStorage token keys.
    await fetch('/api/auth/clear-tokens', { method: 'POST' })
  },

  async clearAll() {
    // Keep legacy callers working while clearing cookies through the secure API route.
    await this.clearTokens()
  },

  async isAccessTokenValid(): Promise<boolean> {
    // Authentication now depends on the HttpOnly access cookie rather than localStorage token presence.
    return (await this.getAccessToken()) !== null
  },

  needsRefresh(): boolean {
    // The old localStorage expiry timestamp is gone; refresh happens on backend 401 instead.
    return false
  },

  getTimeUntilExpiry(): number | null {
    // The old localStorage expiry timestamp is intentionally not stored in JavaScript-readable storage.
    return null
  },
}

export async function isAuthenticated(): Promise<boolean> {
  // Check authentication through the HttpOnly cookie-backed token route.
  return tokenStorage.isAccessTokenValid()
}

export async function getAccessToken(): Promise<string | null> {
  // Return the access token via API route instead of reading localStorage directly.
  return tokenStorage.getAccessToken()
}

export async function getRefreshToken(): Promise<string | null> {
  // Refresh token is intentionally unavailable to client JavaScript.
  return tokenStorage.getRefreshToken()
}

export async function clearAuth(): Promise<void> {
  // Clear auth cookies through the server route instead of localStorage.removeItem.
  await tokenStorage.clearAll()
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null

export function scheduleTokenRefresh(onRefresh: () => Promise<void>): void {
  // The old timer used localStorage expiry data; without readable token expiry, keep only a safe no-op.
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

export function cancelTokenRefresh(): void {
  // Cancel any previous in-memory timer from older sessions.
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

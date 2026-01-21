/**
 * Next.js Middleware for Admin Dashboard
 *
 * STRICT SECURITY: Validates JWT token AND ADMIN role
 * - Checks token presence in cookies
 * - Decodes JWT to verify role claim
 * - Redirects non-admin users to error page
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ==================== Route Configuration ====================

const PUBLIC_ROUTES = ['/login', '/forgot-password', '/unauthorized']

const EXCLUDED_PATHS = ['/_next', '/favicon.ico', '/images', '/icons', '/fonts']

// ==================== Helper Functions ====================

function isExcludedPath(pathname: string): boolean {
    return EXCLUDED_PATHS.some((path) => pathname.startsWith(path))
}

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))
}

/**
 * Decode JWT payload (basic decode, not cryptographic verification)
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null

        let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
        while (payload.length % 4) payload += '='

        return JSON.parse(atob(payload))
    } catch {
        return null
    }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
    const payload = decodeJwtPayload(token)
    if (!payload || typeof payload.exp !== 'number') return true

    const now = Math.floor(Date.now() / 1000) + 30 // 30s buffer
    return payload.exp < now
}

/**
 * Get user role from JWT token
 */
function getTokenRole(token: string): string | null {
    const payload = decodeJwtPayload(token)
    if (!payload) return null

    // Check various claim locations
    return (
        (payload.role as string) ||
        (payload.user_role as string) ||
        ((payload.user_metadata as any)?.role) ||
        ((payload.app_metadata as any)?.role) ||
        null
    )
}

/**
 * Check if token has ADMIN role
 */
function hasAdminRole(token: string): boolean {
    const role = getTokenRole(token)
    return role === 'ADMIN'
}

// ==================== Middleware ====================

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip static assets
    if (isExcludedPath(pathname)) {
        return NextResponse.next()
    }

    // Get token from cookie
    const accessToken = request.cookies.get('creatorx_admin_access_token')?.value

    // Handle public routes
    if (isPublicRoute(pathname)) {
        // Redirect authenticated admins away from login
        if (accessToken && !isTokenExpired(accessToken) && hasAdminRole(accessToken)) {
            if (pathname === '/login') {
                return NextResponse.redirect(new URL('/', request.url))
            }
        }
        return NextResponse.next()
    }

    // ==================== Protected Route Checks ====================

    // No token
    if (!accessToken) {
        return NextResponse.redirect(
            new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
        )
    }

    // Token too short
    if (accessToken.length < 20) {
        return NextResponse.redirect(
            new URL('/login?error=invalid_token', request.url)
        )
    }

    // Token expired
    if (isTokenExpired(accessToken)) {
        return NextResponse.redirect(
            new URL(`/login?redirect=${encodeURIComponent(pathname)}&error=session_expired`, request.url)
        )
    }

    // ⚠️ CRITICAL: Verify ADMIN role
    if (!hasAdminRole(accessToken)) {
        const role = getTokenRole(accessToken) || 'unknown'
        console.warn(`[Admin Middleware] Non-admin access attempt. Role: ${role}`)

        return NextResponse.redirect(
            new URL(`/unauthorized?role=${role}`, request.url)
        )
    }

    // Token valid and has ADMIN role - allow request
    const response = NextResponse.next()

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return response
}

// ==================== Config ====================

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}

/**
 * Next.js Middleware for Brand Dashboard
 *
 * Protects dashboard routes by checking JWT authentication.
 * - Validates token presence in cookies
 * - Checks token expiration (basic check, full validation on backend)
 * - Redirects unauthenticated users to login
 * - Allows authenticated users to bypass login page
 *
 * Protected: All routes except /login, /register, /forgot-password
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ==================== Route Configuration ====================

// Routes that don't require authentication
const PUBLIC_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
]

// API routes that don't require auth (webhooks, health checks)
const PUBLIC_API_ROUTES = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/health',
    '/api/webhook',
]

// Static assets to exclude from middleware
const EXCLUDED_PATHS = [
    '/_next',
    '/favicon.ico',
    '/images',
    '/icons',
    '/fonts',
]

// ==================== Helper Functions ====================

function isExcludedPath(pathname: string): boolean {
    return EXCLUDED_PATHS.some((path) => pathname.startsWith(path))
}

function isPublicRoute(pathname: string): boolean {
    return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))
}

function isPublicApiRoute(pathname: string): boolean {
    return PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))
}

/**
 * Decode JWT token to extract claims (basic decode, not cryptographic verification)
 * Full verification happens on the backend
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null

        // Decode base64url to base64
        let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')

        // Add padding if needed
        while (payload.length % 4) {
            payload += '='
        }

        const decoded = atob(payload)
        return JSON.parse(decoded)
    } catch {
        return null
    }
}

/**
 * Check if token is expired based on exp claim
 */
function isTokenExpired(token: string): boolean {
    const payload = decodeJwtPayload(token)
    if (!payload || typeof payload.exp !== 'number') return true

    // Add 30 second buffer for clock skew
    const now = Math.floor(Date.now() / 1000) + 30
    return payload.exp < now
}

/**
 * Check if token has BRAND role
 */
function hasBrandRole(token: string): boolean {
    const payload = decodeJwtPayload(token)
    if (!payload) return false

    // Check various claim locations
    const role = payload.role ||
        (payload.user_metadata as any)?.role ||
        (payload.app_metadata as any)?.role

    return role === 'BRAND'
}

// ==================== Middleware Function ====================

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip static assets
    if (isExcludedPath(pathname)) {
        return NextResponse.next()
    }

    // Allow public API routes
    if (isPublicApiRoute(pathname)) {
        return NextResponse.next()
    }

    // Get token from cookie
    const accessToken = request.cookies.get('creatorx_access_token')?.value

    // Handle public routes
    if (isPublicRoute(pathname)) {
        // If authenticated user tries to access login/register, redirect to dashboard
        if (accessToken && !isTokenExpired(accessToken)) {
            if (pathname === '/login' || pathname === '/register') {
                return NextResponse.redirect(new URL('/', request.url))
            }
        }
        return NextResponse.next()
    }

    // ==================== Protected Route Handling ====================

    // No token - redirect to login
    if (!accessToken) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Token is too short to be valid
    if (accessToken.length < 20) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'invalid_token')
        return NextResponse.redirect(loginUrl)
    }

    // Token is expired
    if (isTokenExpired(accessToken)) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        loginUrl.searchParams.set('error', 'session_expired')
        return NextResponse.redirect(loginUrl)
    }

    // Optional: Check for BRAND role (comment out if not needed)
    // if (!hasBrandRole(accessToken)) {
    //   const loginUrl = new URL('/login', request.url)
    //   loginUrl.searchParams.set('error', 'unauthorized_role')
    //   return NextResponse.redirect(loginUrl)
    // }

    // Token is valid - allow request and add security headers
    const response = NextResponse.next()

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return response
}

// ==================== Middleware Config ====================

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - public folder assets
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
}

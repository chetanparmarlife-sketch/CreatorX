/**
 * refresh-token/route.ts
 * Refreshes the admin access token using the HttpOnly refresh cookie.
 * The old flow read refresh tokens from localStorage; this keeps them server-managed.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (!refreshToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL
  if (!baseUrl) {
    return NextResponse.json({ message: 'Backend API URL is not configured' }, { status: 500 })
  }

  const response = await fetch(`${baseUrl}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Send the refresh token from the HttpOnly cookie instead of exposing it through localStorage.
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    return NextResponse.json({ authenticated: false }, { status: response.status })
  }

  const data = await response.json()
  const accessToken = data.token ?? data.accessToken
  const nextRefreshToken = data.refreshToken ?? refreshToken

  if (!accessToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  cookieStore.set('access_token', accessToken, {
    httpOnly: true, // JS cannot read this like it could read localStorage.
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production.
    sameSite: 'lax', // Browser CSRF protection while keeping normal admin navigation working.
    maxAge: 60 * 60 * 24, // 24 hours.
    path: '/',
  })

  cookieStore.set('refresh_token', nextRefreshToken, {
    httpOnly: true, // JS cannot read this like it could read localStorage.
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production.
    sameSite: 'lax', // Browser CSRF protection while keeping normal admin navigation working.
    maxAge: 60 * 60 * 24 * 30, // 30 days.
    path: '/',
  })

  return NextResponse.json({ authenticated: true, token: accessToken })
}

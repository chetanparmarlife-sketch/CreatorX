/**
 * set-tokens/route.ts
 * Sets auth tokens as HttpOnly cookies.
 * HttpOnly means JavaScript cannot read these cookies - only the browser sends them.
 * This protects against XSS attacks where malicious scripts try to steal tokens.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { accessToken, refreshToken } = await request.json()
  const cookieStore = cookies()
  // Clear legacy JS-readable cookies that were used before HttpOnly cookie storage.
  cookieStore.delete('creatorx_access_token')
  cookieStore.delete('creatorx_refresh_token')

  cookieStore.set('access_token', accessToken, {
    httpOnly: true, // JS cannot read this like it could read localStorage.
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production.
    sameSite: 'lax', // Protects against CSRF.
    maxAge: 60 * 60 * 24, // 24 hours.
    path: '/',
  })

  if (refreshToken) {
    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true, // JS cannot read this like it could read localStorage.
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production.
      sameSite: 'lax', // Protects against CSRF.
      maxAge: 60 * 60 * 24 * 30, // 30 days.
      path: '/',
    })
  } else {
    // Remove any old HttpOnly refresh cookie when the backend does not return a replacement.
    cookieStore.delete('refresh_token')
  }

  return NextResponse.json({ success: true })
}

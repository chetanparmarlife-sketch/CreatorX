/**
 * get-token/route.ts
 * Returns the access token for client-side API calls.
 * The token itself stays in HttpOnly cookie - this route
 * just signals whether the user is authenticated.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get('access_token')
  if (!token) return NextResponse.json({ authenticated: false }, { status: 401 })
  return NextResponse.json({ authenticated: true, token: token.value })
}

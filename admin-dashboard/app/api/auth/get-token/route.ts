/**
 * get-token/route.ts
 * Returns the admin access token for client-side API calls.
 * The token is stored in an HttpOnly cookie instead of localStorage,
 * which keeps JavaScript from reading it directly outside this route.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get('access_token')

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true, token: token.value })
}

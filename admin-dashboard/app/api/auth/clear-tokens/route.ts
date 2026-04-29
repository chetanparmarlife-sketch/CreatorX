/**
 * clear-tokens/route.ts
 * Clears admin auth cookies on logout.
 * This replaces the old localStorage token removal with server-managed HttpOnly cookies.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = cookies()

  // Clear secure HttpOnly cookies used by the new admin token storage flow.
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')

  // Clear legacy JS-readable cookies left by the old admin localStorage-era auth flow.
  cookieStore.delete('creatorx_admin_access_token')
  cookieStore.delete('creatorx_admin_refresh_token')

  return NextResponse.json({ success: true })
}

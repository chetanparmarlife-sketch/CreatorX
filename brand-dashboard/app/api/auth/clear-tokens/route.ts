/**
 * clear-tokens/route.ts
 * Clears auth cookies on logout.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = cookies()
  cookieStore.delete('access_token')
  cookieStore.delete('refresh_token')
  // Clear legacy JS-readable cookies left by the old localStorage-era auth flow.
  cookieStore.delete('creatorx_access_token')
  cookieStore.delete('creatorx_refresh_token')
  return NextResponse.json({ success: true })
}

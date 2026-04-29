import { NextResponse } from 'next/server'

/**
 * brand-events/route.ts
 *
 * Previously: logged events locally and returned 202 - no real processing.
 * Now: forwards events to the backend analytics service for real tracking.
 *
 * This powers campaign performance metrics shown to brands.
 */
export async function POST(request: Request) {
  try {
    const events = await request.json()
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL

    if (!backendUrl) {
      // Analytics stays non-fatal; missing backend config should never break brand pages.
      console.error('Analytics ingestion skipped: backend URL is not configured')
      return NextResponse.json({ success: false }, { status: 202 })
    }

    const normalizedBackendUrl = backendUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '')

    // Forward to backend analytics ingestion endpoint instead of logging only in this route.
    const response = await fetch(`${normalizedBackendUrl}/api/v1/analytics/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') ?? '',
      },
      body: JSON.stringify(events),
    })

    if (!response.ok) {
      // Analytics remains non-fatal; backend ingestion errors are logged but never shown to brands.
      console.error(`Analytics ingestion backend returned ${response.status}`)
      return NextResponse.json({ success: false }, { status: 202 })
    }

    return NextResponse.json({ success: true }, { status: 202 })
  } catch (error) {
    // Non-fatal: analytics failure should never break the user experience.
    console.error('Analytics ingestion failed (non-fatal):', error)
    return NextResponse.json({ success: false }, { status: 202 })
  }
}

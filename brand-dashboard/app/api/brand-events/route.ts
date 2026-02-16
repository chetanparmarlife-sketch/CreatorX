import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const payload = await request.json()

    if (process.env.NODE_ENV !== 'production') {
      console.info('[brand-event]', payload?.event, payload)
    }

    return NextResponse.json({ ok: true }, { status: 202 })
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid event payload' }, { status: 400 })
  }
}

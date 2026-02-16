'use client'

export const BRAND_EVENTS = [
  'dashboard_viewed',
  'priority_card_clicked',
  'quick_action_clicked',
  'campaign_created_from_dashboard',
  'deliverable_review_started',
  'wallet_fund_initiated',
  'wallet_fund_success',
] as const

export type BrandEventName = (typeof BRAND_EVENTS)[number]

type WalletBalanceBand = 'empty' | 'low' | 'healthy' | 'strong' | 'unknown'

type BrandEventProperties = Record<string, string | number | boolean | null>

export interface BrandEventPayload {
  event: BrandEventName
  brand_id: string
  route: string
  time_since_login_sec: number
  pending_deliverables_count: number | null
  wallet_balance_band: WalletBalanceBand
  properties?: BrandEventProperties
}

const EVENT_QUEUE_KEY = 'creatorx_brand_event_queue'
const DEFAULT_ENDPOINT = '/api/brand-events'
const endpoint = process.env.NEXT_PUBLIC_BRAND_ANALYTICS_ENDPOINT || DEFAULT_ENDPOINT

export const getWalletBalanceBand = (walletBalance?: number | null): WalletBalanceBand => {
  if (typeof walletBalance !== 'number') return 'unknown'
  if (walletBalance <= 0) return 'empty'
  if (walletBalance < 5000) return 'low'
  if (walletBalance < 25000) return 'healthy'
  return 'strong'
}

const queueEventLocally = (eventPayload: Record<string, unknown>) => {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(EVENT_QUEUE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>[]) : []
    parsed.push(eventPayload)
    localStorage.setItem(EVENT_QUEUE_KEY, JSON.stringify(parsed.slice(-200)))
  } catch {
    // Keep telemetry non-blocking.
  }
}

export const emitBrandEvent = async (payload: BrandEventPayload) => {
  if (typeof window === 'undefined') return

  const eventPayload = {
    ...payload,
    sent_at: new Date().toISOString(),
  }

  queueEventLocally(eventPayload)

  const body = JSON.stringify(eventPayload)

  try {
    if (navigator.sendBeacon) {
      const didQueue = navigator.sendBeacon(
        endpoint,
        new Blob([body], { type: 'application/json' })
      )
      if (didQueue) return
    }
  } catch {
    // Fall through to fetch.
  }

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
    })
  } catch {
    // Keep telemetry non-blocking.
  }
}

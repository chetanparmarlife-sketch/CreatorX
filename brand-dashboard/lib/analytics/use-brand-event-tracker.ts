'use client'

import { useCallback, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { emitBrandEvent, getWalletBalanceBand, type BrandEventName } from '@/lib/analytics/brand-events'
import { useAuthStore } from '@/lib/store/auth-store'

type BrandEventProperties = Record<string, string | number | boolean | null | undefined>

interface BrandEventContext {
  pendingDeliverablesCount?: number | null
  walletBalance?: number | null
  route?: string
}

const LOGIN_STARTED_AT_KEY = 'creatorx_brand_login_started_at'

const sanitizeProperties = (properties: BrandEventProperties) =>
  Object.entries(properties).reduce<Record<string, string | number | boolean | null>>(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    },
    {}
  )

const resolveSessionStartTime = () => {
  if (typeof window === 'undefined') return Date.now()
  const existing = localStorage.getItem(LOGIN_STARTED_AT_KEY)
  if (existing) {
    const parsed = Number(existing)
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed
    }
  }
  const now = Date.now()
  localStorage.setItem(LOGIN_STARTED_AT_KEY, String(now))
  return now
}

export const useBrandEventTracker = (context: BrandEventContext = {}) => {
  const pathname = usePathname()
  const brandId = useAuthStore((state) => state.user?.userId)
  const sessionStartedAt = useRef<number>(0)

  useEffect(() => {
    sessionStartedAt.current = resolveSessionStartTime()
  }, [])

  const track = useCallback(
    (event: BrandEventName, properties: BrandEventProperties = {}) => {
      if (typeof window === 'undefined') return

      const startedAt = sessionStartedAt.current || resolveSessionStartTime()
      sessionStartedAt.current = startedAt

      const payloadRoute =
        context.route ||
        pathname ||
        (typeof window !== 'undefined' ? window.location.pathname : '/dashboard')

      void emitBrandEvent({
        event,
        brand_id: brandId || 'anonymous',
        route: payloadRoute,
        time_since_login_sec: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
        pending_deliverables_count:
          typeof context.pendingDeliverablesCount === 'number'
            ? context.pendingDeliverablesCount
            : null,
        wallet_balance_band: getWalletBalanceBand(context.walletBalance),
        properties: sanitizeProperties(properties),
      })
    },
    [brandId, context.pendingDeliverablesCount, context.route, context.walletBalance, pathname]
  )

  return { track }
}

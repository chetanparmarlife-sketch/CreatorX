'use client'

import { adminSystemService } from '@/lib/api/admin/system'

export const ADMIN_EVENTS = [
  'workspace_viewed',
  'action_queue_item_opened',
  'bulk_action_started',
  'bulk_action_completed',
  'admin_queue_cleared',
  'quick_action_clicked',
] as const

export type AdminEventName = (typeof ADMIN_EVENTS)[number]

export type AdminEventProperties = Record<string, string | number | boolean | null | undefined>

const EVENT_QUEUE_KEY = 'creatorx_admin_event_queue'

const sanitizeProperties = (properties: AdminEventProperties) =>
  Object.entries(properties).reduce<Record<string, string | number | boolean | null>>(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value
      }
      return acc
    },
    {}
  )

const queueEventLocally = (payload: Record<string, unknown>) => {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(EVENT_QUEUE_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>[]) : []
    parsed.push(payload)
    localStorage.setItem(EVENT_QUEUE_KEY, JSON.stringify(parsed.slice(-200)))
  } catch {
    // Telemetry must never block admin work.
  }
}

const encodePath = (route: string, properties: Record<string, string | number | boolean | null>) => {
  const entries = Object.entries(properties)
  if (entries.length === 0) return route
  const params = new URLSearchParams()
  entries.forEach(([key, value]) => {
    params.set(key, String(value))
  })
  return `${route}?${params.toString()}`
}

export const emitAdminEvent = async (
  event: AdminEventName,
  route: string,
  properties: AdminEventProperties = {}
) => {
  if (typeof window === 'undefined') return

  const sanitized = sanitizeProperties(properties)
  const payload = {
    event,
    route,
    properties: sanitized,
    sent_at: new Date().toISOString(),
  }

  queueEventLocally(payload)

  try {
    await adminSystemService.trackSession(event, encodePath(route, sanitized))
  } catch {
    // The local queue still preserves a best-effort trail for later inspection.
  }
}

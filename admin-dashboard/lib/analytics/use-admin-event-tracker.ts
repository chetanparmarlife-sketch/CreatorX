'use client'

import { useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { emitAdminEvent, type AdminEventName, type AdminEventProperties } from '@/lib/analytics/admin-events'

export const useAdminEventTracker = () => {
  const pathname = usePathname()

  const track = useCallback(
    (event: AdminEventName, properties: AdminEventProperties = {}) => {
      const route =
        pathname ||
        (typeof window !== 'undefined' ? window.location.pathname : '/admin')

      void emitAdminEvent(event, route, properties)
    },
    [pathname]
  )

  return { track }
}

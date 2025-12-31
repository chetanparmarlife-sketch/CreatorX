"use client"

import { useCallback, useState } from 'react'
import type { ToastItem, ToastTone } from '@/components/shared/toast'

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const pushToast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, message, tone }])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return { toasts, pushToast, dismissToast }
}

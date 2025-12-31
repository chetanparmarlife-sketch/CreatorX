"use client"

import { useEffect } from 'react'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  tone?: ToastTone
}

interface ToastStackProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  useEffect(() => {
    if (!toasts.length) return
    const timers = toasts.map((toast) =>
      window.setTimeout(() => onDismiss(toast.id), 3200)
    )
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [toasts, onDismiss])

  if (!toasts.length) return null

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const tone = toast.tone || 'info'
        const toneStyles =
          tone === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : tone === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-slate-200 bg-white text-slate-700'
        return (
          <div
            key={toast.id}
            className={`rounded-xl border px-4 py-3 text-sm shadow-lg ${toneStyles}`}
          >
            {toast.message}
          </div>
        )
      })}
    </div>
  )
}

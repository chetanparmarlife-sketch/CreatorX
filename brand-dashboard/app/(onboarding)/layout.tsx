'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { tokenStorage } from '@/lib/auth/tokenStorage'

const COMPLETED_STATUSES = ['APPROVED', 'SUBMITTED', 'UNDER_REVIEW']

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [hasToken, setHasToken] = useState<boolean | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      // Auth checks now read the HttpOnly cookie-backed token route instead of localStorage token keys.
      const token = await tokenStorage.getAccessToken()

      if (!token) {
        setHasToken(false)
        router.push('/login')
        return
      }

      setHasToken(true)
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!user) return
    if (COMPLETED_STATUSES.includes(user.onboardingStatus ?? '')) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (hasToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center dashboard-shell">
        <div className="loading-card">
          <div className="loading-ring"></div>
          <p className="mt-5 text-sm uppercase tracking-[0.28em] text-amber-700/70">
            Setting Up
          </p>
        </div>
      </div>
    )
  }

  if (!hasToken) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/30">
      <div className="mx-auto max-w-2xl px-4 py-10 md:py-16">
        <div className="mb-8 text-center">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 mb-1">
            Premium Suite
          </p>
          <h1 className="text-2xl font-bold text-slate-900">CreatorX</h1>
        </div>
        {children}
      </div>
    </div>
  )
}

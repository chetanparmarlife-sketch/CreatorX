'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { Sidebar } from '@/components/layout/sidebar'
import { OnboardingBanner } from '@/components/shared/onboarding-banner'
import { getDashboardRouteTitle } from '@/components/layout/brand-nav'
import { Menu, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { tokenStorage } from '@/lib/auth/tokenStorage'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const refreshAuth = useAuthStore((s) => s.checkAuth)
  const [hasToken, setHasToken] = useState<boolean | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  useEffect(() => {
    const checkAuth = async () => {
      // Auth checks now read the HttpOnly cookie-backed token route instead of localStorage token keys.
      const token = await tokenStorage.getAccessToken()

      if (token) {
        setHasToken(true)
        // Refresh user data from backend (updates onboardingStatus after admin approval)
        refreshAuth()
        return
      }

      // Check Supabase session (async -- getSession returns a Promise)
      if (typeof window !== 'undefined' && (window as any).supabase) {
        try {
          const { data } = await (window as any).supabase.auth.getSession()
          if (data?.session) {
            setHasToken(true)
            return
          }
        } catch {
          // Supabase not available, fall through
        }
      }

      setHasToken(false)
      router.push('/login')
    }

    checkAuth()
  }, [router])

  if (hasToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center dashboard-shell">
        <div className="loading-card">
          <div className="loading-ring"></div>
          <p className="mt-5 text-sm uppercase tracking-[0.28em] text-amber-700/70">
            Preparing Workspace
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            Loading your brand dashboard.
          </p>
          <p className="mt-2 text-xs text-slate-500">Syncing campaigns and creator activity.</p>
        </div>
      </div>
    )
  }

  if (!hasToken) {
    return null
  }

  // Hard gate: DRAFT/REJECTED brands must complete onboarding first
  const onboardingStatus = user?.onboardingStatus
  if (onboardingStatus === 'DRAFT' || onboardingStatus === 'REJECTED') {
    router.push('/onboarding')
    return null
  }

  const pageTitle = getDashboardRouteTitle(pathname)

  return (
    <div className="min-h-screen dashboard-shell">
      <Sidebar />
      <div className="lg:hidden sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Brand Workspace</p>
            <p className="text-sm font-semibold text-slate-900">{pageTitle}</p>
          </div>
          <Button size="sm" onClick={() => router.push('/campaigns/new')}>
            <Plus className="mr-1 h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-950/45"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation menu"
          />
          <div className="absolute inset-y-0 left-0 w-[84vw] max-w-[320px]">
            <div className="h-full bg-slate-950">
              <div className="flex justify-end p-3">
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-slate-200"
                  aria-label="Close navigation menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <main className="px-4 py-6 md:px-6 md:py-8 lg:ml-64 lg:px-10 lg:py-10 page-fade">
        <div className="mx-auto max-w-[1520px]">
          <OnboardingBanner onboardingStatus={user?.onboardingStatus} />
          {children}
        </div>
      </main>
    </div>
  )
}

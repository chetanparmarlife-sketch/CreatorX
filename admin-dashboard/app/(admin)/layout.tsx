'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { adminSystemService } from '@/lib/api/admin/system'
import { getAccessToken } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/auth-store'
import { AdminSidebar, getAdminRouteTitle } from '@/components/layout/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useAuthStore()
  const [hasToken, setHasToken] = useState<boolean | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  useEffect(() => {
    const checkAuth = async () => {
      // Read the admin token through the HttpOnly cookie route instead of localStorage token keys.
      const token = await getAccessToken()

      if (token) {
        // Decode JWT payload and verify ADMIN role
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          const role = payload.role || payload.user_metadata?.role || user?.role
          if (role !== 'ADMIN') {
            setHasToken(false)
            router.push('/login')
            return
          }
        } catch {
          // Malformed token, reject
          setHasToken(false)
          router.push('/login')
          return
        }
        setHasToken(true)
        return
      }

      // Check Supabase session (async, getSession returns a Promise)
      if (typeof window !== 'undefined' && (window as any).supabase) {
        try {
          const { data } = await (window as any).supabase.auth.getSession()
          if (data?.session) {
            const payload = JSON.parse(atob(data.session.access_token.split('.')[1]))
            const role = payload.role || payload.user_metadata?.role
            if (role !== 'ADMIN') {
              setHasToken(false)
              router.push('/login')
              return
            }
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
  }, [router, user])

  useEffect(() => {
    if (!hasToken) {
      return
    }
    const today = new Date().toISOString().slice(0, 10)
    const lastTracked = localStorage.getItem('admin_session_last')
    if (lastTracked === today) {
      return
    }
    adminSystemService.trackSession('SESSION_START', window.location.pathname).catch(() => null)
    localStorage.setItem('admin_session_last', today)
  }, [hasToken])

  if (hasToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center dashboard-shell">
        <div className="loading-card">
          <div className="loading-ring"></div>
          <p className="mt-5 text-[10px] uppercase tracking-[0.32em] text-slate-500">
            Initializing Console
          </p>
          <p className="mt-2 text-base font-semibold text-slate-900">Loading operational view.</p>
          <p className="mt-2 text-xs text-slate-500">Refreshing queues and system signals.</p>
        </div>
      </div>
    )
  }

  if (!hasToken) {
    return null
  }

  const pageTitle = getAdminRouteTitle(pathname)

  return (
    <div className="min-h-screen dashboard-shell">
      <AdminSidebar />

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
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Admin Console</p>
            <p className="text-sm font-semibold text-slate-900">{pageTitle}</p>
          </div>
          <div className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
            Live
          </div>
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
              <AdminSidebar mobile onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <main className="px-4 py-6 md:px-6 md:py-8 lg:ml-64 lg:px-10 lg:py-10 page-fade">
        <div className="max-w-[1480px] mx-auto">{children}</div>
      </main>
    </div>
  )
}

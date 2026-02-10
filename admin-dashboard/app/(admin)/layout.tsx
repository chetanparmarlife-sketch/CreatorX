'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminSystemService } from '@/lib/api/admin/system'
import { useAuthStore } from '@/lib/store/auth-store'
import { AdminSidebar } from '@/components/layout/admin-sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [hasToken, setHasToken] = useState<boolean | null>(null)

  useEffect(() => {
    const token =
      localStorage.getItem('creatorx_admin_access_token') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('creatorx_access_token')

    const hasSupabaseSession =
      typeof window !== 'undefined' &&
      (window as any).supabase &&
      (window as any).supabase.auth.getSession()

    if (!token && !hasSupabaseSession) {
      setHasToken(false)
      router.push('/login')
      return
    }


    setHasToken(true)
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
          <p className="mt-2 text-base font-semibold text-slate-900">
            Loading operational view.
          </p>
          <p className="mt-2 text-xs text-slate-500">Refreshing queues and system signals.</p>
        </div>
      </div>
    )
  }

  if (!hasToken) {
    return null
  }

  return (
    <div className="min-h-screen dashboard-shell">
      <AdminSidebar />
      <main className="ml-64 px-6 py-8 lg:px-10 lg:py-10 page-fade">
        <div className="max-w-[1480px] mx-auto">{children}</div>
      </main>
    </div>
  )
}

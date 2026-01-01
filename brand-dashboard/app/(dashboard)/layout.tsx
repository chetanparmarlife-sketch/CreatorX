'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [hasToken, setHasToken] = useState<boolean | null>(null)

  useEffect(() => {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('creatorx_access_token')
    
    const hasSupabaseSession = typeof window !== 'undefined' && 
      (window as any).supabase && 
      (window as any).supabase.auth.getSession()

    if (!token && !hasSupabaseSession) {
      setHasToken(false)
      router.push('/login')
      return
    }

    setHasToken(true)
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

  return (
    <div className="min-h-screen dashboard-shell">
      <Sidebar />
      <main className="ml-64 px-6 py-8 lg:px-10 lg:py-10 page-fade">
        <div className="max-w-[1480px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

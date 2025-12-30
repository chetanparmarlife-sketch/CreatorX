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
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
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
      <main className="ml-64 p-8">
        <div className="max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user } = useAuthStore()
  const [hasToken, setHasToken] = useState<boolean | null>(null)

  useEffect(() => {
    // Check for token in localStorage (from Supabase or backend)
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('creatorx_access_token')
    
    // Also check if Supabase session exists
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!hasToken) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:pl-64">
          <Header user={user} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}


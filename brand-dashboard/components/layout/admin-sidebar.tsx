'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/lib/store/auth-store'
import {
  Shield,
  Users,
  FileCheck,
  Building2,
  AlertTriangle,
  Flag,
  Scale,
  ClipboardList,
  Settings,
  Activity,
  BadgeDollarSign,
  LogOut,
  ChevronUp,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    items: [
      { label: 'Overview', icon: Shield, href: '/admin' },
    ],
  },
  {
    title: 'USER MANAGEMENT',
    items: [
      { label: 'Users', icon: Users, href: '/admin/users' },
      { label: 'KYC Review', icon: FileCheck, href: '/admin/kyc' },
      { label: 'Brand Verification', icon: Building2, href: '/admin/brands' },
      { label: 'Appeals', icon: AlertTriangle, href: '/admin/appeals' },
    ],
  },
  {
    title: 'MODERATION',
    items: [
      { label: 'Campaign Flags', icon: Flag, href: '/admin/campaigns' },
      { label: 'Moderation Rules', icon: ClipboardList, href: '/admin/moderation' },
      { label: 'Disputes', icon: Scale, href: '/admin/disputes' },
    ],
  },
  {
    title: 'COMPLIANCE',
    items: [
      { label: 'GDPR Requests', icon: ClipboardList, href: '/admin/compliance' },
      { label: 'Audit Log', icon: Activity, href: '/admin/audit' },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { label: 'Reconciliation', icon: BadgeDollarSign, href: '/admin/finance' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Settings', icon: Settings, href: '/admin/settings' },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const brandDashboardUrl = process.env.NEXT_PUBLIC_BRAND_DASHBOARD_URL || '/dashboard'

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="w-64 h-screen bg-slate-950 border-r border-slate-800/70 text-slate-100 flex flex-col fixed left-0 top-0">
      <div className="px-6 py-6">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Admin Console</p>
        <h2 className="text-xl font-semibold text-white">CreatorX</h2>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-6">
            {section.title && (
              <div className="px-3 mb-2">
                <span className="text-xs font-semibold tracking-[0.2em] text-slate-400">
                  {section.title}
                </span>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800/70">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm text-slate-200">
              <div>
                <p className="font-medium">{user?.email || 'Admin'}</p>
                <p className="text-xs text-slate-400">Administrator</p>
              </div>
              <ChevronUp className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuItem onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sign out
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="gap-2">
              <Link href={brandDashboardUrl}>
                <Shield className="w-4 h-4" />
                Switch to Brand
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

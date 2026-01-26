'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/lib/store/auth-store'
import { adminSystemService } from '@/lib/api/admin/system'
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
  KeyRound,
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
  count?: number
  slaBadge?: string
  slaTone?: 'default' | 'warning' | 'danger'
}

interface NavSection {
  title?: string
  items: NavItem[]
}

const getSlaTone = (breaches?: number): NavItem['slaTone'] => {
  if (!breaches) return 'default'
  if (breaches >= 5) return 'danger'
  return 'warning'
}

const buildNavSections = (summary?: {
  pendingKyc?: number
  openCampaignFlags?: number
  openDisputes?: number
  pendingGdprRequests?: number
  gdprSlaBreaches?: number
  kycSlaBreaches?: number
  disputeSlaBreaches?: number
}) => [
  {
    items: [{ label: 'Overview', icon: Shield, href: '/admin' }],
  },
  {
    title: 'WORK QUEUE',
    items: [
      {
        label: 'KYC Review',
        icon: FileCheck,
        href: '/admin/kyc',
        count: summary?.pendingKyc,
        slaBadge: summary ? `${summary.kycSlaBreaches ?? 0} SLA` : undefined,
        slaTone: getSlaTone(summary?.kycSlaBreaches),
      },
      {
        label: 'Campaign Flags',
        icon: Flag,
        href: '/admin/campaigns',
        count: summary?.openCampaignFlags,
      },
      {
        label: 'Disputes',
        icon: Scale,
        href: '/admin/disputes',
        count: summary?.openDisputes,
        slaBadge: summary ? `${summary.disputeSlaBreaches ?? 0} SLA` : undefined,
        slaTone: getSlaTone(summary?.disputeSlaBreaches),
      },
      {
        label: 'GDPR Requests',
        icon: ClipboardList,
        href: '/admin/compliance',
        count: summary?.pendingGdprRequests,
        slaBadge: summary ? `${summary.gdprSlaBreaches ?? 0} SLA` : undefined,
        slaTone: getSlaTone(summary?.gdprSlaBreaches),
      },
    ],
  },
  {
    title: 'USER MANAGEMENT',
    items: [
      { label: 'Users', icon: Users, href: '/admin/users' },
      { label: 'Brand Verification', icon: Building2, href: '/admin/brands' },
      { label: 'Appeals', icon: AlertTriangle, href: '/admin/appeals' },
    ],
  },
  {
    title: 'MODERATION',
    items: [
      { label: 'Campaign Reviews', icon: ClipboardList, href: '/admin/campaign-reviews' },
      { label: 'Moderation Rules', icon: ClipboardList, href: '/admin/moderation' },
    ],
  },
  {
    title: 'CAMPAIGNS',
    items: [
      { label: 'Campaign Management', icon: ClipboardList, href: '/admin/campaign-management' },
      { label: 'Applications', icon: ClipboardList, href: '/admin/applications' },
      { label: 'Deliverables', icon: ClipboardList, href: '/admin/deliverables' },
      { label: 'Messages', icon: ClipboardList, href: '/admin/messages' },
    ],
  },
  {
    title: 'COMPLIANCE',
    items: [
      { label: 'Reports', icon: ClipboardList, href: '/admin/compliance/reports' },
    ],
  },
  {
    title: 'FINANCE',
    items: [{ label: 'Reconciliation', icon: BadgeDollarSign, href: '/admin/finance' }],
  },
  {
    title: 'MONITORING',
    items: [
      { label: 'Audit Log', icon: Activity, href: '/admin/audit' },
      { label: 'Health', icon: Activity, href: '/admin/health' },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Settings', icon: Settings, href: '/admin/settings' },
      { label: 'Permissions', icon: KeyRound, href: '/admin/permissions' },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { data: summary } = useQuery({
    queryKey: ['admin-system-summary-nav'],
    queryFn: () => adminSystemService.getSummary(),
  })
  const navSections = buildNavSections(summary)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <div className="w-64 h-screen bg-slate-950 border-r border-slate-800/80 text-slate-100 flex flex-col fixed left-0 top-0 shadow-[0_0_40px_rgba(15,23,42,0.4)]">
      <div className="px-6 py-6">
        <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Admin Console</p>
        <h2 className="text-xl font-semibold text-white">CreatorX</h2>
      </div>

      <nav className="flex-1 px-3 pr-2 overflow-y-auto sidebar-scroll">
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-6">
            {section.title && (
              <div className="px-3 mb-2">
                <span className="text-xs font-semibold tracking-[0.28em] text-slate-500">
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
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent text-sm font-medium transition-all',
                      isActive
                        ? 'bg-white/12 text-white border-white/15 shadow-[0_10px_20px_rgba(15,23,42,0.25)]'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.count !== undefined && (
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] text-white">
                        {item.count}
                      </span>
                    )}
                    {item.slaBadge && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide',
                          item.slaTone === 'danger' && 'bg-red-500/25 text-red-100',
                          item.slaTone === 'warning' && 'bg-amber-500/25 text-amber-100',
                          item.slaTone === 'default' && 'bg-white/10 text-slate-200'
                        )}
                      >
                        {item.slaBadge}
                      </span>
                    )}
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
            <button className="w-full flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/lib/store/auth-store'
import { deliverableService } from '@/lib/api/deliverables'
import { brandNavSections } from '@/components/layout/brand-nav'
import {
  Settings,
  User,
  LogOut,
  ChevronUp,
  HelpCircle,
  Flame,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Sidebar({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { data: pendingDeliverables } = useQuery({
    queryKey: ['deliverables-pending-count'],
    queryFn: () => deliverableService.getBrandDeliverables({ status: 'PENDING', page: 0, size: 1 }),
  })
  const pendingPage = pendingDeliverables as { items?: any[]; total?: number } | undefined
  const pendingCount = pendingPage?.total ?? pendingPage?.items?.length ?? 0

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase()
    }
    return 'CF'
  }

  return (
    <aside
      className={cn(
        'bg-slate-950 border-r border-slate-800/70 text-slate-100 flex flex-col shadow-[0_0_40px_rgba(15,23,42,0.35)]',
        mobile ? 'h-full w-full' : 'fixed left-0 top-0 h-screen w-64 hidden lg:flex'
      )}
    >
      <div className="px-6 py-6">
        <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Premium Suite</p>
        <h2 className="text-xl font-semibold text-white">CreatorX</h2>
        <div className="mt-4 rounded-xl border border-slate-700/70 bg-white/5 p-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>Pending approvals</span>
            <span className="font-semibold text-white">{pendingCount}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.min(100, pendingCount * 12)}%` }}
            />
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
            <Flame className="h-3.5 w-3.5" />
            Keep turnaround under 48 hours.
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 pr-2 overflow-y-auto sidebar-scroll">
        {brandNavSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-6">
            {section.title && (
              <div className="px-3 mb-2">
                <span className="text-[11px] font-semibold tracking-[0.22em] text-slate-500 whitespace-nowrap">
                  {section.title}
                </span>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-transparent transition-all',
                      isActive
                        ? 'bg-white/12 text-white border-white/10 shadow-[0_10px_20px_rgba(15,23,42,0.25)]'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                    {item.href === '/deliverables' && pendingCount > 0 && (
                      <span className="ml-auto rounded-full bg-primary/80 px-2 py-0.5 text-xs text-primary-foreground">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800/70">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground ring-1 ring-white/20">
                <span className="text-sm font-medium">{getUserInitials()}</span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {user?.email?.split('@')[0] || 'Demo Brand'}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {user?.email || 'demo@creatorx.com'}
                </div>
              </div>
              <ChevronUp className="w-4 h-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-64">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/help" className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Help & Support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
              <LogOut className="w-4 h-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

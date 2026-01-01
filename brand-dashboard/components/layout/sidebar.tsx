'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/lib/store/auth-store'
import { deliverableService } from '@/lib/api/deliverables'
import {
  Home,
  Instagram,
  Facebook,
  Youtube,
  Calendar,
  MessageSquare,
  List,
  CreditCard,
  Settings,
  User,
  LogOut,
  ChevronUp,
  HelpCircle,
  ClipboardCheck,
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
      { label: 'Home', icon: Home, href: '/dashboard' },
    ],
  },
  {
    title: 'INFLUENCER DISCOVERY',
    items: [
      { label: 'Instagram', icon: Instagram, href: '/instagram' },
      { label: 'Facebook', icon: Facebook, href: '/facebook' },
      { label: 'YouTube', icon: Youtube, href: '/youtube' },
    ],
  },
  {
    title: 'CAMPAIGN MANAGEMENT',
    items: [
      { label: 'Campaigns', icon: Calendar, href: '/campaigns' },
      { label: 'Applications', icon: ClipboardCheck, href: '/applications' },
      { label: 'Deliverables', icon: ClipboardCheck, href: '/deliverables' },
      { label: 'Messages', icon: MessageSquare, href: '/messages' },
      { label: 'Influencer Lists', icon: List, href: '/lists' },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { label: 'Payments', icon: CreditCard, href: '/payments' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { data: pendingDeliverables } = useQuery({
    queryKey: ['deliverables-pending-count'],
    queryFn: () => deliverableService.getBrandDeliverables('PENDING'),
  })
  const pendingCount = Array.isArray(pendingDeliverables)
    ? pendingDeliverables.length
    : 0

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
    <div className="w-64 h-screen bg-slate-950 border-r border-slate-800/70 text-slate-100 flex flex-col fixed left-0 top-0 shadow-[0_0_40px_rgba(15,23,42,0.35)]">
      <div className="px-6 py-6">
        <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Premium Suite</p>
        <h2 className="text-xl font-semibold text-white">CreatorX</h2>
      </div>

      <nav className="flex-1 px-3 pr-2 overflow-y-auto sidebar-scroll">
        {navSections.map((section, sectionIdx) => (
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
    </div>
  )
}

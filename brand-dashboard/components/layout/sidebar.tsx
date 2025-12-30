'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { useAuthStore } from '@/lib/store/auth-store'
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
      { label: 'Messages', icon: MessageSquare, href: '/messages' },
      { label: 'Influencer Lists', icon: List, href: '/lists' },
      { label: 'Payments', icon: CreditCard, href: '/payments' },
    ],
  },
  {
    items: [
      { label: 'Settings', icon: Settings, href: '/settings' },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

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
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0">
      <div className="px-6 py-6">
        <h2 className="text-xl font-semibold text-gray-900">CreatorX</h2>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="mb-6">
            {section.title && (
              <div className="px-3 mb-2">
                <span className="text-xs font-medium text-gray-500">{section.title}</span>
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
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white">
                <span className="text-sm font-medium">{getUserInitials()}</span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.email?.split('@')[0] || 'Demo Brand'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email || 'demo@creatorx.com'}
                </div>
              </div>
              <ChevronUp className="w-4 h-4 text-gray-400" />
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

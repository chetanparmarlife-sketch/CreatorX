'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  Megaphone,
  Users,
  MessageSquare,
  CreditCard,
  Settings,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/campaigns', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'Creators', href: '/creators', icon: Users },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-white lg:sticky lg:top-0 lg:h-screen">
      <div className="flex flex-col flex-grow pt-6 pb-6 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6">
          <h1 className="text-xl font-bold">CreatorX</h1>
        </div>
        <nav className="mt-8 flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  )}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}


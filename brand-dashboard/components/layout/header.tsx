'use client'

import { useRouter } from 'next/navigation'
import { AuthResponse } from '@/lib/types'
import { useAuthStore } from '@/lib/store/auth-store'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  user: AuthResponse | null
}

export function Header({ user }: HeaderProps) {
  const router = useRouter()
  const { logout } = useAuthStore()

  const companyName = user?.email ? user.email.split('@')[0] : 'Brand Account'
  const initials = companyName.slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Company</p>
          <h1 className="text-lg font-semibold text-slate-900">{companyName}</h1>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 px-2">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-purple-600 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="ml-2 hidden text-sm text-slate-600 md:inline">
                  {user?.email ?? 'brand@creatorx.com'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}


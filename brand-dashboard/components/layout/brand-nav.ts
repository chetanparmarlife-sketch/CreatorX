import {
  Home,
  Instagram,
  Facebook,
  Youtube,
  Calendar,
  MessageSquare,
  List,
  CreditCard,
  ClipboardCheck,
  LucideIcon,
} from 'lucide-react'

export interface BrandNavItem {
  label: string
  icon: LucideIcon
  href: string
}

export interface BrandNavSection {
  title?: string
  items: BrandNavItem[]
}

export const brandNavSections: BrandNavSection[] = [
  {
    items: [{ label: 'Home', icon: Home, href: '/dashboard' }],
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
    items: [{ label: 'Payments', icon: CreditCard, href: '/payments' }],
  },
]

const allItems = brandNavSections.flatMap((section) => section.items)
const allItemsByPathDepth = [...allItems].sort((a, b) => b.href.length - a.href.length)

export function getDashboardRouteTitle(pathname: string): string {
  const normalized = pathname.replace(/\/+$/, '') || '/dashboard'
  const matched = allItemsByPathDepth.find(
    (item) => normalized === item.href || normalized.startsWith(`${item.href}/`)
  )
  if (matched) return matched.label

  if (normalized.startsWith('/campaigns')) return 'Campaigns'
  if (normalized.startsWith('/creators')) return 'Creators'
  if (normalized.startsWith('/settings')) return 'Settings'
  if (normalized.startsWith('/profile')) return 'Profile'
  if (normalized.startsWith('/help')) return 'Help & Support'

  return 'Brand Dashboard'
}

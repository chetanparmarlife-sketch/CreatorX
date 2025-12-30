'use client'

import { useState, useEffect } from 'react'
import { Users, FileCheck, Building2, AlertTriangle, Flag, Scale, ClipboardList, BadgeDollarSign } from 'lucide-react'
import { StatCardsSkeleton } from '@/components/shared/skeleton'

const mockStats = [
  { label: 'Total Users', value: '12,450', icon: Users, trend: '+12%', color: 'bg-blue-500' },
  { label: 'Total Campaigns', value: '1,234', icon: Flag, trend: '+8%', color: 'bg-green-500' },
  { label: 'Pending KYC', value: '48', icon: FileCheck, trend: '-5%', color: 'bg-yellow-500' },
  { label: 'Brand Verifications', value: '23', icon: Building2, trend: '+3%', color: 'bg-purple-500' },
  { label: 'Open Disputes', value: '12', icon: Scale, trend: '-15%', color: 'bg-red-500' },
  { label: 'Campaign Flags', value: '7', icon: AlertTriangle, trend: '-22%', color: 'bg-orange-500' },
  { label: 'Open Appeals', value: '5', icon: ClipboardList, trend: '0%', color: 'bg-pink-500' },
  { label: 'GDPR Requests', value: '3', icon: ClipboardList, trend: '+1', color: 'bg-cyan-500' },
]

const recentActivity = [
  { action: 'New user registered', user: 'john@example.com', time: '2 minutes ago' },
  { action: 'KYC submitted for review', user: 'creator_anna', time: '15 minutes ago' },
  { action: 'Campaign flagged', user: 'brand_xyz', time: '1 hour ago' },
  { action: 'Dispute resolved', user: 'admin_mike', time: '2 hours ago' },
  { action: 'Brand verification approved', user: 'FashionCo', time: '3 hours ago' },
]

export default function AdminOverviewPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin Dashboard</p>
        <h1 className="text-3xl font-semibold text-slate-900">Platform Overview</h1>
      </div>

      {isLoading ? (
        <StatCardsSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {mockStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className={`text-sm font-medium ${stat.trend.startsWith('+') ? 'text-green-600' : stat.trend.startsWith('-') ? 'text-red-600' : 'text-gray-500'}`}>
                  {stat.trend}
                </span>
              </div>
              <p className="mt-4 text-2xl font-semibold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-500">{activity.user}</p>
                </div>
                <span className="text-xs text-slate-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Review KYC', href: '/admin/kyc', icon: FileCheck },
              { label: 'Verify Brands', href: '/admin/brands', icon: Building2 },
              { label: 'Handle Disputes', href: '/admin/disputes', icon: Scale },
              { label: 'View Audit Log', href: '/admin/audit', icon: ClipboardList },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <action.icon className="w-5 h-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

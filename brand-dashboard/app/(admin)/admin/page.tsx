'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { adminSystemService } from '@/lib/api/admin/system'

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-summary'],
    queryFn: adminSystemService.getSummary,
  })

  const workQueue = [
    { label: 'KYC Reviews', value: data?.pendingKyc ?? 0, href: '/admin/kyc' },
    { label: 'Brand Verifications', value: data?.pendingBrandVerifications ?? 0, href: '/admin/brands' },
    { label: 'Campaign Flags', value: data?.openCampaignFlags ?? 0, href: '/admin/campaigns' },
    { label: 'Disputes', value: data?.openDisputes ?? 0, href: '/admin/disputes' },
    { label: 'Appeals', value: data?.openAppeals ?? 0, href: '/admin/appeals' },
    { label: 'GDPR Requests', value: data?.pendingGdprRequests ?? 0, href: '/admin/compliance' },
  ]

  const platformStats = [
    { label: 'Total Users', value: data?.totalUsers ?? 0 },
    { label: 'Total Campaigns', value: data?.totalCampaigns ?? 0 },
    { label: 'Pending KYC', value: data?.pendingKyc ?? 0 },
    { label: 'Pending Brand Verifications', value: data?.pendingBrandVerifications ?? 0 },
    { label: 'Open Disputes', value: data?.openDisputes ?? 0 },
    { label: 'Campaign Flags', value: data?.openCampaignFlags ?? 0 },
    { label: 'Open Appeals', value: data?.openAppeals ?? 0 },
    { label: 'GDPR Requests', value: data?.pendingGdprRequests ?? 0 },
  ]

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin Dashboard</p>
        <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-semibold text-slate-900">Platform Overview</h1>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700" href="/admin/users">
              Manage Users
            </Link>
            <Link className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700" href="/admin/settings">
              Platform Settings
            </Link>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Keep the queue moving and monitor system health from one place.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Work Queue</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">priority</span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workQueue.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
            >
              <p className="text-sm text-slate-500">{item.label}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-2xl font-semibold text-slate-900">
                  {isLoading ? '—' : item.value}
                </p>
                <span className="text-xs font-semibold text-slate-400">View</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900">Platform Stats</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {platformStats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {isLoading ? '—' : item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

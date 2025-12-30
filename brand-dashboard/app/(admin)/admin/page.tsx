'use client'

import { useQuery } from '@tanstack/react-query'
import { adminSystemService } from '@/lib/api/admin/system'

export default function AdminOverviewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-summary'],
    queryFn: adminSystemService.getSummary,
  })

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin Dashboard</p>
        <h1 className="text-3xl font-semibold text-slate-900">Platform Overview</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Users', value: data?.totalUsers ?? 0 },
          { label: 'Total Campaigns', value: data?.totalCampaigns ?? 0 },
          { label: 'Pending KYC', value: data?.pendingKyc ?? 0 },
          { label: 'Pending Brand Verifications', value: data?.pendingBrandVerifications ?? 0 },
          { label: 'Open Disputes', value: data?.openDisputes ?? 0 },
          { label: 'Campaign Flags', value: data?.openCampaignFlags ?? 0 },
          { label: 'Open Appeals', value: data?.openAppeals ?? 0 },
          { label: 'GDPR Requests', value: data?.pendingGdprRequests ?? 0 },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {isLoading ? '—' : item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

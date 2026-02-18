'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminCampaignReviewService } from '@/lib/api/admin/campaign-review'
import { Pagination } from '@/components/shared/pagination'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'

export default function AdminCampaignReviewsPage() {
  const [page, setPage] = useState(0)
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-campaign-reviews', page, sortDir],
    queryFn: () => adminCampaignReviewService.listPending({ page, size: 20, sortDir }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <DashboardPageShell
        title="Campaign Reviews"
        subtitle="Approve or reject campaigns awaiting pre-approval."
        eyebrow="Campaign Ops"
      >

      <div className="table-shell p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">Pending campaigns</div>
          <select
            className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
            value={sortDir}
            onChange={(event) => setSortDir(event.target.value as 'ASC' | 'DESC')}
          >
            <option value="DESC">Newest first</option>
            <option value="ASC">Oldest first</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Campaign</th>
                <th className="py-2 pr-4">Brand</th>
                <th className="py-2 pr-4">Budget</th>
                <th className="py-2 pr-4">Submitted</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((campaign: any) => (
                  <tr key={campaign.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{campaign.title}</p>
                      <p className="text-xs text-slate-500">{campaign.category}</p>
                    </td>
                    <td className="py-3 pr-4">{campaign.brand?.name || campaign.brand?.email || '—'}</td>
                    <td className="py-3 pr-4">{campaign.budget ? `₹${campaign.budget}` : '—'}</td>
                    <td className="py-3 pr-4">
                      {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <Link
                        className="text-sm font-semibold text-slate-900 hover:text-slate-700"
                        href={`/admin/campaign-reviews/${campaign.id}`}
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No campaigns awaiting review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
      </DashboardPageShell>
    </div>
  )
}

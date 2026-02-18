'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { StatusChip } from '@/components/shared/status-chip'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'
import { TableSkeleton } from '@/components/shared/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { useAdminCampaignApplications } from '@/lib/hooks/use-admin-applications'

const statusToneMap: Record<string, 'approved' | 'needs_action' | 'blocked' | 'pending' | 'info'> = {
  APPLIED: 'pending',
  SHORTLISTED: 'needs_action',
  SELECTED: 'approved',
  REJECTED: 'blocked',
  WITHDRAWN: 'info',
}

const statusOptions = ['ALL', 'APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'WITHDRAWN'] as const

export default function AdminCampaignApplicationsPage() {
  const params = useParams()
  const campaignId = params?.id as string
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<(typeof statusOptions)[number]>('ALL')

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useAdminCampaignApplications(campaignId, {
    page,
    size: 20,
    status: status === 'ALL' ? undefined : status,
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1
  const title = useMemo(() => `Campaign Applications`, [])

  return (
    <div className="space-y-6">
      <DashboardPageShell
        title={title}
        subtitle="Review applications submitted for this campaign."
        eyebrow="Campaign Ops"
      >

      <div className="table-shell p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={status}
            onChange={(event) => setStatus(event.target.value as (typeof statusOptions)[number])}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'ALL' ? 'All statuses' : option}
              </option>
            ))}
          </select>
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <EmptyState
            title="Unable to load applications"
            description="Refresh to retry loading applications."
            action={<Button onClick={() => refetch()}>Retry</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Application ID</th>
                  <th className="py-2 pr-4">Creator</th>
                  <th className="py-2 pr-4">Campaign</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Applied</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {items.length ? (
                  items.map((application: any) => (
                    <tr key={application.id} className="border-t border-slate-100">
                      <td className="py-3 pr-4 text-xs text-slate-500">{application.id}</td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-900">
                          {application.creator?.profile?.fullName || application.creator?.email || 'Creator'}
                        </p>
                        <p className="text-xs text-slate-500">{application.creator?.email || application.creatorId}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-sm text-slate-900">{application.campaign?.title || 'Campaign'}</p>
                        <p className="text-xs text-slate-500">{application.campaignId}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <StatusChip
                          tone={statusToneMap[application.status] || 'info'}
                          size="compact"
                        >
                          {application.status}
                        </StatusChip>
                      </td>
                      <td className="py-3 pr-4">
                        {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No applications yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      </DashboardPageShell>
    </div>
  )
}

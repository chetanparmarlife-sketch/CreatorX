'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminCampaignManagementService } from '@/lib/api/admin/campaign-management'
import { adminUserService } from '@/lib/api/admin/users'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { StatusChip } from '@/components/shared/status-chip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'
import { TableSkeleton } from '@/components/shared/skeleton'
import { UserRole } from '@/lib/types'

const statusToneMap: Record<string, 'approved' | 'needs_action' | 'blocked' | 'pending' | 'info'> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REVISION_REQUESTED: 'needs_action',
  REJECTED: 'blocked',
}

const statusOptions = ['ALL', 'PENDING', 'APPROVED', 'REVISION_REQUESTED', 'REJECTED'] as const
const reviewOptions = [
  { label: 'Approve', value: 'APPROVED' },
  { label: 'Request revision', value: 'REVISION_REQUESTED' },
  { label: 'Reject', value: 'REJECTED' },
]

export default function AdminDeliverablesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [brandId, setBrandId] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [status, setStatus] = useState<(typeof statusOptions)[number]>('ALL')
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewSubmissionId, setReviewSubmissionId] = useState<string | null>(null)
  const [reviewStatus, setReviewStatus] = useState('APPROVED')
  const [reviewFeedback, setReviewFeedback] = useState('')

  const { data: brands } = useQuery({
    queryKey: ['admin-brand-users-deliverables'],
    queryFn: () => adminUserService.listUsers({ role: UserRole.BRAND, page: 0, size: 200 }),
  })

  const brandOptions = useMemo(
    () => (brands as any)?.items ?? (brands as any)?.content ?? [],
    [brands]
  )

  const { data, isLoading } = useQuery({
    queryKey: ['admin-deliverables', page, brandId, campaignId, status],
    queryFn: () =>
      adminCampaignManagementService.listDeliverablesAdmin({
        page,
        size: 20,
        brandId: brandId || undefined,
        campaignId: campaignId || undefined,
        status: status === 'ALL' ? undefined : status,
      }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1

  const reviewMutation = useMutation({
    mutationFn: () =>
      adminCampaignManagementService.reviewDeliverable(
        reviewSubmissionId as string,
        reviewStatus,
        reviewFeedback || undefined
      ),
    onSuccess: () => {
      setReviewDialogOpen(false)
      setReviewSubmissionId(null)
      setReviewFeedback('')
      queryClient.invalidateQueries({ queryKey: ['admin-deliverables'] })
    },
  })

  return (
    <div className="space-y-6">
      <DashboardPageShell
        title="Deliverables"
        subtitle="Review deliverables across campaigns with the same workflow used by brands."
        eyebrow="Campaign Ops"
      >

      <div className="table-shell p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm min-w-[220px]"
            value={brandId}
            onChange={(event) => setBrandId(event.target.value)}
          >
            <option value="">All brands</option>
            {brandOptions.map((brand: any) => (
              <option key={brand.id} value={brand.id}>
                {brand.companyName || brand.fullName || brand.email}
              </option>
            ))}
          </select>
          <Input
            placeholder="Filter by campaign ID"
            value={campaignId}
            onChange={(event) => setCampaignId(event.target.value)}
            className="max-w-[220px]"
          />
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
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Deliverable</th>
                  <th className="py-2 pr-4">Campaign</th>
                  <th className="py-2 pr-4">Creator</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Submitted</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {items.length ? (
                  items.map((deliverable: any) => (
                    <tr key={deliverable.id} className="border-t border-slate-100">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-900">
                          {deliverable.campaignDeliverable?.title || 'Deliverable'}
                        </p>
                        <p className="text-xs text-slate-500">{deliverable.fileType || 'Submission'}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-sm text-slate-900">{deliverable.campaignTitle || '—'}</p>
                        <p className="text-xs text-slate-500">{deliverable.campaignId}</p>
                      </td>
                      <td className="py-3 pr-4">{deliverable.creatorName || deliverable.creatorId || '—'}</td>
                      <td className="py-3 pr-4">
                        <StatusChip
                          tone={statusToneMap[deliverable.status || 'PENDING'] || 'pending'}
                          size="compact"
                        >
                          {deliverable.status || 'PENDING'}
                        </StatusChip>
                      </td>
                      <td className="py-3 pr-4">
                        {deliverable.submittedAt ? new Date(deliverable.submittedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReviewSubmissionId(deliverable.id)
                            setReviewDialogOpen(true)
                          }}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No deliverables found for this filter set.
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

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review deliverable</DialogTitle>
            <DialogDescription>Apply the same review decisions as the brand workflow.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Decision</label>
            <select
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              value={reviewStatus}
              onChange={(event) => setReviewStatus(event.target.value)}
            >
              {reviewOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Feedback</label>
            <Textarea value={reviewFeedback} onChange={(event) => setReviewFeedback(event.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => reviewMutation.mutate()} disabled={reviewMutation.isPending}>
              Submit review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

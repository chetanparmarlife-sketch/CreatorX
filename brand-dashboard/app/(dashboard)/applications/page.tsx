'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { applicationService } from '@/lib/api/applications'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StatusChip } from '@/components/shared/status-chip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/shared/page-header'
import { TableSkeleton } from '@/components/shared/skeleton'

const statusToneMap: Record<string, 'approved' | 'needs_action' | 'blocked' | 'pending' | 'info'> = {
  APPLIED: 'pending',
  SHORTLISTED: 'needs_action',
  SELECTED: 'approved',
  REJECTED: 'blocked',
  WITHDRAWN: 'info',
}

const statusOptions = ['ALL', 'APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'WITHDRAWN'] as const

export default function BrandApplicationsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<(typeof statusOptions)[number]>('ALL')
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectApplicationId, setRejectApplicationId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['brand-applications', page],
    queryFn: () => applicationService.getBrandApplications(page, 20),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1

  const filteredItems = useMemo(() => {
    if (status === 'ALL') return items
    return items.filter((item: any) => item.status === status)
  }, [items, status])

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: string }) =>
      applicationService.updateApplicationStatus(id, nextStatus),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['brand-applications'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: () =>
      applicationService.rejectApplication(rejectApplicationId as string, rejectReason || 'Not selected'),
    onSuccess: () => {
      setRejectDialogOpen(false)
      setRejectReason('')
      setRejectApplicationId(null)
      queryClient.invalidateQueries({ queryKey: ['brand-applications'] })
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Applications" />
      <p className="text-sm text-slate-500">
        Review applications across all of your campaigns in one queue.
      </p>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
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
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Creator</th>
                  <th className="py-2 pr-4">Campaign</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Applied</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {filteredItems.length ? (
                  filteredItems.map((application: any) => (
                    <tr key={application.id} className="border-t border-slate-100">
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
                        <StatusChip tone={statusToneMap[application.status] || 'info'} size="compact">
                          {application.status}
                        </StatusChip>
                      </td>
                      <td className="py-3 pr-4">
                        {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 pr-4 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => statusMutation.mutate({ id: application.id, nextStatus: 'SHORTLISTED' })}
                        >
                          Shortlist
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => statusMutation.mutate({ id: application.id, nextStatus: 'SELECTED' })}
                        >
                          Select
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRejectApplicationId(application.id)
                            setRejectDialogOpen(true)
                          }}
                        >
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No applications found for this status.
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

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
            <DialogDescription>Provide a reason to share with the creator.</DialogDescription>
          </DialogHeader>
          <Textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending}>
              Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

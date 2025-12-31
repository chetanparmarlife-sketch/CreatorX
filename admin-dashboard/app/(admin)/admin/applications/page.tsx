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
import { PageHeader } from '@/components/shared/page-header'
import { TableSkeleton } from '@/components/shared/skeleton'
import { UserRole } from '@/lib/types'

const statusToneMap: Record<string, 'approved' | 'needs_action' | 'blocked' | 'pending' | 'info'> = {
  APPLIED: 'pending',
  SHORTLISTED: 'needs_action',
  SELECTED: 'approved',
  REJECTED: 'blocked',
  WITHDRAWN: 'info',
}

const statusOptions = ['ALL', 'APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'WITHDRAWN'] as const

export default function AdminApplicationsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [brandId, setBrandId] = useState('')
  const [campaignId, setCampaignId] = useState('')
  const [status, setStatus] = useState<(typeof statusOptions)[number]>('ALL')
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectApplicationId, setRejectApplicationId] = useState<string | null>(null)
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false)
  const [overrideApplicationId, setOverrideApplicationId] = useState<string | null>(null)
  const [overrideStatus, setOverrideStatus] = useState('SHORTLISTED')
  const [overrideReason, setOverrideReason] = useState('')

  const { data: brands } = useQuery({
    queryKey: ['admin-brand-users-applications'],
    queryFn: () => adminUserService.listUsers({ role: UserRole.BRAND, page: 0, size: 200 }),
  })

  const brandOptions = useMemo(
    () => (brands as any)?.items ?? (brands as any)?.content ?? [],
    [brands]
  )

  const { data, isLoading } = useQuery({
    queryKey: ['admin-applications', page, brandId, campaignId, status],
    queryFn: () =>
      adminCampaignManagementService.listApplicationsAdmin({
        page,
        size: 20,
        brandId: brandId || undefined,
        campaignId: campaignId || undefined,
        status: status === 'ALL' ? undefined : status,
      }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1

  const shortlistMutation = useMutation({
    mutationFn: (applicationId: string) => adminCampaignManagementService.shortlistApplication(applicationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-applications'] }),
  })

  const selectMutation = useMutation({
    mutationFn: (applicationId: string) => adminCampaignManagementService.selectApplication(applicationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-applications'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: () =>
      adminCampaignManagementService.rejectApplication(rejectApplicationId as string, rejectReason || undefined),
    onSuccess: () => {
      setRejectDialogOpen(false)
      setRejectReason('')
      setRejectApplicationId(null)
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
    },
  })

  const overrideMutation = useMutation({
    mutationFn: () =>
      adminCampaignManagementService.updateApplicationStatus(
        overrideApplicationId as string,
        overrideStatus,
        overrideReason || undefined
      ),
    onSuccess: () => {
      setOverrideDialogOpen(false)
      setOverrideReason('')
      setOverrideApplicationId(null)
      queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Applications" />
      <p className="text-sm text-slate-500">
        Review applications across campaigns with the same rules used by brand teams.
      </p>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
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
                  <th className="py-2 pr-4">Creator</th>
                  <th className="py-2 pr-4">Campaign</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Applied</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {items.length ? (
                  items.map((application: any) => (
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
                      <td className="py-3 pr-4 text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => shortlistMutation.mutate(application.id)}>
                          Shortlist
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => selectMutation.mutate(application.id)}>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setOverrideApplicationId(application.id)
                            setOverrideStatus(application.status || 'SHORTLISTED')
                            setOverrideDialogOpen(true)
                          }}
                        >
                          Override status
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No applications found for this filter set.
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

      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override application status</DialogTitle>
            <DialogDescription>Apply the same status transitions as the brand workflow.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              value={overrideStatus}
              onChange={(event) => setOverrideStatus(event.target.value)}
            >
              <option value="APPLIED">APPLIED</option>
              <option value="SHORTLISTED">SHORTLISTED</option>
              <option value="SELECTED">SELECTED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="WITHDRAWN">WITHDRAWN</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Reason (optional)</label>
            <Textarea value={overrideReason} onChange={(event) => setOverrideReason(event.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => overrideMutation.mutate()} disabled={overrideMutation.isPending}>
              Apply override
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

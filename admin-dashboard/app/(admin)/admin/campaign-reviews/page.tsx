'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminCampaignReviewService } from '@/lib/api/admin/campaign-review'
import { Pagination } from '@/components/shared/pagination'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'
import { ToastStack } from '@/components/shared/toast'
import { useToast } from '@/lib/hooks/useToast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function AdminCampaignReviewsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC')
  const [rejectCampaign, setRejectCampaign] = useState<any | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [escalateCampaign, setEscalateCampaign] = useState<any | null>(null)
  const [escalateReason, setEscalateReason] = useState('')
  const { toasts, pushToast, dismissToast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-campaign-reviews', page, sortDir],
    queryFn: () => adminCampaignReviewService.listPending({ page, size: 20, sortDir }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1
  const refreshQueues = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-campaign-reviews'] })
    queryClient.invalidateQueries({ queryKey: ['admin-workspace-summary'] })
    queryClient.invalidateQueries({ queryKey: ['admin-action-queue'] })
    queryClient.invalidateQueries({ queryKey: ['admin-campaign-flags'] })
  }

  const approveMutation = useMutation({
    mutationFn: (campaignId: string) => adminCampaignReviewService.approve(campaignId),
    onSuccess: () => {
      refreshQueues()
      pushToast('Campaign approved', 'success')
    },
    onError: () => pushToast('Campaign approval failed', 'error'),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ campaignId, reason }: { campaignId: string; reason: string }) =>
      adminCampaignReviewService.reject(campaignId, reason),
    onSuccess: () => {
      refreshQueues()
      pushToast('Campaign rejected', 'success')
    },
    onError: () => pushToast('Campaign rejection failed', 'error'),
  })

  const escalateMutation = useMutation({
    mutationFn: ({ campaignId, reason }: { campaignId: string; reason: string }) =>
      adminCampaignReviewService.escalate(campaignId, reason),
    onSuccess: () => {
      refreshQueues()
      pushToast('Campaign escalated', 'success')
    },
    onError: () => pushToast('Campaign escalation failed', 'error'),
  })

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <DashboardPageShell
        title="Campaign Reviews"
        subtitle="Approve, reject, or escalate campaigns awaiting pre-approval."
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
                      {campaign.reviewReason?.startsWith('Escalated:') ? (
                        <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          Escalated
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4">{campaign.brand?.name || campaign.brand?.email || '—'}</td>
                    <td className="py-3 pr-4">{campaign.budget ? `₹${campaign.budget}` : '—'}</td>
                    <td className="py-3 pr-4">
                      {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white disabled:opacity-50"
                          onClick={() => approveMutation.mutate(campaign.id)}
                          disabled={approveMutation.isPending}
                        >
                          Approve
                        </button>
                        <button
                          className="h-8 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-600 disabled:opacity-50"
                          onClick={() => {
                            setRejectCampaign(campaign)
                            setRejectReason('')
                          }}
                          disabled={rejectMutation.isPending}
                        >
                          Reject
                        </button>
                        <button
                          className="h-8 rounded-lg border border-amber-200 px-3 text-xs font-semibold text-amber-700 disabled:opacity-50"
                          onClick={() => {
                            setEscalateCampaign(campaign)
                            setEscalateReason(campaign.reviewReason?.replace(/^Escalated:\s*/, '') || '')
                          }}
                          disabled={escalateMutation.isPending}
                        >
                          Escalate
                        </button>
                        <Link
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                          href={`/admin/campaign-reviews/${campaign.id}`}
                        >
                          Details
                        </Link>
                      </div>
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

      <Dialog
        open={!!rejectCampaign}
        onOpenChange={(open) => {
          if (!open) {
            setRejectCampaign(null)
            setRejectReason('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject campaign</DialogTitle>
            <DialogDescription>Return this campaign to draft with a visible review reason.</DialogDescription>
          </DialogHeader>
          {rejectCampaign ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900">
              {rejectCampaign.title}
            </p>
          ) : null}
          <textarea
            className="h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Reason"
          />
          <DialogFooter>
            <button
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => setRejectCampaign(null)}
            >
              Cancel
            </button>
            <button
              className="h-10 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() => {
                if (rejectCampaign && rejectReason.trim()) {
                  rejectMutation.mutate({ campaignId: rejectCampaign.id, reason: rejectReason.trim() })
                  setRejectCampaign(null)
                }
              }}
            >
              Reject
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!escalateCampaign}
        onOpenChange={(open) => {
          if (!open) {
            setEscalateCampaign(null)
            setEscalateReason('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate campaign</DialogTitle>
            <DialogDescription>Create a moderation flag and keep the campaign pending for senior review.</DialogDescription>
          </DialogHeader>
          {escalateCampaign ? (
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-900">
              {escalateCampaign.title}
            </p>
          ) : null}
          <textarea
            className="h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={escalateReason}
            onChange={(event) => setEscalateReason(event.target.value)}
            placeholder="Escalation reason"
          />
          <DialogFooter>
            <button
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => setEscalateCampaign(null)}
            >
              Cancel
            </button>
            <button
              className="h-10 rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white disabled:opacity-50"
              disabled={escalateMutation.isPending}
              onClick={() => {
                if (escalateCampaign) {
                  escalateMutation.mutate({
                    campaignId: escalateCampaign.id,
                    reason: escalateReason.trim() || 'Escalated for senior moderation review',
                  })
                  setEscalateCampaign(null)
                }
              }}
            >
              Escalate
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

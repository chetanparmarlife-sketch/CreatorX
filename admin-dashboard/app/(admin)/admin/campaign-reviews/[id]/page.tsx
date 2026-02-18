'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { adminCampaignReviewService } from '@/lib/api/admin/campaign-review'
import { campaignService } from '@/lib/api/campaigns'
import { ToastStack } from '@/components/shared/toast'
import { useToast } from '@/lib/hooks/useToast'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function AdminCampaignReviewDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const campaignId = params?.id
  const queryClient = useQueryClient()
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const { toasts, pushToast, dismissToast } = useToast()

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['admin-campaign-review', campaignId],
    queryFn: () => campaignService.getCampaignById(campaignId),
    enabled: !!campaignId,
  })

  const approveMutation = useMutation({
    mutationFn: () => adminCampaignReviewService.approve(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaign-reviews'] })
      pushToast('Campaign approved', 'success')
      router.push('/admin/campaign-reviews')
    },
    onError: () => pushToast('Campaign approval failed', 'error'),
  })

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => adminCampaignReviewService.reject(campaignId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaign-reviews'] })
      pushToast('Campaign rejected', 'success')
      router.push('/admin/campaign-reviews')
    },
    onError: () => pushToast('Campaign rejection failed', 'error'),
  })

  if (isLoading || !campaign) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading campaign...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <DashboardPageShell
        title={campaign.title}
        subtitle={campaign.category}
        eyebrow="Campaign Review"
        actionBar={
          <Link className="text-sm font-semibold text-slate-600 hover:text-slate-900" href="/admin/campaign-reviews">
            Back to list
          </Link>
        }
      >

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="section-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Campaign Details</h2>
            <p className="text-sm text-slate-600">{campaign.description}</p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-slate-400">Budget</p>
                <p className="text-sm font-medium text-slate-900">{campaign.budget ? `₹${campaign.budget}` : '—'}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Platform</p>
                <p className="text-sm font-medium text-slate-900">{campaign.platform}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Start Date</p>
                <p className="text-sm font-medium text-slate-900">
                  {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">End Date</p>
                <p className="text-sm font-medium text-slate-900">
                  {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : '—'}
                </p>
              </div>
            </div>
          </section>

          <section className="section-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Deliverables</h2>
            {campaign.deliverables?.length ? (
              <div className="space-y-3">
                {campaign.deliverables.map((deliverable: any) => (
                  <div key={deliverable.id} className="rounded-lg border border-slate-100 p-3">
                    <p className="text-sm font-medium text-slate-900">{deliverable.title}</p>
                    <p className="text-xs text-slate-500">{deliverable.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No deliverables specified.</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="section-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Brand</h2>
            <p className="text-sm text-slate-700">{campaign.brand?.companyName || '—'}</p>
            <p className="text-xs text-slate-500">{campaign.brand?.website || ''}</p>
          </section>

          <section className="section-card p-6 space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Review Actions</h2>
            <button
              className="w-full h-11 rounded-lg bg-emerald-600 text-sm font-semibold text-white"
              onClick={() => approveMutation.mutate()}
            >
              Approve Campaign
            </button>
            <button
              className="w-full h-11 rounded-lg border border-rose-200 text-sm font-semibold text-rose-600"
              onClick={() => {
                setRejectOpen(true)
                setRejectReason('')
              }}
            >
              Reject Campaign
            </button>
            <p className="text-xs text-slate-500">
              Rejected campaigns are returned to draft and automatically flagged for moderation review.
            </p>
            <Link className="text-xs font-semibold text-slate-600 hover:text-slate-900" href="/admin/campaigns">
              View campaign flags
            </Link>
          </section>
        </aside>
      </div>
      </DashboardPageShell>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject campaign</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this campaign.</DialogDescription>
          </DialogHeader>
          <textarea
            className="h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="Reason"
          />
          <DialogFooter>
            <button
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => setRejectOpen(false)}
            >
              Cancel
            </button>
            <button
              className="h-10 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white"
              onClick={() => {
                if (rejectReason.trim()) {
                  rejectMutation.mutate(rejectReason.trim())
                  setRejectOpen(false)
                }
              }}
              disabled={!rejectReason.trim()}
            >
              Reject
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deliverableService, DeliverableReviewStatus } from '@/lib/api/deliverables'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { File } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

type DeliverableItem = {
  id: string
  applicationId?: string
  campaignId?: string
  campaignTitle?: string
  creatorName?: string
  creatorId?: string
  status?: string
  submittedAt?: string
  fileUrl?: string
  fileType?: string
  campaignDeliverable?: {
    title?: string
  }
}

const statusOptions: Array<{ label: string; value: DeliverableReviewStatus | 'ALL' }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Revision Requested', value: 'REVISION_REQUESTED' },
  { label: 'Rejected', value: 'REJECTED' },
]

const statusStyles: Record<string, string> = {
  PENDING: 'bg-slate-100 text-slate-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REVISION_REQUESTED: 'bg-amber-100 text-amber-700',
  REJECTED: 'bg-red-100 text-red-700',
}

const isVideoFile = (deliverable: DeliverableItem) => {
  const fileType = deliverable.fileType?.toLowerCase() || ''
  const fileUrl = deliverable.fileUrl?.toLowerCase() || ''
  return fileType.startsWith('video') || /\.(mp4|mov|webm|avi)$/i.test(fileUrl)
}

const isImageFile = (deliverable: DeliverableItem) => {
  const fileType = deliverable.fileType?.toLowerCase() || ''
  const fileUrl = deliverable.fileUrl?.toLowerCase() || ''
  return fileType.startsWith('image') || /\.(png|jpe?g|gif|webp)$/i.test(fileUrl)
}

export default function DeliverablesOverviewPage() {
  const [statusFilter, setStatusFilter] = useState<DeliverableReviewStatus | 'ALL'>('ALL')
  const [reviewDeliverable, setReviewDeliverable] = useState<DeliverableItem | null>(null)
  const [reviewStatus, setReviewStatus] = useState<DeliverableReviewStatus>('APPROVED')
  const [feedback, setFeedback] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['brand-deliverables', statusFilter],
    queryFn: () =>
      deliverableService.getBrandDeliverables(
        statusFilter === 'ALL' ? undefined : statusFilter
      ),
  })
  const { data: pendingData } = useQuery({
    queryKey: ['brand-deliverables-pending-count'],
    queryFn: () => deliverableService.getBrandDeliverables('PENDING'),
  })

  const deliverables = useMemo(() => (data as DeliverableItem[]) ?? [], [data])
  const pendingCount = useMemo(
    () => ((pendingData as DeliverableItem[]) ?? []).length,
    [pendingData]
  )

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      status,
      feedbackText,
    }: {
      id: string
      status: DeliverableReviewStatus
      feedbackText: string
    }) => deliverableService.reviewDeliverable(id, status, feedbackText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-deliverables'] })
      setReviewDeliverable(null)
      setFeedback('')
    },
  })

  const openReview = (deliverable: DeliverableItem, status: DeliverableReviewStatus) => {
    setReviewDeliverable(deliverable)
    setReviewStatus(status)
    setFeedback('')
  }

  return (
    <div>
      <PageHeader title={`Deliverables${pendingCount > 0 ? ` (${pendingCount} pending)` : ''}`} />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as DeliverableReviewStatus | 'ALL')}
          className="h-11 rounded-lg border border-input bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">
          Loading deliverables...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load deliverables. Please try again.
        </div>
      ) : deliverables.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center text-sm text-slate-500">
          No deliverables found.
        </div>
      ) : (
        <div className="rounded-lg border bg-white divide-y">
          {deliverables.map((deliverable) => (
            <div key={deliverable.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="relative h-16 w-24 rounded-md border bg-slate-50 flex items-center justify-center text-xs text-slate-400 group">
                {deliverable.fileUrl && (isImageFile(deliverable) || isVideoFile(deliverable)) ? (
                  isVideoFile(deliverable) ? (
                    <video className="h-full w-full object-cover" muted>
                      <source src={deliverable.fileUrl} />
                    </video>
                  ) : (
                    <img
                      src={deliverable.fileUrl}
                      alt={deliverable.campaignDeliverable?.title || 'Deliverable'}
                      className="h-full w-full object-cover"
                    />
                  )
                ) : deliverable.fileUrl ? (
                  <File className="h-6 w-6 text-slate-400" />
                ) : (
                  <span>No preview</span>
                )}
                {deliverable.fileUrl && (isImageFile(deliverable) || isVideoFile(deliverable)) && (
                  <div className="pointer-events-none absolute left-full top-1/2 z-20 ml-3 hidden -translate-y-1/2 rounded-lg border bg-white p-2 shadow-xl group-hover:block">
                    {isVideoFile(deliverable) ? (
                      <video className="h-40 w-64 object-cover" muted>
                        <source src={deliverable.fileUrl} />
                      </video>
                    ) : (
                      <img
                        src={deliverable.fileUrl}
                        alt={deliverable.campaignDeliverable?.title || 'Deliverable'}
                        className="h-40 w-64 object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-[220px]">
                <p className="text-sm font-medium text-slate-900">
                  {deliverable.campaignDeliverable?.title || 'Deliverable'}
                </p>
                <p className="text-xs text-slate-500">
                  {deliverable.campaignTitle || 'Campaign'} ·{' '}
                  {deliverable.creatorName || 'Creator'}
                </p>
              </div>
              <div className="text-xs text-slate-500">
                {deliverable.submittedAt
                  ? new Date(deliverable.submittedAt).toLocaleDateString()
                  : '—'}
              </div>
              <Badge className={statusStyles[deliverable.status || 'PENDING']}>
                {deliverable.status || 'PENDING'}
              </Badge>
              <div className="flex flex-wrap items-center gap-2">
                {deliverable.applicationId ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/messages?applicationId=${deliverable.applicationId}`}>Message</Link>
                  </Button>
                ) : null}
                <Button size="sm" onClick={() => openReview(deliverable, 'APPROVED')}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openReview(deliverable, 'REVISION_REQUESTED')}
                >
                  Request Changes
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openReview(deliverable, 'REJECTED')}
                >
                  Reject
                </Button>
                {deliverable.campaignId ? (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/campaigns/${deliverable.campaignId}/deliverables`}>View</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!reviewDeliverable} onOpenChange={(open) => !open && setReviewDeliverable(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Deliverable</DialogTitle>
            <DialogDescription>
              {reviewDeliverable?.campaignDeliverable?.title || 'Deliverable'} ·{' '}
              {reviewDeliverable?.creatorName || 'Creator'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {(reviewStatus === 'REVISION_REQUESTED' || reviewStatus === 'REJECTED') && (
              <Textarea
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Add feedback for the creator..."
              />
            )}
            {reviewStatus === 'APPROVED' && (
              <p className="text-sm text-slate-600">
                Approving will notify the creator that the deliverable is accepted.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDeliverable(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!reviewDeliverable) return
                reviewMutation.mutate({
                  id: reviewDeliverable.id,
                  status: reviewStatus,
                  feedbackText: feedback.trim(),
                })
              }}
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

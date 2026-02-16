'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deliverableService, DeliverableReviewStatus } from '@/lib/api/deliverables'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'
import { StatusChip } from '@/components/shared/status-chip'
import { QueueToolbar } from '@/components/shared/queue-toolbar'
import { EmptyState } from '@/components/shared/empty-state'
import { ContextPanel } from '@/components/shared/context-panel'
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
    dueDate?: string
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

const getDueState = (deliverable: DeliverableItem) => {
  if (!deliverable.campaignDeliverable?.dueDate) {
    return { label: 'No due date', tone: 'bg-slate-100 text-slate-500' }
  }
  const due = new Date(deliverable.campaignDeliverable.dueDate)
  const diffDays = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return { label: `Overdue ${Math.abs(diffDays)}d`, tone: 'bg-red-100 text-red-700' }
  if (diffDays <= 2) return { label: `Due in ${diffDays}d`, tone: 'bg-amber-100 text-amber-700' }
  return { label: `Due in ${diffDays}d`, tone: 'bg-emerald-100 text-emerald-700' }
}

const getDueStatus = (deliverable: DeliverableItem) => {
  if (!deliverable.campaignDeliverable?.dueDate) return 'none'
  const due = new Date(deliverable.campaignDeliverable.dueDate)
  const diffDays = Math.ceil((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'overdue'
  if (diffDays <= 2) return 'due_soon'
  return 'on_track'
}

export default function DeliverablesOverviewPage() {
  const [statusFilter, setStatusFilter] = useState<DeliverableReviewStatus | 'ALL'>('ALL')
  const [reviewDeliverable, setReviewDeliverable] = useState<DeliverableItem | null>(null)
  const [reviewStatus, setReviewStatus] = useState<DeliverableReviewStatus>('APPROVED')
  const [feedback, setFeedback] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isBulkReviewing, setIsBulkReviewing] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['brand-deliverables', statusFilter],
    queryFn: () =>
      deliverableService.getBrandDeliverables({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page: 0,
        size: 100,
      }),
  })
  const { data: pendingData } = useQuery({
    queryKey: ['brand-deliverables-pending-count'],
    queryFn: () => deliverableService.getBrandDeliverables({ status: 'PENDING', page: 0, size: 1 }),
  })

  const deliverablesPage = data as { items?: DeliverableItem[]; total?: number } | undefined
  const pendingPage = pendingData as { items?: DeliverableItem[]; total?: number } | undefined
  const deliverables = useMemo(() => deliverablesPage?.items ?? [], [deliverablesPage])
  const pendingCount = useMemo(
    () => pendingPage?.total ?? pendingPage?.items?.length ?? 0,
    [pendingPage]
  )
  const dueSummary = useMemo(() => {
    return deliverables.reduce(
      (acc, deliverable) => {
        const status = getDueStatus(deliverable)
        if (status === 'overdue') acc.overdue += 1
        if (status === 'due_soon') acc.dueSoon += 1
        return acc
      },
      { overdue: 0, dueSoon: 0 }
    )
  }, [deliverables])
  const pendingDeliverables = useMemo(
    () => deliverables.filter((deliverable) => deliverable.status === 'PENDING'),
    [deliverables]
  )
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }
  const toggleSelectAllPending = () => {
    setSelectedIds((prev) =>
      prev.length === pendingDeliverables.length ? [] : pendingDeliverables.map((item) => item.id)
    )
  }

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

  const handleBulkReview = async (status: DeliverableReviewStatus) => {
    if (selectedIds.length === 0) return
    setIsBulkReviewing(true)
    try {
      await Promise.all(
        selectedIds.map((id) => reviewMutation.mutateAsync({ id, status, feedbackText: '' }))
      )
      setSelectedIds([])
    } finally {
      setIsBulkReviewing(false)
    }
  }

  return (
    <div>
      <PageHeader
        title={`Deliverables${pendingCount > 0 ? ` (${pendingCount} pending)` : ''}`}
        subtitle="Review submissions, clear backlog, and keep campaign timelines on track."
      />

      <QueueToolbar
        title="Deliverable queue"
        description="Use bulk actions to clear the review backlog."
        selectedCount={selectedIds.length}
        totalCount={deliverables.length}
        slaSummary={{
          label: 'Due soon',
          value: `${dueSummary.dueSoon} | Overdue ${dueSummary.overdue}`,
          tone: dueSummary.overdue > 0 ? 'blocked' : dueSummary.dueSoon > 0 ? 'needs_action' : 'approved',
        }}
        actions={
          <>
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
            {pendingDeliverables.length > 0 && (
              <Button variant="outline" size="sm" onClick={toggleSelectAllPending}>
                {selectedIds.length === pendingDeliverables.length ? 'Clear selection' : 'Select all pending'}
              </Button>
            )}
          </>
        }
      />

      {selectedIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-sm text-slate-600">
            {selectedIds.length} deliverables selected
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => handleBulkReview('APPROVED')}
              disabled={isBulkReviewing}
            >
              Approve selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkReview('REVISION_REQUESTED')}
              disabled={isBulkReviewing}
            >
              Request changes
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleBulkReview('REJECTED')}
              disabled={isBulkReviewing}
            >
              Reject selected
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">
          Loading deliverables...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load deliverables. Please try again.
        </div>
      ) : deliverables.length === 0 ? (
        <EmptyState
          title="No deliverables found"
          description="New submissions will appear here as creators upload."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="rounded-lg border bg-white divide-y">
            {deliverables.map((deliverable) => {
              const dueState = getDueState(deliverable)
              return (
              <div
                key={deliverable.id}
                className="flex flex-wrap items-center gap-4 p-4 cursor-pointer hover:bg-slate-50"
                onClick={() => setReviewDeliverable(deliverable)}
              >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                checked={selectedIds.includes(deliverable.id)}
                onChange={() => toggleSelection(deliverable.id)}
                onClick={(event) => event.stopPropagation()}
              />
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
                  {deliverable.campaignTitle || 'Campaign'} |{' '}
                  {deliverable.creatorName || 'Creator'}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <StatusChip
                    tone={
                      dueState.label.startsWith('Overdue')
                        ? 'blocked'
                        : dueState.label.startsWith('Due in 1') || dueState.label.startsWith('Due in 0')
                        ? 'needs_action'
                        : 'approved'
                    }
                    size="compact"
                  >
                    {dueState.label}
                  </StatusChip>
                  {deliverable.campaignId && (
                    <Link href={`/campaigns/${deliverable.campaignId}`} className="text-slate-500 underline">
                      View campaign
                    </Link>
                  )}
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  Campaign progress: N/A | Milestones: N/A
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {deliverable.submittedAt
                  ? new Date(deliverable.submittedAt).toLocaleDateString()
                  : 'N/A'}
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
            )})}
          </div>

          <aside className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Inline preview</p>
              <p className="text-xs text-slate-500">Select a deliverable to review without switching pages.</p>
            </div>
            {reviewDeliverable ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <ContextPanel
                  title="Deliverable"
                  description={reviewDeliverable.campaignDeliverable?.title || 'Deliverable'}
                >
                  {reviewDeliverable.campaignTitle || 'Campaign'}
                </ContextPanel>
                <ContextPanel
                  title="Creator"
                  description={reviewDeliverable.creatorName || 'Creator'}
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => openReview(reviewDeliverable, 'APPROVED')}>
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openReview(reviewDeliverable, 'REVISION_REQUESTED')}>
                    Request Changes
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => openReview(reviewDeliverable, 'REJECTED')}>
                    Reject
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No selection"
                description="Pick a deliverable to preview details."
              />
            )}
          </aside>
        </div>
      )}

      <Dialog open={!!reviewDeliverable} onOpenChange={(open) => !open && setReviewDeliverable(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Deliverable</DialogTitle>
            <DialogDescription>
              {reviewDeliverable?.campaignDeliverable?.title || 'Deliverable'} |{' '}
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

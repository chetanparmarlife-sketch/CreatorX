'use client'

import { useEffect, useMemo, useState } from 'react'
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
import { useBrandEventTracker } from '@/lib/analytics/use-brand-event-tracker'
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

const updateDeliverablesPage = (
  oldData: { items?: DeliverableItem[] } | undefined,
  ids: string[],
  updater: (deliverable: DeliverableItem) => DeliverableItem
) => {
  if (!oldData?.items) return oldData
  const idSet = new Set(ids)
  return {
    ...oldData,
    items: oldData.items.map((deliverable) => (idSet.has(deliverable.id) ? updater(deliverable) : deliverable)),
  }
}

export default function DeliverablesOverviewPage() {
  const [statusFilter, setStatusFilter] = useState<DeliverableReviewStatus | 'ALL'>('ALL')
  const [dueFilter, setDueFilter] = useState<'ALL' | 'OVERDUE' | 'DUE_SOON' | 'ON_TRACK' | 'NO_DUE_DATE'>('ALL')
  const [previewDeliverable, setPreviewDeliverable] = useState<DeliverableItem | null>(null)
  const [reviewDeliverable, setReviewDeliverable] = useState<DeliverableItem | null>(null)
  const [reviewStatus, setReviewStatus] = useState<DeliverableReviewStatus>('APPROVED')
  const [feedback, setFeedback] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [isBulkReviewing, setIsBulkReviewing] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['brand-deliverables', statusFilter],
    queryFn: () =>
      deliverableService.getBrandDeliverables({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page: 0,
        size: 100,
      }),
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
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
  const { track } = useBrandEventTracker({
    pendingDeliverablesCount: pendingCount,
  })
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
  const visibleDeliverables = useMemo(() => {
    if (dueFilter === 'ALL') return deliverables
    return deliverables.filter((deliverable) => {
      const dueStatus = getDueStatus(deliverable)
      if (dueFilter === 'OVERDUE') return dueStatus === 'overdue'
      if (dueFilter === 'DUE_SOON') return dueStatus === 'due_soon'
      if (dueFilter === 'ON_TRACK') return dueStatus === 'on_track'
      return dueStatus === 'none'
    })
  }, [deliverables, dueFilter])
  const groupedDeliverables = useMemo(
    () => [
      {
        id: 'overdue',
        label: 'Overdue',
        items: visibleDeliverables.filter((deliverable) => getDueStatus(deliverable) === 'overdue'),
      },
      {
        id: 'due_soon',
        label: 'Due soon',
        items: visibleDeliverables.filter((deliverable) => getDueStatus(deliverable) === 'due_soon'),
      },
      {
        id: 'on_track',
        label: 'On track',
        items: visibleDeliverables.filter((deliverable) => getDueStatus(deliverable) === 'on_track'),
      },
      {
        id: 'none',
        label: 'No due date',
        items: visibleDeliverables.filter((deliverable) => getDueStatus(deliverable) === 'none'),
      },
    ].filter((group) => group.items.length > 0),
    [visibleDeliverables]
  )
  const pendingDeliverables = useMemo(
    () => visibleDeliverables.filter((deliverable) => deliverable.status === 'PENDING'),
    [visibleDeliverables]
  )
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }
  const toggleSelectAllPending = () => {
    setSelectedIds((prev) =>
      prev.length === pendingDeliverables.length ? [] : pendingDeliverables.map((item) => item.id)
    )
  }

  useEffect(() => {
    if (!previewDeliverable && visibleDeliverables.length > 0) {
      setPreviewDeliverable(visibleDeliverables[0])
      return
    }
    if (previewDeliverable && !visibleDeliverables.some((deliverable) => deliverable.id === previewDeliverable.id)) {
      setPreviewDeliverable(visibleDeliverables[0] ?? null)
    }
  }, [previewDeliverable, visibleDeliverables])

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
    onMutate: async ({ id, status }) => {
      setPendingIds((current) => new Set(current).add(id))
      await queryClient.cancelQueries({ queryKey: ['brand-deliverables'] })
      const previous = queryClient.getQueriesData({ queryKey: ['brand-deliverables'] })

      queryClient.setQueriesData({ queryKey: ['brand-deliverables'] }, (oldData) =>
        updateDeliverablesPage(oldData as any, [id], (deliverable) => ({
          ...deliverable,
          status,
        }))
      )
      setPreviewDeliverable((current) => (current?.id === id ? { ...current, status } : current))
      setReviewDeliverable((current) => (current?.id === id ? { ...current, status } : current))

      return { previous, previousPreview: previewDeliverable, previousReview: reviewDeliverable }
    },
    onError: (_error, _variables, context) => {
      context?.previous?.forEach(([queryKey, value]) => {
        queryClient.setQueryData(queryKey, value)
      })
      setPreviewDeliverable(context?.previousPreview ?? null)
      setReviewDeliverable(context?.previousReview ?? null)
    },
    onSuccess: (updatedDeliverable: DeliverableItem, variables) => {
      queryClient.setQueriesData({ queryKey: ['brand-deliverables'] }, (oldData) =>
        updateDeliverablesPage(oldData as any, [variables.id], () => updatedDeliverable)
      )
      setPreviewDeliverable((current) => (current?.id === variables.id ? updatedDeliverable : current))
      track('deliverable_review_completed', {
        deliverable_id: variables.id,
        review_status: variables.status,
      })
      setReviewDeliverable(null)
      setFeedback('')
    },
    onSettled: (_data, _error, variables) => {
      setPendingIds((current) => {
        const next = new Set(current)
        if (variables?.id) next.delete(variables.id)
        return next
      })
      queryClient.invalidateQueries({ queryKey: ['brand-deliverables'] })
      queryClient.invalidateQueries({ queryKey: ['brand-deliverables-pending-count'] })
    },
  })

  const openReview = (deliverable: DeliverableItem, status: DeliverableReviewStatus) => {
    track('deliverable_review_started', {
      deliverable_id: deliverable.id,
      campaign_id: deliverable.campaignId || null,
      current_status: deliverable.status || 'PENDING',
      review_target_status: status,
    })
    setPreviewDeliverable(deliverable)
    setReviewDeliverable(deliverable)
    setReviewStatus(status)
    setFeedback('')
  }

  const handleBulkReview = async (status: DeliverableReviewStatus) => {
    if (selectedIds.length === 0) return
    setBulkResult(null)
    setIsBulkReviewing(true)
    setPendingIds((current) => new Set([...Array.from(current), ...selectedIds]))
    track('bulk_action_started', {
      action_type: 'DELIVERABLE_REVIEW',
      item_count: selectedIds.length,
      review_status: status,
    })

    const previous = queryClient.getQueriesData({ queryKey: ['brand-deliverables'] })
    queryClient.setQueriesData({ queryKey: ['brand-deliverables'] }, (oldData) =>
      updateDeliverablesPage(oldData as any, selectedIds, (deliverable) => ({
        ...deliverable,
        status,
      }))
    )

    try {
      const result = await deliverableService.bulkReviewDeliverables(selectedIds, status)
      const successfulIds = result.results.filter((item) => item.success).map((item) => item.entityId)

      queryClient.setQueriesData({ queryKey: ['brand-deliverables'] }, (oldData) =>
        updateDeliverablesPage(oldData as any, successfulIds, (deliverable) => {
          const resultItem = result.results.find((item) => item.entityId === deliverable.id)
          return (resultItem?.updated as DeliverableItem | undefined) || { ...deliverable, status }
        })
      )
      setSelectedIds(result.results.filter((item) => !item.success).map((item) => item.entityId))
      setBulkResult({
        tone: result.failed > 0 ? 'error' : 'success',
        message:
          result.failed > 0
            ? `Updated ${result.succeeded} deliverable(s), ${result.failed} failed.`
            : `Updated ${result.succeeded} deliverable(s).`,
      })
      track('bulk_action_completed', {
        action_type: 'DELIVERABLE_REVIEW',
        requested: result.requested,
        succeeded: result.succeeded,
        failed: result.failed,
      })
    } catch (error) {
      previous.forEach(([queryKey, value]) => {
        queryClient.setQueryData(queryKey, value)
      })
      setBulkResult({
        tone: 'error',
        message: 'Bulk review failed. No deliverables were updated.',
      })
    } finally {
      setPendingIds((current) => {
        const next = new Set(current)
        selectedIds.forEach((id) => next.delete(id))
        return next
      })
      setIsBulkReviewing(false)
      queryClient.invalidateQueries({ queryKey: ['brand-deliverables'] })
      queryClient.invalidateQueries({ queryKey: ['brand-deliverables-pending-count'] })
    }
  }

  const submitCurrentReview = () => {
    if (!reviewDeliverable) return
    reviewMutation.mutate({
      id: reviewDeliverable.id,
      status: reviewStatus,
      feedbackText: feedback.trim(),
    })
  }

  return (
    <div>
      <PageHeader
        title={`Deliverables${pendingCount > 0 ? ` (${pendingCount} pending)` : ''}`}
        subtitle="Review submissions, clear backlog, and keep campaign timelines on track."
      />

      <QueueToolbar
        title="Deliverable queue"
        description="Group by due state and use bulk actions to clear backlog quickly."
        selectedCount={selectedIds.length}
        totalCount={visibleDeliverables.length}
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
            <select
              value={dueFilter}
              onChange={(event) =>
                setDueFilter(event.target.value as 'ALL' | 'OVERDUE' | 'DUE_SOON' | 'ON_TRACK' | 'NO_DUE_DATE')
              }
              className="h-11 rounded-lg border border-input bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="ALL">All due states</option>
              <option value="OVERDUE">Overdue</option>
              <option value="DUE_SOON">Due soon</option>
              <option value="ON_TRACK">On track</option>
              <option value="NO_DUE_DATE">No due date</option>
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
              Request revisions
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
      {bulkResult ? (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            bulkResult.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {bulkResult.message}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">
          Loading deliverables...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load deliverables. Please try again.
        </div>
      ) : visibleDeliverables.length === 0 ? (
        <EmptyState
          title="No deliverables in this view"
          description="Adjust status or due filters to review additional items."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="rounded-lg border bg-white">
            {groupedDeliverables.map((group, groupIndex) => (
              <div key={group.id} className={groupIndex > 0 ? 'border-t border-slate-200' : ''}>
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs uppercase tracking-wide text-slate-500">
                  <span>{group.label}</span>
                  <span>{group.items.length}</span>
                </div>
                <div className="divide-y">
                  {group.items.map((deliverable) => {
                    const dueState = getDueState(deliverable)
                    const isPending = pendingIds.has(deliverable.id)
                    return (
                    <div
                      key={deliverable.id}
                      className="flex flex-wrap items-center gap-4 p-4 cursor-pointer hover:bg-slate-50"
                      onClick={() => setPreviewDeliverable(deliverable)}
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
                {isPending ? 'Updating...' : deliverable.status || 'PENDING'}
              </Badge>
              <div className="flex flex-wrap items-center gap-2">
                {deliverable.applicationId ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/messages?applicationId=${deliverable.applicationId}`}>Message</Link>
                  </Button>
                ) : null}
                <Button size="sm" onClick={() => openReview(deliverable, 'APPROVED')} disabled={isPending}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openReview(deliverable, 'REVISION_REQUESTED')}
                  disabled={isPending}
                >
                  Request revision
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openReview(deliverable, 'REJECTED')}
                  disabled={isPending}
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
              </div>
            ))}
          </div>

          <aside className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Inline preview</p>
              <p className="text-xs text-slate-500">Select a deliverable to review without switching pages.</p>
            </div>
            {previewDeliverable ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <ContextPanel
                  title="Deliverable"
                  description={previewDeliverable.campaignDeliverable?.title || 'Deliverable'}
                >
                  {previewDeliverable.campaignTitle || 'Campaign'}
                </ContextPanel>
                <ContextPanel
                  title="Creator"
                  description={previewDeliverable.creatorName || 'Creator'}
                />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => openReview(previewDeliverable, 'APPROVED')} disabled={pendingIds.has(previewDeliverable.id)}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openReview(previewDeliverable, 'REVISION_REQUESTED')}
                    disabled={pendingIds.has(previewDeliverable.id)}
                  >
                    Request revision
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openReview(previewDeliverable, 'REJECTED')}
                    disabled={pendingIds.has(previewDeliverable.id)}
                  >
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
                onKeyDown={(event) => {
                  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                    event.preventDefault()
                    submitCurrentReview()
                  }
                }}
              />
            )}
            {reviewStatus === 'APPROVED' && (
              <p className="text-sm text-slate-600">
                Approving will notify the creator that the deliverable is accepted.
              </p>
            )}
            <p className="text-xs text-slate-500">
              Tip: Press Ctrl + Enter to submit this review.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDeliverable(null)}>
              Cancel
            </Button>
            <Button
              onClick={submitCurrentReview}
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

'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deliverableService, DeliverableReviewStatus } from '@/lib/api/deliverables'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type DeliverableSubmission = {
  id: string | number
  title: string
  description?: string
  creatorNotes?: string
  submittedAt?: string
  status: string
  fileUrl?: string
  fileType?: string
  thumbnailUrl?: string
  creator?: {
    id?: string
    email?: string
    profile?: {
      fullName?: string
      avatarUrl?: string
    }
  }
}

const statusOptions = ['All', 'Pending', 'Approved', 'Revision Requested', 'Rejected'] as const

const statusStyles: Record<string, string> = {
  PENDING: 'bg-slate-200 text-slate-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REVISION_REQUESTED: 'bg-amber-100 text-amber-700',
  REJECTED: 'bg-red-100 text-red-700',
}

const normalizeStatus = (status: string) => status?.toUpperCase() || 'PENDING'

const isVideoFile = (deliverable: DeliverableSubmission) => {
  const fileType = deliverable.fileType?.toLowerCase() || ''
  const fileUrl = deliverable.fileUrl?.toLowerCase() || ''
  return fileType.startsWith('video') || fileUrl.endsWith('.mp4') || fileUrl.endsWith('.mov')
}

export default function DeliverablesPage() {
  const params = useParams()
  const campaignId = params?.id as string
  const queryClient = useQueryClient()

  const [statusFilter, setStatusFilter] =
    useState<(typeof statusOptions)[number]>('All')
  const [creatorFilter, setCreatorFilter] = useState('All creators')
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [actionMode, setActionMode] = useState<DeliverableReviewStatus | null>(null)
  const [feedback, setFeedback] = useState('')
  const [zoomed, setZoomed] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['campaign-deliverables', campaignId],
    queryFn: () => deliverableService.getCampaignDeliverables(campaignId),
    enabled: !!campaignId,
  })

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      status,
      feedbackText,
    }: {
      id: string | number
      status: DeliverableReviewStatus
      feedbackText: string
    }) => deliverableService.reviewDeliverable(id, status, feedbackText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-deliverables', campaignId] })
    },
  })

  const deliverables = (data as DeliverableSubmission[]) ?? []

  const creatorOptions = useMemo(() => {
    const creators = deliverables.map((item) => {
      return (
        item.creator?.profile?.fullName ||
        item.creator?.email?.split('@')[0] ||
        'Creator'
      )
    })
    return ['All creators', ...Array.from(new Set(creators))]
  }, [deliverables])

  const filteredDeliverables = useMemo(() => {
    return deliverables.filter((deliverable) => {
      const statusMatches =
        statusFilter === 'All' ||
        normalizeStatus(deliverable.status) === statusFilter.toUpperCase().replace(' ', '_')
      const creatorName =
        deliverable.creator?.profile?.fullName ||
        deliverable.creator?.email?.split('@')[0] ||
        'Creator'
      const creatorMatches =
        creatorFilter === 'All creators' || creatorFilter === creatorName
      return statusMatches && creatorMatches
    })
  }, [creatorFilter, deliverables, statusFilter])

  const currentDeliverable =
    selectedIndex === null ? null : filteredDeliverables[selectedIndex]

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['deliverable-history', currentDeliverable?.id],
    queryFn: () =>
      deliverableService.getDeliverableHistory(currentDeliverable?.id as string),
    enabled: historyOpen && !!currentDeliverable?.id,
  })

  const handleOpenReview = (index: number) => {
    setSelectedIndex(index)
    setActionMode(null)
    setFeedback('')
    setZoomed(false)
  }

  const handleCloseReview = () => {
    setSelectedIndex(null)
    setActionMode(null)
    setFeedback('')
    setZoomed(false)
  }

  const handleReviewAction = (status: DeliverableReviewStatus) => {
    if (!currentDeliverable) return
    reviewMutation.mutate({
      id: currentDeliverable.id,
      status,
      feedbackText: feedback.trim(),
    })
    handleCloseReview()
  }

  const nextDeliverable = () => {
    if (selectedIndex === null) return
    setSelectedIndex((prev) =>
      prev === null ? null : Math.min(prev + 1, filteredDeliverables.length - 1)
    )
    setActionMode(null)
    setFeedback('')
    setZoomed(false)
  }

  const previousDeliverable = () => {
    if (selectedIndex === null) return
    setSelectedIndex((prev) => (prev === null ? null : Math.max(prev - 1, 0)))
    setActionMode(null)
    setFeedback('')
    setZoomed(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Deliverables</h1>
        <p className="text-sm text-slate-500">
          Review creator submissions and provide feedback.
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="h-10 rounded-md border border-input bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Creator</span>
          <select
            value={creatorFilter}
            onChange={(event) => setCreatorFilter(event.target.value)}
            className="h-10 rounded-md border border-input bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {creatorOptions.map((creator) => (
              <option key={creator} value={creator}>
                {creator}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border bg-white p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load deliverables. Please try again.
        </div>
      ) : filteredDeliverables.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center text-slate-500">
          No deliverables found for these filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDeliverables.map((deliverable, index) => {
            const creatorName =
              deliverable.creator?.profile?.fullName ||
              deliverable.creator?.email?.split('@')[0] ||
              'Creator'
            const initials = creatorName.slice(0, 2).toUpperCase()
            const statusKey = normalizeStatus(deliverable.status)

            return (
              <Card key={deliverable.id} className="flex flex-col">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{creatorName}</CardTitle>
                    <p className="text-xs text-slate-500">{deliverable.title}</p>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <div className="relative overflow-hidden rounded-lg border bg-slate-50">
                    {isVideoFile(deliverable) ? (
                      <video
                        controls={false}
                        muted
                        className="h-44 w-full object-cover"
                        poster={deliverable.thumbnailUrl}
                      >
                        <source src={deliverable.fileUrl} />
                      </video>
                    ) : (
                      <img
                        src={deliverable.thumbnailUrl || deliverable.fileUrl}
                        alt={deliverable.title}
                        className="h-44 w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Submitted{' '}
                      {deliverable.submittedAt
                        ? new Date(deliverable.submittedAt).toLocaleDateString()
                        : '—'}
                    </span>
                    <Badge className={statusStyles[statusKey] ?? 'bg-slate-200 text-slate-700'}>
                      {statusKey.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Button onClick={() => handleOpenReview(index)}>Review</Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={selectedIndex !== null} onOpenChange={handleCloseReview}>
        <DialogContent className="max-w-4xl">
          {currentDeliverable && (
            <>
              <DialogHeader>
                <DialogTitle>Review Deliverable</DialogTitle>
                <DialogDescription>
                  {currentDeliverable.title} by{' '}
                  {currentDeliverable.creator?.profile?.fullName ||
                    currentDeliverable.creator?.email ||
                    'Creator'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-xl border bg-slate-950">
                    {isVideoFile(currentDeliverable) ? (
                      <video controls className="max-h-[420px] w-full object-contain">
                        <source src={currentDeliverable.fileUrl} />
                      </video>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setZoomed((prev) => !prev)}
                        className="w-full"
                      >
                        <img
                          src={currentDeliverable.fileUrl}
                          alt={currentDeliverable.title}
                          className={`max-h-[420px] w-full object-contain transition-transform duration-300 ${zoomed ? 'scale-110' : 'scale-100'
                            }`}
                        />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">
                    {currentDeliverable.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Creator Notes</p>
                    <p className="mt-2">
                      {currentDeliverable.creatorNotes || 'No notes from creator.'}
                    </p>
                  </div>

                  {actionMode && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">
                        {actionMode === 'REVISION_REQUESTED'
                          ? 'Revision feedback'
                          : 'Rejection reason'}
                      </p>
                      <Textarea
                        value={feedback}
                        onChange={(event) => setFeedback(event.target.value)}
                        placeholder="Add your feedback here..."
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Button
                      className="bg-emerald-500 text-white hover:bg-emerald-600"
                      onClick={() => handleReviewAction('APPROVED')}
                      disabled={reviewMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      className="bg-amber-400 text-white hover:bg-amber-500"
                      onClick={() =>
                        actionMode === 'REVISION_REQUESTED'
                          ? handleReviewAction('REVISION_REQUESTED')
                          : setActionMode('REVISION_REQUESTED')
                      }
                      disabled={reviewMutation.isPending}
                    >
                      Request Revision
                    </Button>
                    <Button
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={() =>
                        actionMode === 'REJECTED'
                          ? handleReviewAction('REJECTED')
                          : setActionMode('REJECTED')
                      }
                      disabled={reviewMutation.isPending}
                    >
                      Reject
                    </Button>
                    <Button variant="outline" onClick={() => setHistoryOpen(true)}>
                      View History
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <Button variant="outline" onClick={previousDeliverable} disabled={selectedIndex === 0}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={nextDeliverable}
                  disabled={selectedIndex === filteredDeliverables.length - 1}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deliverable History</DialogTitle>
            <DialogDescription>
              Previous submissions and feedback for this deliverable.
            </DialogDescription>
          </DialogHeader>
          {historyLoading ? (
            <div className="text-sm text-slate-500">Loading history...</div>
          ) : Array.isArray(historyData) && historyData.length > 0 ? (
            <div className="space-y-3">
              {historyData.map((item: any, index: number) => (
                <div key={item.submissionId || index} className="rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Version {item.versionNumber ?? index + 1}</span>
                    <span>
                      {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    {item.description || 'No description.'}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Status: {item.status || 'PENDING'}
                  </p>
                  {item.feedback && (
                    <p className="mt-2 text-xs text-slate-600">Feedback: {item.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">No history available.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { applicationService } from '@/lib/api/applications'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StatusChip } from '@/components/shared/status-chip'
import { ActionBar } from '@/components/shared/action-bar'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'
import { ContextPanel } from '@/components/shared/context-panel'
import { EmptyState } from '@/components/shared/empty-state'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TableSkeleton } from '@/components/shared/skeleton'
import { ApplicationStatus } from '@/lib/types'
import type { Application, Page } from '@/lib/types'

const statusToneMap: Record<string, 'approved' | 'needs_action' | 'blocked' | 'pending' | 'info'> = {
  APPLIED: 'pending',
  SHORTLISTED: 'needs_action',
  SELECTED: 'approved',
  REJECTED: 'blocked',
  WITHDRAWN: 'info',
}

const statusOptions = ['ALL', 'APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'WITHDRAWN'] as const

const creatorName = (application: Application) =>
  application.creator?.name ||
  application.creator?.profile?.fullName ||
  application.creator?.username ||
  application.creator?.email ||
  'Creator'

const updateApplicationInPage = (
  oldData: Page<Application> | { content?: Application[]; totalPages?: number } | undefined,
  applicationId: string,
  updater: (application: Application) => Application
) => {
  if (!oldData) return oldData
  if ('items' in oldData && Array.isArray(oldData.items)) {
    return {
      ...oldData,
      items: oldData.items.map((item) => (item.id === applicationId ? updater(item) : item)),
    }
  }
  if ('content' in oldData && Array.isArray(oldData.content)) {
    return {
      ...oldData,
      content: oldData.content.map((item) => (item.id === applicationId ? updater(item) : item)),
    }
  }
  return oldData
}

export default function BrandApplicationsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<(typeof statusOptions)[number]>('ALL')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectApplicationId, setRejectApplicationId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['brand-applications', page, status],
    queryFn: () => applicationService.getBrandApplications(page, 20, status),
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  })

  const items = ((data as any)?.items ?? (data as any)?.content ?? []) as Application[]
  const totalPages = (data as any)?.totalPages ?? 1

  const filteredItems = useMemo(() => {
    if (status === 'ALL') return items
    return items.filter((item: any) => item.status === status)
  }, [items, status])

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      nextStatus,
      reason,
    }: {
      id: string
      nextStatus: ApplicationStatus
      reason?: string
    }) =>
      nextStatus === ApplicationStatus.REJECTED
        ? applicationService.rejectApplication(id, reason || 'Not selected')
        : applicationService.updateApplicationStatus(id, nextStatus, reason),
    onMutate: async ({ id, nextStatus }) => {
      setPendingIds((current) => new Set(current).add(id))
      await queryClient.cancelQueries({ queryKey: ['brand-applications'] })
      const previous = queryClient.getQueriesData({ queryKey: ['brand-applications'] })

      queryClient.setQueriesData({ queryKey: ['brand-applications'] }, (oldData) =>
        updateApplicationInPage(oldData as any, id, (application) => ({
          ...application,
          status: nextStatus,
          updatedAt: new Date().toISOString(),
        }))
      )
      setSelectedApplication((current) =>
        current?.id === id ? { ...current, status: nextStatus, updatedAt: new Date().toISOString() } : current
      )

      return { previous, previousSelected: selectedApplication }
    },
    onError: (_error, _variables, context) => {
      context?.previous?.forEach(([queryKey, value]) => {
        queryClient.setQueryData(queryKey, value)
      })
      setSelectedApplication(context?.previousSelected ?? null)
    },
    onSuccess: (updatedApplication: Application, variables) => {
      queryClient.setQueriesData({ queryKey: ['brand-applications'] }, (oldData) =>
        updateApplicationInPage(oldData as any, variables.id, () => updatedApplication)
      )
      setSelectedApplication((current) => (current?.id === variables.id ? updatedApplication : current))
      setRejectDialogOpen(false)
      setRejectReason('')
      setRejectApplicationId(null)
    },
    onSettled: (_data, _error, variables) => {
      if (variables?.id) {
        setPendingIds((current) => {
          const next = new Set(current)
          next.delete(variables.id)
          return next
        })
      }
      queryClient.invalidateQueries({ queryKey: ['brand-applications'] })
    },
  })

  useEffect(() => {
    if (!selectedApplication && filteredItems.length > 0) {
      setSelectedApplication(filteredItems[0])
      return
    }
    if (selectedApplication && !filteredItems.some((item) => item.id === selectedApplication.id)) {
      setSelectedApplication(filteredItems[0] ?? null)
    }
  }, [filteredItems, selectedApplication])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!selectedApplication || rejectDialogOpen) return
      const target = event.target as HTMLElement | null
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return

      if (event.key.toLowerCase() === 's') {
        event.preventDefault()
        statusMutation.mutate({ id: selectedApplication.id, nextStatus: ApplicationStatus.SHORTLISTED })
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        statusMutation.mutate({ id: selectedApplication.id, nextStatus: ApplicationStatus.SELECTED })
      }
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault()
        setRejectApplicationId(selectedApplication.id)
        setRejectDialogOpen(true)
      }
      if (event.key.toLowerCase() === 'o' && selectedApplication.campaign?.id) {
        event.preventDefault()
        router.push(`/campaigns/${selectedApplication.campaign.id}/applications`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [rejectDialogOpen, router, selectedApplication, statusMutation])

  const runStatusAction = (application: Application, nextStatus: ApplicationStatus, reason?: string) => {
    setSelectedApplication(application)
    statusMutation.mutate({ id: application.id, nextStatus, reason })
  }

  const selectedPending = selectedApplication ? pendingIds.has(selectedApplication.id) : false

  return (
    <DashboardPageShell
      title="Applications"
      subtitle="Review, shortlist, and resolve creator applications in one operational queue."
      actionBar={
        <ActionBar
          title="Queue controls"
          description="Filter by status and process decisions without leaving this screen."
        >
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as (typeof statusOptions)[number])
              setPage(0)
            }}
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'ALL' ? 'All statuses' : option}
              </option>
            ))}
          </select>
        </ActionBar>
      }
      context={
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Creator preview</p>
            <p className="text-xs text-slate-500">Click a row, then use S, Enter, R, or O for fast decisions.</p>
          </div>
          {selectedApplication ? (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{creatorName(selectedApplication)}</p>
                <p className="text-xs text-slate-500">{selectedApplication.creator?.email || selectedApplication.creatorId}</p>
              </div>
              <ContextPanel
                title="Campaign"
                description={selectedApplication.campaign?.title || selectedApplication.campaignId || 'Campaign'}
              />
              <ContextPanel
                title="Pitch"
                description={selectedApplication.pitchText || 'No pitch text'}
              />
              <ContextPanel
                title="Timeline"
                description={selectedApplication.expectedTimeline || 'Not provided'}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => runStatusAction(selectedApplication, ApplicationStatus.SHORTLISTED)}
                  disabled={selectedPending}
                >
                  Shortlist
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => runStatusAction(selectedApplication, ApplicationStatus.SELECTED)}
                  disabled={selectedPending}
                >
                  Select
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setRejectApplicationId(selectedApplication.id)
                    setRejectDialogOpen(true)
                  }}
                  disabled={selectedPending}
                >
                  Reject
                </Button>
              </div>
              <p className="text-xs text-slate-500">Shortcuts: S shortlist, Enter select, R reject, O open campaign queue.</p>
            </div>
          ) : (
            <EmptyState title="No selection" description="Choose an application to preview creator context." />
          )}
        </div>
      }
      loading={isLoading && !data}
      loadingFallback={<TableSkeleton rows={6} />}
      errorMessage={isError ? 'Failed to load applications. Please try again.' : undefined}
      contentClassName="lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
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
                filteredItems.map((application) => {
                  const isPending = pendingIds.has(application.id)
                  return (
                  <tr
                    key={application.id}
                    className={`border-t border-slate-100 cursor-pointer ${selectedApplication?.id === application.id ? 'bg-slate-50' : ''}`}
                    onClick={() => setSelectedApplication(application)}
                  >
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">
                        {creatorName(application)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {application.creator?.verified ? 'Verified creator' : application.creator?.email || application.creatorId}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-sm text-slate-900">{application.campaign?.title || 'Campaign'}</p>
                      <p className="text-xs text-slate-500">{application.campaign?.category || application.campaignId}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusChip tone={statusToneMap[application.status] || 'info'} size="compact">
                        {isPending ? 'Updating...' : application.status}
                      </StatusChip>
                    </td>
                    <td className="py-3 pr-4">
                      {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 pr-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending || application.status === ApplicationStatus.SHORTLISTED}
                        onClick={(event) => {
                          event.stopPropagation()
                          runStatusAction(application, ApplicationStatus.SHORTLISTED)
                        }}
                      >
                        Shortlist
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending || application.status === ApplicationStatus.SELECTED}
                        onClick={(event) => {
                          event.stopPropagation()
                          runStatusAction(application, ApplicationStatus.SELECTED)
                        }}
                      >
                        Select
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isPending || application.status === ApplicationStatus.REJECTED}
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedApplication(application)
                          setRejectApplicationId(application.id)
                          setRejectDialogOpen(true)
                        }}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                )})
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    <EmptyState
                      title={status === 'ALL' ? 'No applications yet' : `No ${status.toLowerCase()} applications`}
                      description="New creator applications will appear here when campaigns receive interest."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
            <Button
              onClick={() => {
                if (!rejectApplicationId) return
                statusMutation.mutate({
                  id: rejectApplicationId,
                  nextStatus: ApplicationStatus.REJECTED,
                  reason: rejectReason || 'Not selected',
                })
              }}
              disabled={statusMutation.isPending || !rejectApplicationId}
            >
              Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardPageShell>
  )
}

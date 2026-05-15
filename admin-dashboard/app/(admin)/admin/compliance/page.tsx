'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminComplianceService } from '@/lib/api/admin/compliance'
import { GDPRRequestStatus } from '@/lib/types'
import { Pagination } from '@/components/shared/pagination'
import { ActionBar } from '@/components/shared/action-bar'
import { ContextPanel } from '@/components/shared/context-panel'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusChip } from '@/components/shared/status-chip'
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

const requestStatuses = Object.values(GDPRRequestStatus)
const SLA_DAYS = 30

const getAgeHours = (createdAt?: string) => {
  if (!createdAt) return null
  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) return null
  const diffMs = Date.now() - created.getTime()
  return diffMs / (1000 * 60 * 60)
}

const getAgeLabel = (createdAt?: string) => {
  const age = getAgeHours(createdAt)
  if (age === null) return '—'
  if (age < 1) return '<1h'
  if (age < 24) return `${Math.round(age)}h`
  return `${Math.round(age / 24)}d`
}

const getSlaBadge = (createdAt?: string) => {
  if (!createdAt) return { label: 'Unknown', className: 'bg-slate-100 text-slate-600' }
  const created = new Date(createdAt)
  if (Number.isNaN(created.getTime())) {
    return { label: 'Unknown', className: 'bg-slate-100 text-slate-600' }
  }
  const dueAt = new Date(created.getTime() + SLA_DAYS * 24 * 60 * 60 * 1000)
  if (Date.now() > dueAt.getTime()) {
    return { label: 'Breached', className: 'bg-rose-100 text-rose-700' }
  }
  const daysLeft = (dueAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  if (daysLeft <= 3) {
    return { label: 'Due Soon', className: 'bg-amber-100 text-amber-700' }
  }
  return { label: 'On Track', className: 'bg-emerald-100 text-emerald-700' }
}

const getNextAction = (request: any) => {
  if (request.status === 'COMPLETED') return 'No action'
  if (request.status === 'IN_PROGRESS') return 'Track export status'
  if (request.requestType === 'EXPORT') {
    return request.exportUrl ? 'Send export URL' : 'Generate export'
  }
  if (request.requestType === 'DELETE') {
    return 'Confirm anonymize'
  }
  return 'Review request'
}

const updateRequestInPage = (pageData: any, requestId: string, updater: (request: any) => any) => {
  if (!pageData) return pageData
  if (Array.isArray(pageData.items)) {
    return {
      ...pageData,
      items: pageData.items.map((request: any) => (request.id === requestId ? updater(request) : request)),
    }
  }
  if (Array.isArray(pageData.content)) {
    return {
      ...pageData,
      content: pageData.content.map((request: any) => (request.id === requestId ? updater(request) : request)),
    }
  }
  return pageData
}

export default function AdminCompliancePage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC')
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null)
  const [nextStatus, setNextStatus] = useState<GDPRRequestStatus>(GDPRRequestStatus.PENDING)
  const [exportUrlInput, setExportUrlInput] = useState('')
  const { toasts, pushToast, dismissToast } = useToast()

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-gdpr-requests', page, sortDir],
    queryFn: () => adminComplianceService.listRequests({ page, size: 20, sortDir }),
    placeholderData: (previousData) => previousData,
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1
  const exportStatusSummary = useMemo(
    () =>
      items.reduce(
        (summary: { pending: number; inProgress: number; completed: number; rejected: number }, request: any) => {
          if (request.status === 'PENDING') summary.pending += 1
          if (request.status === 'IN_PROGRESS') summary.inProgress += 1
          if (request.status === 'COMPLETED') summary.completed += 1
          if (request.status === 'REJECTED') summary.rejected += 1
          return summary
        },
        { pending: 0, inProgress: 0, completed: 0, rejected: 0 }
      ),
    [items]
  )
  const isTrackingExports = exportStatusSummary.inProgress > 0
  const selectedContext = useMemo(() => {
    if (!selectedRequest) return null
    return {
      age: getAgeLabel(selectedRequest.createdAt),
      nextAction: getNextAction(selectedRequest),
    }
  }, [selectedRequest])

  useEffect(() => {
    if (!isTrackingExports) return
    const timer = window.setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-gdpr-requests'] })
    }, 5000)
    return () => window.clearInterval(timer)
  }, [isTrackingExports, queryClient])

  const updateMutation = useMutation({
    mutationFn: ({ requestId, status, exportUrl }: { requestId: string; status: GDPRRequestStatus; exportUrl?: string }) =>
      adminComplianceService.updateRequest(requestId, { status, exportUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gdpr-requests'] })
      pushToast('Request updated', 'success')
    },
    onError: () => pushToast('Request update failed', 'error'),
  })

  const exportMutation = useMutation({
    mutationFn: (requestId: string) => adminComplianceService.generateExport(requestId),
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: ['admin-gdpr-requests'] })
      const previous = queryClient.getQueriesData({ queryKey: ['admin-gdpr-requests'] })
      queryClient.setQueriesData({ queryKey: ['admin-gdpr-requests'] }, (pageData) =>
        updateRequestInPage(pageData, requestId, (request) => ({
          ...request,
          status: GDPRRequestStatus.IN_PROGRESS,
        }))
      )
      setSelectedRequest((current: any) =>
        current?.id === requestId ? { ...current, status: GDPRRequestStatus.IN_PROGRESS } : current
      )
      return { previous }
    },
    onSuccess: (updatedRequest) => {
      queryClient.setQueriesData({ queryKey: ['admin-gdpr-requests'] }, (pageData) =>
        updateRequestInPage(pageData, updatedRequest.id, () => updatedRequest)
      )
      setSelectedRequest((current: any) => (current?.id === updatedRequest.id ? updatedRequest : current))
      queryClient.invalidateQueries({ queryKey: ['admin-gdpr-requests'] })
      pushToast(
        updatedRequest.status === GDPRRequestStatus.COMPLETED ? 'Export completed' : 'Export started',
        'success'
      )
    },
    onError: (_error, _requestId, context) => {
      context?.previous?.forEach(([queryKey, value]) => {
        queryClient.setQueryData(queryKey, value)
      })
      pushToast('Export failed', 'error')
    },
  })

  const anonymizeMutation = useMutation({
    mutationFn: (requestId: string) => adminComplianceService.anonymizeRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gdpr-requests'] })
      pushToast('User anonymized', 'success')
    },
    onError: () => pushToast('Anonymize failed', 'error'),
  })

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <DashboardPageShell
        title="GDPR Requests"
        subtitle="Track data export and deletion requests without blocking the queue."
        eyebrow="Compliance"
      >
      <div className="table-shell p-6">
        <ActionBar
          title="GDPR queue"
          description="Focus on requests nearing SLA."
        >
          <select
            className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
            value={sortDir}
            onChange={(event) => setSortDir(event.target.value as 'ASC' | 'DESC')}
          >
            <option value="DESC">Newest first</option>
            <option value="ASC">Oldest first</option>
          </select>
        </ActionBar>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Pending</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{exportStatusSummary.pending}</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold uppercase text-amber-700">Exporting</p>
            <p className="mt-1 text-xl font-semibold text-amber-900">{exportStatusSummary.inProgress}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs font-semibold uppercase text-emerald-700">Completed</p>
            <p className="mt-1 text-xl font-semibold text-emerald-900">{exportStatusSummary.completed}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase text-slate-500">Status polling</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {isTrackingExports ? 'Tracking every 5s' : isFetching ? 'Refreshing' : 'Idle'}
            </p>
          </div>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="table-compact w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Age</th>
                <th className="py-2 pr-4">Owner / Next</th>
                <th className="py-2 pr-4">SLA</th>
                <th className="py-2 pr-4">Export</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((request: any) => (
                  <tr key={request.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{request.userEmail}</p>
                    </td>
                    <td className="py-3 pr-4">{request.requestType}</td>
                    <td className="py-3 pr-4">
                      <StatusChip
                        tone={
                          request.status === 'COMPLETED'
                            ? 'approved'
                            : request.status === 'REJECTED'
                            ? 'blocked'
                            : request.status === 'IN_PROGRESS'
                            ? 'needs_action'
                            : 'pending'
                        }
                        size="compact"
                      >
                        {request.status}
                      </StatusChip>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-sm text-slate-700">{getAgeLabel(request.createdAt)}</p>
                      <p className="text-xs text-slate-500">
                        {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '—'}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs text-slate-500">
                        {request.resolvedBy ? `Owner: ${request.resolvedBy}` : 'Unassigned'}
                      </p>
                      <p className="text-xs text-slate-500">Next: {getNextAction(request)}</p>
                    </td>
                    <td className="py-3 pr-4">
                      {(() => {
                        const badge = getSlaBadge(request.createdAt)
                        return (
                          <StatusChip
                            tone={badge.label === 'Breached' ? 'blocked' : badge.label === 'Due Soon' ? 'needs_action' : 'approved'}
                            size="compact"
                          >
                            {badge.label}
                          </StatusChip>
                        )
                      })()}
                    </td>
                    <td className="py-3 pr-4">
                      {request.exportUrl ? (
                        <a
                          className="text-sm font-medium text-sky-600 hover:text-sky-700"
                          href={request.exportUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-slate-500">
                          {request.status === 'IN_PROGRESS' ? 'Generating...' : '—'}
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                        onClick={() => {
                          setSelectedRequest(request)
                          setNextStatus(request.status)
                          setExportUrlInput(request.exportUrl || '')
                        }}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-6">
                    <EmptyState
                      title="No GDPR requests"
                      description="You're all caught up with compliance requests."
                    />
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
        open={!!selectedRequest}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null)
            setExportUrlInput('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review GDPR request</DialogTitle>
            <DialogDescription>Update status and capture export metadata.</DialogDescription>
          </DialogHeader>
          {selectedRequest ? (
            <div className="space-y-4 text-sm text-slate-600">
              <div className="grid gap-3 md:grid-cols-2">
                <ContextPanel
                  title="User"
                  description={selectedRequest.userEmail}
                >
                  ID: {selectedRequest.userId}
                </ContextPanel>
                <ContextPanel
                  title="Request"
                  description={selectedRequest.requestType}
                >
                  Status: {selectedRequest.status}
                </ContextPanel>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <ContextPanel title="Age" description={selectedContext?.age || '—'} />
                <ContextPanel title="Next action" description={selectedContext?.nextAction || '—'} tone="warning" />
                <ContextPanel title="SLA" description={`${SLA_DAYS}d standard`} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">Status</label>
                <select
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value as GDPRRequestStatus)}
                >
                  {requestStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">Export URL (optional)</label>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  value={exportUrlInput}
                  onChange={(event) => setExportUrlInput(event.target.value)}
                  placeholder="https://storage.example.com/export.csv"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedRequest.requestType === 'EXPORT' && selectedRequest.status !== 'COMPLETED' ? (
                  <button
                    className="h-9 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white"
                    onClick={() => exportMutation.mutate(selectedRequest.id)}
                    disabled={exportMutation.isPending}
                  >
                    {exportMutation.isPending ? 'Starting export...' : 'Generate export'}
                  </button>
                ) : null}
                {selectedRequest.requestType === 'DELETE' && selectedRequest.status !== 'COMPLETED' ? (
                  <button
                    className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700"
                    onClick={() => anonymizeMutation.mutate(selectedRequest.id)}
                    disabled={anonymizeMutation.isPending}
                  >
                    Anonymize user
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <button
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => setSelectedRequest(null)}
            >
              Cancel
            </button>
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
              onClick={() => {
                if (!selectedRequest) return
                updateMutation.mutate({
                  requestId: selectedRequest.id,
                  status: nextStatus,
                  exportUrl: exportUrlInput || undefined,
                })
                setSelectedRequest(null)
              }}
            >
              Save Update
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

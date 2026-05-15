'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminKycService } from '@/lib/api/admin/kyc'
import { DocumentStatus, KYCDocument, Page } from '@/lib/types'
import { ToastStack } from '@/components/shared/toast'
import { useToast } from '@/lib/hooks/useToast'
import { Pagination } from '@/components/shared/pagination'
import { ActionBar } from '@/components/shared/action-bar'
import { ContextPanel } from '@/components/shared/context-panel'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusChip } from '@/components/shared/status-chip'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const getAgeHours = (submittedAt?: string) => {
  if (!submittedAt) return null
  const submitted = new Date(submittedAt)
  if (Number.isNaN(submitted.getTime())) return null
  const diffMs = Date.now() - submitted.getTime()
  return diffMs / (1000 * 60 * 60)
}

const updateKycPage = (
  pageData: Page<KYCDocument> | undefined,
  updater: (items: KYCDocument[]) => KYCDocument[]
) => {
  if (!pageData) return pageData
  const existingItems = (pageData as any).items ?? (pageData as any).content ?? []
  const nextItems = updater(existingItems)
  const total = (pageData as any).total ?? existingItems.length
  return {
    ...pageData,
    items: nextItems,
    content: (pageData as any).content ? nextItems : (pageData as any).content,
    total: Math.max(0, total - Math.max(0, existingItems.length - nextItems.length)),
  }
}

export default function AdminKycPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC')
  const [searchQuery, setSearchQuery] = useState('')
  const [docTypeFilter, setDocTypeFilter] = useState('ALL')
  const [slaFilter, setSlaFilter] = useState<'ALL' | 'DUE_SOON' | 'BREACHED'>('ALL')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [bulkReason, setBulkReason] = useState('')
  const [reviewingDoc, setReviewingDoc] = useState<any | null>(null)
  const [previewDoc, setPreviewDoc] = useState<any | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [bulkResult, setBulkResult] = useState<{ succeeded: number; failed: number; requested: number } | null>(null)
  const [pendingIds, setPendingIds] = useState<Record<string, boolean>>({})
  const { toasts, pushToast, dismissToast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-kyc-pending', page, sortDir],
    queryFn: () => adminKycService.listPending({ page, size: 20, sortDir }),
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminKycService.approve(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['admin-kyc-pending'] })
      const previousPages = queryClient.getQueriesData<Page<KYCDocument>>({ queryKey: ['admin-kyc-pending'] })
      const previousPreview = previewDoc
      const previousReview = reviewingDoc
      const previousSelected = selected
      setPendingIds((prev) => ({ ...prev, [id]: true }))
      setSelected((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setPreviewDoc((prev: any) => (prev?.id === id ? null : prev))
      setReviewingDoc((prev: any) => (prev?.id === id ? null : prev))
      queryClient.setQueriesData<Page<KYCDocument>>(
        { queryKey: ['admin-kyc-pending'] },
        (old) => updateKycPage(old, (items) => items.filter((item: any) => item.id !== id))
      )
      return { previousPages, previousPreview, previousReview, previousSelected, id }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-pending'] })
      queryClient.invalidateQueries({ queryKey: ['admin-workspace-summary'] })
      pushToast('KYC approved', 'success')
    },
    onError: (_error, _id, context) => {
      context?.previousPages?.forEach(([queryKey, pageData]) => {
        queryClient.setQueryData(queryKey, pageData)
      })
      setPreviewDoc(context?.previousPreview ?? null)
      setReviewingDoc(context?.previousReview ?? null)
      setSelected(context?.previousSelected ?? {})
      pushToast('KYC approval failed', 'error')
    },
    onSettled: (_data, _error, id) => {
      setPendingIds((prev) => {
        const next = { ...prev }
        if (id) delete next[id]
        return next
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminKycService.reject(id, reason),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-kyc-pending'] })
      const previousPages = queryClient.getQueriesData<Page<KYCDocument>>({ queryKey: ['admin-kyc-pending'] })
      const previousPreview = previewDoc
      const previousReview = reviewingDoc
      const previousSelected = selected
      setPendingIds((prev) => ({ ...prev, [id]: true }))
      setSelected((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
      setPreviewDoc((prev: any) => (prev?.id === id ? null : prev))
      setReviewingDoc((prev: any) => (prev?.id === id ? null : prev))
      queryClient.setQueriesData<Page<KYCDocument>>(
        { queryKey: ['admin-kyc-pending'] },
        (old) => updateKycPage(old, (items) => items.filter((item: any) => item.id !== id))
      )
      return { previousPages, previousPreview, previousReview, previousSelected, id }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-pending'] })
      queryClient.invalidateQueries({ queryKey: ['admin-workspace-summary'] })
      pushToast('KYC rejected', 'success')
    },
    onError: (_error, _variables, context) => {
      context?.previousPages?.forEach(([queryKey, pageData]) => {
        queryClient.setQueryData(queryKey, pageData)
      })
      setPreviewDoc(context?.previousPreview ?? null)
      setReviewingDoc(context?.previousReview ?? null)
      setSelected(context?.previousSelected ?? {})
      pushToast('KYC rejection failed', 'error')
    },
    onSettled: (_data, _error, variables) => {
      setPendingIds((prev) => {
        const next = { ...prev }
        if (variables?.id) delete next[variables.id]
        return next
      })
    },
  })

  const bulkMutation = useMutation({
    mutationFn: ({ status, reason }: { status: DocumentStatus; reason?: string }) =>
      adminKycService.bulkReview(
        Object.keys(selected).filter((key) => selected[key]),
        status,
        reason
      ),
    onMutate: async ({ status }) => {
      const ids = Object.keys(selected).filter((key) => selected[key])
      if (ids.length === 0) return { ids, previousPages: [] }
      await queryClient.cancelQueries({ queryKey: ['admin-kyc-pending'] })
      const previousPages = queryClient.getQueriesData<Page<KYCDocument>>({ queryKey: ['admin-kyc-pending'] })
      setPendingIds((prev) =>
        ids.reduce((acc, id) => ({ ...acc, [id]: true }), prev)
      )
      if (status === DocumentStatus.APPROVED || status === DocumentStatus.REJECTED) {
        setPreviewDoc((prev: any) => (prev && ids.includes(prev.id) ? null : prev))
        queryClient.setQueriesData<Page<KYCDocument>>(
          { queryKey: ['admin-kyc-pending'] },
          (old) => updateKycPage(old, (items) => items.filter((item: any) => !ids.includes(item.id)))
        )
      }
      return { ids, previousPages }
    },
    onSuccess: (result) => {
      setSelected({})
      setBulkReason('')
      setBulkResult({
        requested: result.requested,
        succeeded: result.succeeded,
        failed: result.failed,
      })
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-pending'] })
      queryClient.invalidateQueries({ queryKey: ['admin-workspace-summary'] })
      pushToast(`Bulk review completed: ${result.succeeded}/${result.requested} updated`, result.failed ? 'error' : 'success')
    },
    onError: (_error, _variables, context) => {
      context?.previousPages?.forEach(([queryKey, pageData]) => {
        queryClient.setQueryData(queryKey, pageData)
      })
      pushToast('Bulk review failed', 'error')
    },
    onSettled: (_data, _error, _variables, context) => {
      setPendingIds((prev) => {
        const next = { ...prev }
        context?.ids?.forEach((id) => {
          delete next[id]
        })
        return next
      })
    },
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1
  const totalItems = (data as any)?.total ?? items.length
  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  )
  const docTypes = useMemo(() => {
    const types = new Set<string>()
    items.forEach((item: any) => {
      if (item.documentType) {
        types.add(item.documentType)
      }
    })
    return Array.from(types)
  }, [items])
  const filteredItems = useMemo(() => {
    return items.filter((doc: any) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesQuery =
        !query ||
        String(doc.userEmail || '').toLowerCase().includes(query) ||
        String(doc.userId || '').toLowerCase().includes(query) ||
        String(doc.documentNumber || '').toLowerCase().includes(query)
      const matchesType = docTypeFilter === 'ALL' || doc.documentType === docTypeFilter
      const ageHours = getAgeHours(doc.submittedAt)
      const matchesSla =
        slaFilter === 'ALL' ||
        (slaFilter === 'DUE_SOON' && ageHours !== null && ageHours >= 4 && ageHours <= 6) ||
        (slaFilter === 'BREACHED' && ageHours !== null && ageHours > 6)
      return matchesQuery && matchesType && matchesSla
    })
  }, [items, searchQuery, docTypeFilter, slaFilter])
  const selectedSummary = useMemo(() => {
    const summary = Object.keys(selected).reduce<Record<string, number>>((acc, key) => {
      if (!selected[key]) return acc
      const doc = items.find((item: any) => item.id === key)
      const type = doc?.documentType || 'UNKNOWN'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})
    return summary
  }, [items, selected])

  const getAgeHoursLabel = (submittedAt?: string) => {
    const age = getAgeHours(submittedAt)
    if (age === null) return '—'
    if (age < 1) return '<1h'
    return `${Math.round(age)}h`
  }
  const getSlaBadge = (submittedAt?: string) => {
    const age = getAgeHours(submittedAt)
    if (age === null) {
      return { label: 'Unknown', className: 'bg-slate-100 text-slate-600' }
    }
    if (age > 6) {
      return { label: 'SLA Breach', className: 'bg-rose-100 text-rose-700' }
    }
    if (age >= 4) {
      return { label: 'Due Soon', className: 'bg-amber-100 text-amber-700' }
    }
    return { label: 'On Track', className: 'bg-emerald-100 text-emerald-700' }
  }
  const isImageFile = (url?: string) => {
    if (!url) return false
    return /\.(png|jpe?g|gif|webp)$/i.test(url)
  }
  const isPdfFile = (url?: string) => {
    if (!url) return false
    return /\.pdf$/i.test(url)
  }
  const openReview = (doc: any) => {
    setReviewingDoc(doc)
  }

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <DashboardPageShell
        title="KYC Review"
        subtitle="Review pending creator KYC submissions."
        eyebrow="Work Queue"
      >
      <div className="table-shell p-6">
        <ActionBar
          title={`Pending documents (${totalItems})`}
          description="Batch review to keep the queue under SLA."
        >
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={sortDir}
            onChange={(event) => setSortDir(event.target.value as 'ASC' | 'DESC')}
          >
            <option value="DESC">Newest first</option>
            <option value="ASC">Oldest first</option>
          </select>
          <input
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            placeholder="Bulk rejection reason"
            value={bulkReason}
            onChange={(event) => setBulkReason(event.target.value)}
          />
          <button
            className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white"
            disabled={!selectedCount || bulkMutation.isPending}
            onClick={() => bulkMutation.mutate({ status: DocumentStatus.APPROVED })}
          >
            {bulkMutation.isPending ? 'Updating...' : 'Approve Selected'}
          </button>
          <button
            className="h-10 rounded-lg border border-rose-200 px-4 text-sm font-semibold text-rose-600"
            disabled={!selectedCount || bulkMutation.isPending}
            onClick={() => bulkMutation.mutate({ status: DocumentStatus.REJECTED, reason: bulkReason })}
          >
            {bulkMutation.isPending ? 'Updating...' : 'Reject Selected'}
          </button>
        </ActionBar>

        {bulkResult ? (
          <div
            className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
              bulkResult.failed
                ? 'border-amber-200 bg-amber-50 text-amber-800'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            Bulk review result: {bulkResult.succeeded} succeeded, {bulkResult.failed} failed out of{' '}
            {bulkResult.requested}.
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <input
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              placeholder="Search by email, user ID, or document number"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <select
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              value={docTypeFilter}
              onChange={(event) => setDocTypeFilter(event.target.value)}
            >
              <option value="ALL">All document types</option>
              {docTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              value={slaFilter}
              onChange={(event) => setSlaFilter(event.target.value as 'ALL' | 'DUE_SOON' | 'BREACHED')}
            >
              <option value="ALL">All SLA states</option>
              <option value="DUE_SOON">Due soon (4-6h)</option>
              <option value="BREACHED">SLA breached (6h+)</option>
            </select>
          </div>
          {selectedCount > 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">{selectedCount}</span> selected ·{' '}
              {Object.entries(selectedSummary)
                .map(([type, count]) => `${type}: ${count}`)
                .join(', ')}
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="overflow-x-auto">
            <table className="table-compact w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">
                  <input
                    type="checkbox"
                    checked={selectedCount === filteredItems.length && filteredItems.length > 0}
                    onChange={(event) => {
                      const next: Record<string, boolean> = {}
                      filteredItems.forEach((item: any) => {
                        next[item.id] = event.target.checked
                      })
                      setSelected(next)
                    }}
                  />
                </th>
                <th className="py-2 pr-4">Creator</th>
                <th className="py-2 pr-4">Document</th>
                <th className="py-2 pr-4">Submitted</th>
                <th className="py-2 pr-4">SLA</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6">
                    <EmptyState
                      title="No pending KYC submissions"
                      description="New KYC requests will appear here."
                    />
                  </td>
                </tr>
              ) : (
                filteredItems.map((doc: any) => {
                  const isPending = !!pendingIds[doc.id]
                  return (
                    <tr
                      key={doc.id}
                      className={`border-t border-slate-100 cursor-pointer ${previewDoc?.id === doc.id ? 'bg-slate-50' : ''} ${isPending ? 'opacity-60' : ''}`}
                      onClick={() => {
                        if (!isPending) setPreviewDoc(doc)
                      }}
                    >
                    <td className="py-3 pr-4">
                      <input
                        type="checkbox"
                        checked={!!selected[doc.id]}
                        disabled={isPending}
                        onChange={(event) =>
                          setSelected((prev) => ({ ...prev, [doc.id]: event.target.checked }))
                        }
                        onClick={(event) => event.stopPropagation()}
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{doc.userEmail || doc.userId}</p>
                      <p className="text-xs text-slate-500">{doc.userId}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden text-xs text-slate-500">
                          {isImageFile(doc.fileUrl) ? (
                            <img src={doc.fileUrl} alt="KYC document" className="h-full w-full object-cover" />
                          ) : isPdfFile(doc.fileUrl) ? (
                            <span>PDF</span>
                          ) : (
                            <span>DOC</span>
                          )}
                        </div>
                        <div>
                          <a className="text-sky-600 hover:underline" href={doc.fileUrl} target="_blank" rel="noreferrer">
                            {doc.documentType}
                          </a>
                          <p className="text-xs text-slate-500">
                            {doc.documentNumber ? `#${doc.documentNumber}` : 'No document number'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <p>{doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : '—'}</p>
                      <p className="text-xs text-slate-500">Waiting {getAgeHoursLabel(doc.submittedAt)}</p>
                    </td>
                    <td className="py-3 pr-4">
                      {(() => {
                        if (isPending) {
                          return (
                            <StatusChip tone="pending" size="compact">
                              Updating
                            </StatusChip>
                          )
                        }
                        const badge = getSlaBadge(doc.submittedAt)
                        return (
                          <StatusChip
                            tone={badge.label === 'SLA Breach' ? 'blocked' : badge.label === 'Due Soon' ? 'needs_action' : 'approved'}
                            size="compact"
                          >
                            {badge.label}
                          </StatusChip>
                        )
                      })()}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                          onClick={(event) => {
                            event.stopPropagation()
                            openReview(doc)
                          }}
                          disabled={isPending}
                        >
                          Review
                        </button>
                        <button
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                          onClick={(event) => {
                            event.stopPropagation()
                            approveMutation.mutate(doc.id)
                          }}
                          disabled={isPending}
                        >
                          {isPending ? 'Updating...' : 'Approve'}
                        </button>
                        <button
                          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600"
                          onClick={(event) => {
                            event.stopPropagation()
                            setRejectingId(doc.id)
                            setRejectReason('')
                          }}
                          disabled={isPending}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                  )
                })
              )}
            </tbody>
          </table>
          </div>

          <aside className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Inline preview</p>
              <p className="text-xs text-slate-500">Select a row to review context without leaving the queue.</p>
            </div>
            {previewDoc ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-20 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden text-xs text-slate-500">
                    {isImageFile(previewDoc.fileUrl) ? (
                      <img src={previewDoc.fileUrl} alt="KYC document" className="h-full w-full object-cover" />
                    ) : isPdfFile(previewDoc.fileUrl) ? (
                      <span>PDF</span>
                    ) : (
                      <span>DOC</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{previewDoc.userEmail || previewDoc.userId}</p>
                    <p className="text-xs text-slate-500">{previewDoc.documentType}</p>
                  </div>
                </div>
                <ContextPanel title="Document" description={previewDoc.documentNumber ? `#${previewDoc.documentNumber}` : 'No document number'} />
                <ContextPanel title="Age" description={getAgeHoursLabel(previewDoc.submittedAt)} tone="warning" />
                <div className="flex flex-wrap gap-2">
                  <button
                    className="h-9 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white"
                    onClick={() => approveMutation.mutate(previewDoc.id)}
                    disabled={!!pendingIds[previewDoc.id]}
                  >
                    {pendingIds[previewDoc.id] ? 'Updating...' : 'Approve'}
                  </button>
                  <button
                    className="h-9 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-600"
                    onClick={() => {
                      setRejectingId(previewDoc.id)
                      setRejectReason('')
                    }}
                    disabled={!!pendingIds[previewDoc.id]}
                  >
                    Reject
                  </button>
                  <button
                    className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700"
                    onClick={() => openReview(previewDoc)}
                    disabled={!!pendingIds[previewDoc.id]}
                  >
                    Open review
                  </button>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No selection"
                description="Choose a submission to see the inline preview."
              />
            )}
          </aside>
        </div>
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
      </DashboardPageShell>

      <Dialog
        open={!!reviewingDoc}
        onOpenChange={(open) => {
          if (!open) {
            setReviewingDoc(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review KYC document</DialogTitle>
            <DialogDescription>Verify identity details before approving.</DialogDescription>
          </DialogHeader>
          {reviewingDoc ? (
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center gap-4">
                <div className="h-20 w-28 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden text-xs text-slate-500">
                  {isImageFile(reviewingDoc.fileUrl) ? (
                    <img src={reviewingDoc.fileUrl} alt="KYC document" className="h-full w-full object-cover" />
                  ) : isPdfFile(reviewingDoc.fileUrl) ? (
                    <span>PDF</span>
                  ) : (
                    <span>DOC</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{reviewingDoc.userEmail || reviewingDoc.userId}</p>
                  <p className="text-xs text-slate-500">User ID: {reviewingDoc.userId}</p>
                  <p className="text-xs text-slate-500">
                    {reviewingDoc.documentType} {reviewingDoc.documentNumber ? `#${reviewingDoc.documentNumber}` : ''}
                  </p>
                  <a className="text-xs text-sky-600 hover:underline" href={reviewingDoc.fileUrl} target="_blank" rel="noreferrer">
                    Open document
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-slate-500">
                  Submitted {reviewingDoc.submittedAt ? new Date(reviewingDoc.submittedAt).toLocaleString() : '—'}
                </span>
                <span className="text-xs text-slate-500">Waiting {getAgeHoursLabel(reviewingDoc.submittedAt)}</span>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <button
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => setReviewingDoc(null)}
            >
              Close
            </button>
            <button
              className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white"
              onClick={() => {
                if (reviewingDoc) {
                  approveMutation.mutate(reviewingDoc.id)
                  setReviewingDoc(null)
                }
              }}
            >
              Approve
            </button>
            <button
              className="h-10 rounded-lg border border-rose-200 px-4 text-sm font-semibold text-rose-600"
              onClick={() => {
                if (reviewingDoc) {
                  setRejectingId(reviewingDoc.id)
                  setRejectReason('')
                  setReviewingDoc(null)
                }
              }}
            >
              Reject
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!rejectingId}
        onOpenChange={(open) => {
          if (!open) {
            setRejectingId(null)
            setRejectReason('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject KYC document</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this submission.</DialogDescription>
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
              onClick={() => setRejectingId(null)}
            >
              Cancel
            </button>
            <button
              className="h-10 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white"
              onClick={() => {
                if (rejectingId && rejectReason.trim()) {
                  rejectMutation.mutate({ id: rejectingId, reason: rejectReason.trim() })
                  setRejectingId(null)
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

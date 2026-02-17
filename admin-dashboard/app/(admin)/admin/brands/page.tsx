'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminBrandVerificationService } from '@/lib/api/admin/brand-verification'
import { ToastStack } from '@/components/shared/toast'
import { useToast } from '@/lib/hooks/useToast'
import { Pagination } from '@/components/shared/pagination'
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

export default function AdminBrandVerificationPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC')
  const [searchQuery, setSearchQuery] = useState('')
  const [slaFilter, setSlaFilter] = useState<'ALL' | 'DUE_SOON' | 'BREACHED'>('ALL')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [bulkReason, setBulkReason] = useState('')
  const [reviewingDoc, setReviewingDoc] = useState<any | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const { toasts, pushToast, dismissToast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-brand-verifications', page, sortDir],
    queryFn: () => adminBrandVerificationService.listPending({ page, size: 20, sortDir }),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      adminBrandVerificationService.review(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brand-verifications'] })
      pushToast('Brand verification updated', 'success')
    },
    onError: () => pushToast('Brand verification update failed', 'error'),
  })

  const bulkMutation = useMutation({
    mutationFn: ({ status, reason }: { status: string; reason?: string }) =>
      adminBrandVerificationService.bulkReview(
        Object.keys(selected).filter((key) => selected[key]),
        status,
        reason
      ),
    onSuccess: () => {
      setSelected({})
      setBulkReason('')
      queryClient.invalidateQueries({ queryKey: ['admin-brand-verifications'] })
      pushToast('Bulk review submitted', 'success')
    },
    onError: () => pushToast('Bulk review failed', 'error'),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1
  const totalItems = (data as any)?.total ?? (data as any)?.totalElements ?? items.length
  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  )
  const filteredItems = useMemo(() => {
    return items.filter((doc: any) => {
      const query = searchQuery.trim().toLowerCase()
      const matchesQuery =
        !query ||
        String(doc.brandEmail || '').toLowerCase().includes(query) ||
        String(doc.brandId || '').toLowerCase().includes(query)
      const ageHours = getAgeHours(doc.submittedAt)
      const matchesSla =
        slaFilter === 'ALL' ||
        (slaFilter === 'DUE_SOON' && ageHours !== null && ageHours >= 4 && ageHours <= 6) ||
        (slaFilter === 'BREACHED' && ageHours !== null && ageHours > 6)
      return matchesQuery && matchesSla
    })
  }, [items, searchQuery, slaFilter])

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

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-brand-verification-detail', reviewingDoc?.documentId],
    queryFn: () => adminBrandVerificationService.getDetail(reviewingDoc.documentId),
    enabled: !!reviewingDoc?.documentId,
  })

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Brand Verification</h1>
        <p className="text-slate-500">Review GST verification submissions from brands.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Pending documents</p>
            <p className="text-xl font-semibold text-slate-900">{totalItems}</p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
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
              disabled={!selectedCount}
              onClick={() => bulkMutation.mutate({ status: 'APPROVED' })}
            >
              Approve Selected
            </button>
            <button
              className="h-10 rounded-lg border border-rose-200 px-4 text-sm font-semibold text-rose-600"
              disabled={!selectedCount}
              onClick={() => bulkMutation.mutate({ status: 'REJECTED', reason: bulkReason })}
            >
              Reject Selected
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <input
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              placeholder="Search by brand email or ID"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
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
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">
                  <input
                    type="checkbox"
                    checked={selectedCount === filteredItems.length && filteredItems.length > 0}
                    onChange={(event) => {
                      const next: Record<string, boolean> = {}
                      filteredItems.forEach((item: any) => {
                        next[item.documentId] = event.target.checked
                      })
                      setSelected(next)
                    }}
                  />
                </th>
                <th className="py-2 pr-4">Brand</th>
                <th className="py-2 pr-4">Document</th>
                <th className="py-2 pr-4">Submitted</th>
                <th className="py-2 pr-4">SLA</th>
                <th className="py-2 pr-4">Reason</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No pending brand verifications.
                  </td>
                </tr>
              ) : (
                filteredItems.map((doc: any) => (
                  <tr key={doc.documentId} className="border-t border-slate-100">
                    <td className="py-3 pr-4">
                      <input
                        type="checkbox"
                        checked={!!selected[doc.documentId]}
                        onChange={(event) =>
                          setSelected((prev) => ({ ...prev, [doc.documentId]: event.target.checked }))
                        }
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{doc.brandEmail || doc.brandId}</p>
                      <p className="text-xs text-slate-500">{doc.brandId}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden text-xs text-slate-500">
                          {isImageFile(doc.fileUrl) ? (
                            <img src={doc.fileUrl} alt="GST document" className="h-full w-full object-cover" />
                          ) : isPdfFile(doc.fileUrl) ? (
                            <span>PDF</span>
                          ) : (
                            <span>DOC</span>
                          )}
                        </div>
                        <a className="text-sky-600 hover:underline" href={doc.fileUrl} target="_blank" rel="noreferrer">
                          GST Document
                        </a>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <p>{doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : '—'}</p>
                      <p className="text-xs text-slate-500">Waiting {getAgeHoursLabel(doc.submittedAt)}</p>
                    </td>
                    <td className="py-3 pr-4">
                      {(() => {
                        const badge = getSlaBadge(doc.submittedAt)
                        return (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
                            {badge.label}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs text-slate-500">{doc.rejectionReason || '—'}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                          onClick={() => setReviewingDoc(doc)}
                        >
                          Review
                        </button>
                        <button
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                          onClick={() => reviewMutation.mutate({ id: doc.documentId, status: 'APPROVED' })}
                        >
                          Approve
                        </button>
                        <button
                          className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600"
                          onClick={() => {
                            setRejectingId(doc.documentId)
                            setRejectReason('')
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

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
            <DialogTitle>Review brand verification</DialogTitle>
            <DialogDescription>Confirm GST document before approving.</DialogDescription>
          </DialogHeader>
          {reviewingDoc ? (
            <div className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center gap-4">
                <div className="h-20 w-28 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden text-xs text-slate-500">
                  {isImageFile(detail?.fileUrl || reviewingDoc.fileUrl) ? (
                    <img
                      src={detail?.fileUrl || reviewingDoc.fileUrl}
                      alt="GST document"
                      className="h-full w-full object-cover"
                    />
                  ) : isPdfFile(detail?.fileUrl || reviewingDoc.fileUrl) ? (
                    <span>PDF</span>
                  ) : (
                    <span>DOC</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{reviewingDoc.brandEmail || reviewingDoc.brandId}</p>
                  <p className="text-xs text-slate-500">Brand ID: {reviewingDoc.brandId}</p>
                  <a
                    className="text-xs text-sky-600 hover:underline"
                    href={detail?.fileUrl || reviewingDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open document
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-slate-500">
                  Submitted {reviewingDoc.submittedAt ? new Date(reviewingDoc.submittedAt).toLocaleString() : '—'}
                </span>
                <span className="text-xs text-slate-500">Waiting {getAgeHoursLabel(reviewingDoc.submittedAt)}</span>
                {detail?.rejectionReason ? (
                  <span className="text-xs text-rose-600">Last rejection: {detail.rejectionReason}</span>
                ) : null}
              </div>
              {detailLoading ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                  Loading brand context...
                </div>
              ) : (
                <>
                  <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 md:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase text-slate-400">Company</p>
                      <p className="font-semibold text-slate-900">{detail?.profile?.companyName || '—'}</p>
                      <p className="text-slate-500">{detail?.profile?.industry || 'Industry unknown'}</p>
                      <p className="text-slate-500">{detail?.profile?.website || 'No website'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-slate-400">GST</p>
                      <p className="font-semibold text-slate-900">{detail?.profile?.gstNumber || '—'}</p>
                      <p className="text-slate-500">Verified: {detail?.profile?.verified ? 'Yes' : 'No'}</p>
                      <p className="text-slate-500">User status: {detail?.profile?.userStatus || '—'}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">
                      <p className="text-[10px] uppercase text-slate-400">Prior rejections</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{detail?.risk?.priorRejections ?? 0}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">
                      <p className="text-[10px] uppercase text-slate-400">Open disputes</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{detail?.risk?.openDisputes ?? 0}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">
                      <p className="text-[10px] uppercase text-slate-400">Open flags</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{detail?.risk?.openCampaignFlags ?? 0}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-900">Verification history</p>
                    {detail?.history?.length ? (
                      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                        {detail.history.map((entry) => (
                          <div key={entry.documentId} className="flex items-center justify-between px-3 py-2 text-xs text-slate-600">
                            <div>
                              <p className="font-semibold text-slate-900">{entry.status}</p>
                              <p className="text-slate-500">
                                {entry.submittedAt ? new Date(entry.submittedAt).toLocaleDateString() : '—'}
                              </p>
                            </div>
                            <div className="text-right text-slate-500">
                              {entry.rejectionReason ? `Reason: ${entry.rejectionReason}` : '—'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No prior submissions.</p>
                    )}
                  </div>
                </>
              )}
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
                  reviewMutation.mutate({ id: reviewingDoc.documentId, status: 'APPROVED' })
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
                  setRejectingId(reviewingDoc.documentId)
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
            <DialogTitle>Reject brand verification</DialogTitle>
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
                  reviewMutation.mutate({ id: rejectingId, status: 'REJECTED', reason: rejectReason.trim() })
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

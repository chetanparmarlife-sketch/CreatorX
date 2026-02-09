'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminBrandVerificationService } from '@/lib/api/admin/brand-verification'

export default function AdminBrandVerificationPage() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [bulkReason, setBulkReason] = useState('')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-brand-verifications'],
    queryFn: () => adminBrandVerificationService.listPending(),
  })

  const items = data?.items ?? []

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      adminBrandVerificationService.review(id, status, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-brand-verifications'] }),
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
    },
  })

  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  )

  const filteredData = useMemo(() => {
    if (!search) return items
    const value = search.toLowerCase()
    return items.filter((doc) =>
      [doc.brandEmail, doc.brandId, doc.documentId]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value))
    )
  }, [items, search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Brand Verification</h1>
        <p className="text-slate-500">Review GST verification submissions from brands.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Pending documents</p>
            <p className="text-xl font-semibold text-slate-900">{items.length}</p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              placeholder="Search brand or document ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
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

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">
                  <input
                    type="checkbox"
                    checked={selectedCount === items.length && items.length > 0}
                    onChange={(event) => {
                      const next: Record<string, boolean> = {}
                      items.forEach((item) => {
                        next[item.documentId] = event.target.checked
                      })
                      setSelected(next)
                    }}
                  />
                </th>
                <th className="py-2 pr-4">Brand</th>
                <th className="py-2 pr-4">Document</th>
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
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No pending brand verifications.
                  </td>
                </tr>
              ) : (
                filteredData.map((doc) => (
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
                    </td>
                    <td className="py-3 pr-4">
                      <a className="text-sky-600 hover:underline" href={doc.fileUrl} target="_blank" rel="noreferrer">
                        GST Document
                      </a>
                    </td>
                    <td className="py-3 pr-4">
                      {doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 pr-4 flex gap-2">
                      <button
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                        onClick={() => reviewMutation.mutate({ id: doc.documentId, status: 'APPROVED' })}
                      >
                        Approve
                      </button>
                      <button
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600"
                        onClick={() => {
                          const reason = window.prompt('Rejection reason')
                          if (reason) {
                            reviewMutation.mutate({ id: doc.documentId, status: 'REJECTED', reason })
                          }
                        }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

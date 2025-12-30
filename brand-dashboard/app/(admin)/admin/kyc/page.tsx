'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminKycService } from '@/lib/api/admin/kyc'
import { DocumentStatus } from '@/lib/types'

export default function AdminKycPage() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [bulkReason, setBulkReason] = useState('')

  const { data = [], isLoading } = useQuery({
    queryKey: ['admin-kyc-pending'],
    queryFn: adminKycService.listPending,
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminKycService.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-kyc-pending'] }),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminKycService.reject(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-kyc-pending'] }),
  })

  const bulkMutation = useMutation({
    mutationFn: ({ status, reason }: { status: DocumentStatus; reason?: string }) =>
      adminKycService.bulkReview(
        Object.keys(selected).filter((key) => selected[key]),
        status,
        reason
      ),
    onSuccess: () => {
      setSelected({})
      setBulkReason('')
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-pending'] })
    },
  })

  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">KYC Review</h1>
        <p className="text-slate-500">Review pending creator KYC submissions.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Pending documents</p>
            <p className="text-xl font-semibold text-slate-900">{data.length}</p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <input
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              placeholder="Bulk rejection reason"
              value={bulkReason}
              onChange={(event) => setBulkReason(event.target.value)}
            />
            <button
              className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white"
              disabled={!selectedCount}
              onClick={() => bulkMutation.mutate({ status: DocumentStatus.APPROVED })}
            >
              Approve Selected
            </button>
            <button
              className="h-10 rounded-lg border border-rose-200 px-4 text-sm font-semibold text-rose-600"
              disabled={!selectedCount}
              onClick={() => bulkMutation.mutate({ status: DocumentStatus.REJECTED, reason: bulkReason })}
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
                    checked={selectedCount === data.length && data.length > 0}
                    onChange={(event) => {
                      const next: Record<string, boolean> = {}
                      data.forEach((item) => {
                        next[item.id] = event.target.checked
                      })
                      setSelected(next)
                    }}
                  />
                </th>
                <th className="py-2 pr-4">Creator</th>
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
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No pending KYC submissions.
                  </td>
                </tr>
              ) : (
                data.map((doc) => (
                  <tr key={doc.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">
                      <input
                        type="checkbox"
                        checked={!!selected[doc.id]}
                        onChange={(event) =>
                          setSelected((prev) => ({ ...prev, [doc.id]: event.target.checked }))
                        }
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{doc.userEmail || doc.userId}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <a className="text-sky-600 hover:underline" href={doc.fileUrl} target="_blank" rel="noreferrer">
                        {doc.documentType}
                      </a>
                    </td>
                    <td className="py-3 pr-4">
                      {doc.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 pr-4 flex gap-2">
                      <button
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                        onClick={() => approveMutation.mutate(doc.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600"
                        onClick={() => {
                          const reason = window.prompt('Rejection reason')
                          if (reason) {
                            rejectMutation.mutate({ id: doc.id, reason })
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

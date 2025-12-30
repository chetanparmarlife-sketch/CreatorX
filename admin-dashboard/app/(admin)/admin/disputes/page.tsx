'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminDisputeService } from '@/lib/api/admin/disputes'

export default function AdminDisputesPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => adminDisputeService.list({ page: 0, size: 50 }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []

  const resolveMutation = useMutation({
    mutationFn: ({ disputeId, status, resolution }: { disputeId: string; status: string; resolution?: string }) =>
      adminDisputeService.resolve(disputeId, status, resolution),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-disputes'] }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Disputes</h1>
        <p className="text-slate-500">Resolve creator and brand disputes.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Parties</th>
                <th className="py-2 pr-4">Campaign</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Status</th>
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
              ) : items.length ? (
                items.map((dispute: any) => (
                  <tr key={dispute.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{dispute.creatorEmail}</p>
                      <p className="text-xs text-slate-500">{dispute.brandEmail}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{dispute.campaignTitle || '—'}</p>
                    </td>
                    <td className="py-3 pr-4">{dispute.type}</td>
                    <td className="py-3 pr-4">{dispute.status}</td>
                    <td className="py-3 pr-4">
                      <button
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                        onClick={() => {
                          const status = window.prompt('Set status (RESOLVED/CLOSED/IN_REVIEW)', dispute.status)
                          if (status) {
                            const resolution = window.prompt('Resolution notes') || undefined
                            resolveMutation.mutate({ disputeId: dispute.id, status, resolution })
                          }
                        }}
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No disputes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

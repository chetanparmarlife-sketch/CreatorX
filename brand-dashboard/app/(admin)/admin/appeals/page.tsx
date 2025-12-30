'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminUserService } from '@/lib/api/admin/users'
import { AppealStatus } from '@/lib/types'

const appealStatuses = Object.values(AppealStatus)

export default function AdminAppealsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-appeals'],
    queryFn: () => adminUserService.listAppeals({ page: 0, size: 50 }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []

  const resolveMutation = useMutation({
    mutationFn: ({ appealId, status, resolution }: { appealId: string; status: AppealStatus; resolution?: string }) =>
      adminUserService.resolveAppeal(appealId, status, resolution),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-appeals'] }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Account Appeals</h1>
        <p className="text-slate-500">Review and resolve suspension appeals.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Reason</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((appeal: any) => (
                  <tr key={appeal.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{appeal.userEmail}</p>
                    </td>
                    <td className="py-3 pr-4 max-w-md text-slate-600">{appeal.reason}</td>
                    <td className="py-3 pr-4">{appeal.status}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <select
                          className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
                          defaultValue={appeal.status}
                          onChange={(event) => {
                            const status = event.target.value as AppealStatus
                            const resolution = window.prompt('Resolution notes') || undefined
                            resolveMutation.mutate({ appealId: appeal.id, status, resolution })
                          }}
                        >
                          {appealStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No appeals in queue.
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

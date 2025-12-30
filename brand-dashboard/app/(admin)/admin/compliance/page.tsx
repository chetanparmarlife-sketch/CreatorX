'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminComplianceService } from '@/lib/api/admin/compliance'
import { GDPRRequestStatus } from '@/lib/types'

const requestStatuses = Object.values(GDPRRequestStatus)

export default function AdminCompliancePage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-gdpr-requests'],
    queryFn: () => adminComplianceService.listRequests({ page: 0, size: 50 }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []

  const updateMutation = useMutation({
    mutationFn: ({ requestId, status, exportUrl }: { requestId: string; status: GDPRRequestStatus; exportUrl?: string }) =>
      adminComplianceService.updateRequest(requestId, { status, exportUrl }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-gdpr-requests'] }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">GDPR Requests</h1>
        <p className="text-slate-500">Track data export and deletion requests.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Type</th>
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
                items.map((request: any) => (
                  <tr key={request.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{request.userEmail}</p>
                    </td>
                    <td className="py-3 pr-4">{request.requestType}</td>
                    <td className="py-3 pr-4">{request.status}</td>
                    <td className="py-3 pr-4">
                      <select
                        className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
                        defaultValue={request.status}
                        onChange={(event) => {
                          const status = event.target.value as GDPRRequestStatus
                          const exportUrl = window.prompt('Export URL (optional)') || undefined
                          updateMutation.mutate({ requestId: request.id, status, exportUrl })
                        }}
                      >
                        {requestStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No GDPR requests.
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

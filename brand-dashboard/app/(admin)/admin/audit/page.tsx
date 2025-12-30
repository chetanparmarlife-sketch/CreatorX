'use client'

import { useQuery } from '@tanstack/react-query'
import { adminAuditService } from '@/lib/api/admin/audit'

export default function AdminAuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: () => adminAuditService.list({ page: 0, size: 50 }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Audit Log</h1>
        <p className="text-slate-500">Trace critical admin actions.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Admin</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Entity</th>
                <th className="py-2 pr-4">Time</th>
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
                items.map((entry: any) => (
                  <tr key={entry.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{entry.adminEmail}</p>
                    </td>
                    <td className="py-3 pr-4">{entry.actionType}</td>
                    <td className="py-3 pr-4">
                      {entry.entityType} {entry.entityId ? `#${entry.entityId}` : ''}
                    </td>
                    <td className="py-3 pr-4">
                      {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No audit logs available.
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

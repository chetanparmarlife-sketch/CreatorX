'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminAuditService } from '@/lib/api/admin/audit'

export default function AdminAuditPage() {
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')
  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit'],
    queryFn: () => adminAuditService.list({ page: 0, size: 50 }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []

  const actionTypes = useMemo(() => {
    const values = new Set<string>()
    items.forEach((entry: any) => {
      if (entry.actionType) values.add(entry.actionType)
    })
    return Array.from(values)
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter((entry: any) => {
      const matchesAction = actionFilter === 'ALL' || entry.actionType === actionFilter
      const matchesSearch =
        !search ||
        entry.adminEmail?.toLowerCase().includes(search.toLowerCase()) ||
        entry.entityType?.toLowerCase().includes(search.toLowerCase()) ||
        entry.entityId?.toLowerCase().includes(search.toLowerCase())
      return matchesAction && matchesSearch
    })
  }, [actionFilter, items, search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Audit Log</h1>
        <p className="text-slate-500">Trace critical admin actions.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Recent actions</p>
            <p className="text-xl font-semibold text-slate-900">{items.length}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              placeholder="Search admin or entity"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="h-10 rounded-lg border border-slate-200 px-2 text-sm"
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
            >
              <option value="ALL">All Actions</option>
              {actionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
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
              ) : filteredItems.length ? (
                filteredItems.map((entry: any) => (
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

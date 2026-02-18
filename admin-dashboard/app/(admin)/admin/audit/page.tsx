'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminAuditService } from '@/lib/api/admin/audit'
import { Pagination } from '@/components/shared/pagination'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'

export default function AdminAuditPage() {
  const [adminId, setAdminId] = useState('')
  const [actionType, setActionType] = useState('')
  const [entityType, setEntityType] = useState('')
  const [entityId, setEntityId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC')
  const [preset, setPreset] = useState('ALL')
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null)

  const params = useMemo(() => {
    const parsedFrom = from ? new Date(from).toISOString() : undefined
    const parsedTo = to ? new Date(to).toISOString() : undefined
    return {
      adminId: adminId || undefined,
      actionType: actionType || undefined,
      entityType: entityType || undefined,
      entityId: entityId || undefined,
      from: parsedFrom,
      to: parsedTo,
      sortDir,
      page,
      size: 20,
    }
  }, [adminId, actionType, entityType, entityId, from, to, page, sortDir])

  const exportParams = useMemo(() => {
    const parsedFrom = from ? new Date(from).toISOString() : undefined
    const parsedTo = to ? new Date(to).toISOString() : undefined
    return {
      adminId: adminId || undefined,
      actionType: actionType || undefined,
      entityType: entityType || undefined,
      entityId: entityId || undefined,
      from: parsedFrom,
      to: parsedTo,
      sortDir,
    }
  }, [adminId, actionType, entityType, entityId, from, to, sortDir])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit', params],
    queryFn: () => adminAuditService.list(params),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1

  const handleExport = async () => {
    const blob = await adminAuditService.exportCsv(exportParams)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'audit-logs.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <DashboardPageShell
        title="Audit Log"
        subtitle="Trace critical admin actions."
        eyebrow="Monitoring"
      >
      <div className="table-shell grid gap-4 p-6 md:grid-cols-6">
        <select
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          value={preset}
          onChange={(event) => {
            const value = event.target.value
            setPreset(value)
            if (value === 'ALL') {
              setFrom('')
              setTo('')
              return
            }
            const now = new Date()
            const start = new Date()
            if (value === '24H') {
              start.setHours(now.getHours() - 24)
            } else if (value === '7D') {
              start.setDate(now.getDate() - 7)
            } else if (value === '30D') {
              start.setDate(now.getDate() - 30)
            }
            setFrom(start.toISOString().slice(0, 16))
            setTo(now.toISOString().slice(0, 16))
          }}
        >
          <option value="ALL">All time</option>
          <option value="24H">Last 24 hours</option>
          <option value="7D">Last 7 days</option>
          <option value="30D">Last 30 days</option>
        </select>
        <input
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          placeholder="Admin ID"
          value={adminId}
          onChange={(event) => setAdminId(event.target.value)}
        />
        <select
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          value={actionType}
          onChange={(event) => setActionType(event.target.value)}
        >
          <option value="">All Actions</option>
          <option value="USER_SUSPENDED">USER_SUSPENDED</option>
          <option value="USER_ACTIVATED">USER_ACTIVATED</option>
          <option value="CAMPAIGN_APPROVED">CAMPAIGN_APPROVED</option>
          <option value="CAMPAIGN_REJECTED">CAMPAIGN_REJECTED</option>
          <option value="KYC_APPROVED">KYC_APPROVED</option>
          <option value="KYC_REJECTED">KYC_REJECTED</option>
          <option value="DISPUTE_RESOLVED">DISPUTE_RESOLVED</option>
          <option value="PAYMENT_PROCESSED">PAYMENT_PROCESSED</option>
          <option value="SYSTEM_UPDATE">SYSTEM_UPDATE</option>
        </select>
        <input
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          placeholder="Entity type"
          value={entityType}
          onChange={(event) => setEntityType(event.target.value)}
        />
        <input
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          placeholder="Entity ID"
          value={entityId}
          onChange={(event) => setEntityId(event.target.value)}
        />
        <input
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          type="datetime-local"
          value={from}
          onChange={(event) => setFrom(event.target.value)}
        />
        <input
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          type="datetime-local"
          value={to}
          onChange={(event) => setTo(event.target.value)}
        />
        <select
          className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
          value={sortDir}
          onChange={(event) => setSortDir(event.target.value as 'ASC' | 'DESC')}
        >
          <option value="DESC">Newest first</option>
          <option value="ASC">Oldest first</option>
        </select>
        <div className="md:col-span-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
              onClick={handleExport}
            >
              Export CSV
            </button>
            <button
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => {
                setAdminId('')
                setActionType('')
                setEntityType('')
                setEntityId('')
                setFrom('')
                setTo('')
                setPreset('ALL')
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      </div>

      <div className="table-shell p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Admin</th>
                <th className="py-2 pr-4">Action</th>
                <th className="py-2 pr-4">Entity</th>
                <th className="py-2 pr-4">Time</th>
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
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          View
                        </button>
                        {entry.entityType && entry.entityId ? (
                          <button
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                            onClick={() => {
                              setEntityType(entry.entityType)
                              setEntityId(entry.entityId)
                            }}
                          >
                            Filter by entity
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No audit logs available.
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
        open={!!selectedEntry}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEntry(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Audit entry</DialogTitle>
            <DialogDescription>Full details for this action.</DialogDescription>
          </DialogHeader>
          {selectedEntry ? (
            <div className="space-y-4 text-sm text-slate-600">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-slate-400">Admin</p>
                  <p className="text-sm text-slate-700">{selectedEntry.adminEmail}</p>
                  <p className="text-xs text-slate-500">ID: {selectedEntry.adminId}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Action</p>
                  <p className="text-sm text-slate-700">{selectedEntry.actionType}</p>
                  <p className="text-xs text-slate-500">
                    {selectedEntry.createdAt ? new Date(selectedEntry.createdAt).toLocaleString() : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Entity</p>
                  <p className="text-sm text-slate-700">{selectedEntry.entityType || '—'}</p>
                  <p className="text-xs text-slate-500">{selectedEntry.entityId || '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Metadata</p>
                  <p className="text-xs text-slate-500">IP: {selectedEntry.ipAddress || '—'}</p>
                  <p className="text-xs text-slate-500">Agent: {selectedEntry.userAgent || '—'}</p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <p className="text-[10px] uppercase text-slate-400">Details</p>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-600">
{JSON.stringify(selectedEntry.details || {}, null, 2)}
                </pre>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <button
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => setSelectedEntry(null)}
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

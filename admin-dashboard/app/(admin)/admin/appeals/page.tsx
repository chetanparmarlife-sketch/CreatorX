'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminUserService } from '@/lib/api/admin/users'
import { AppealStatus } from '@/lib/types'
import { Pagination } from '@/components/shared/pagination'
import { ToastStack } from '@/components/shared/toast'
import { useToast } from '@/lib/hooks/useToast'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const appealStatuses = Object.values(AppealStatus)

export default function AdminAppealsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC')
  const [selectedAppealId, setSelectedAppealId] = useState<string | null>(null)
  const [nextStatus, setNextStatus] = useState<AppealStatus | null>(null)
  const [resolutionNote, setResolutionNote] = useState('')
  const { toasts, pushToast, dismissToast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-appeals', page, sortDir],
    queryFn: () => adminUserService.listAppeals({ page, size: 20, sortDir }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1

  const resolveMutation = useMutation({
    mutationFn: ({ appealId, status, resolution }: { appealId: string; status: AppealStatus; resolution?: string }) =>
      adminUserService.resolveAppeal(appealId, status, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appeals'] })
      pushToast('Appeal updated', 'success')
    },
    onError: () => pushToast('Appeal update failed', 'error'),
  })

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <DashboardPageShell
        title="Account Appeals"
        subtitle="Review and resolve suspension appeals."
        eyebrow="User Management"
      >
      <div className="table-shell p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">Appeals queue</div>
          <select
            className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
            value={sortDir}
            onChange={(event) => setSortDir(event.target.value as 'ASC' | 'DESC')}
          >
            <option value="DESC">Newest first</option>
            <option value="ASC">Oldest first</option>
          </select>
        </div>
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
                            setSelectedAppealId(appeal.id)
                            setNextStatus(status)
                            setResolutionNote('')
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
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
      </DashboardPageShell>

      <Dialog
        open={!!selectedAppealId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAppealId(null)
            setNextStatus(null)
            setResolutionNote('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve appeal</DialogTitle>
            <DialogDescription>Add resolution notes for this appeal.</DialogDescription>
          </DialogHeader>
          <textarea
            className="h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={resolutionNote}
            onChange={(event) => setResolutionNote(event.target.value)}
            placeholder="Resolution notes"
          />
          <DialogFooter>
            <button
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => setSelectedAppealId(null)}
            >
              Cancel
            </button>
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
              onClick={() => {
                if (selectedAppealId && nextStatus) {
                  resolveMutation.mutate({
                    appealId: selectedAppealId,
                    status: nextStatus,
                    resolution: resolutionNote || undefined,
                  })
                  setSelectedAppealId(null)
                }
              }}
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

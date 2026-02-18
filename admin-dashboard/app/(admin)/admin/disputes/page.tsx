'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminDisputeService } from '@/lib/api/admin/disputes'
import { Pagination } from '@/components/shared/pagination'
import { ToastStack } from '@/components/shared/toast'
import { useToast } from '@/lib/hooks/useToast'
import { useAuthStore } from '@/lib/store/auth-store'
import { ActionBar } from '@/components/shared/action-bar'
import { ContextPanel } from '@/components/shared/context-panel'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusChip } from '@/components/shared/status-chip'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function AdminDisputesPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [page, setPage] = useState(0)
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC')
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null)
  const [previewDispute, setPreviewDispute] = useState<any | null>(null)
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [nextAction, setNextAction] = useState('Review dispute')
  const [nextStatus, setNextStatus] = useState<string>('RESOLVED')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [resolutionType, setResolutionType] = useState('NONE')
  const [actionAmount, setActionAmount] = useState('')
  const [confirmFinancialAction, setConfirmFinancialAction] = useState(false)
  const { toasts, pushToast, dismissToast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-disputes', page, sortDir],
    queryFn: () => adminDisputeService.list({ page, size: 20, sortDir }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1
  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  )
  const getAgeHours = (createdAt?: string) => {
    if (!createdAt) return null
    const created = new Date(createdAt)
    if (Number.isNaN(created.getTime())) return null
    const diffMs = Date.now() - created.getTime()
    return diffMs / (1000 * 60 * 60)
  }
  const getAgeLabel = (createdAt?: string) => {
    const age = getAgeHours(createdAt)
    if (age === null) return '—'
    if (age < 1) return '<1h'
    if (age < 24) return `${Math.round(age)}h`
    return `${Math.round(age / 24)}d`
  }
  const getSlaBadge = (dueAt?: string) => {
    if (!dueAt) return { label: 'Unknown', className: 'bg-slate-100 text-slate-600' }
    const due = new Date(dueAt)
    if (Number.isNaN(due.getTime())) {
      return { label: 'Unknown', className: 'bg-slate-100 text-slate-600' }
    }
    if (Date.now() > due.getTime()) {
      return { label: 'Breached', className: 'bg-rose-100 text-rose-700' }
    }
    const hoursLeft = (due.getTime() - Date.now()) / (1000 * 60 * 60)
    if (hoursLeft <= 6) {
      return { label: 'Due Soon', className: 'bg-amber-100 text-amber-700' }
    }
    return { label: 'On Track', className: 'bg-emerald-100 text-emerald-700' }
  }

  const resolveMutation = useMutation({
    mutationFn: ({
      disputeId,
      status,
      resolution,
      resolutionType: nextResolutionType,
      actionAmount: nextActionAmount,
    }: {
      disputeId: string
      status: string
      resolution?: string
      resolutionType?: string
      actionAmount?: number
    }) => adminDisputeService.resolve(disputeId, status, resolution, nextResolutionType, nextActionAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] })
      pushToast('Dispute updated', 'success')
    },
    onError: () => pushToast('Dispute update failed', 'error'),
  })

  const assignMutation = useMutation({
    mutationFn: ({ disputeId, adminId, nextAction: action }: { disputeId: string; adminId?: string; nextAction?: string }) =>
      adminDisputeService.assign(disputeId, adminId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] })
      pushToast('Dispute assigned', 'success')
    },
    onError: () => pushToast('Assignment failed', 'error'),
  })

  const bulkAssign = async () => {
    const adminId = user?.id
    if (!adminId) return
    const ids = Object.keys(selected).filter((key) => selected[key])
    await Promise.all(ids.map((id) => adminDisputeService.assign(id, adminId, nextAction || undefined)))
    setSelected({})
    queryClient.invalidateQueries({ queryKey: ['admin-disputes'] })
    pushToast('Assigned selected disputes', 'success')
  }

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <DashboardPageShell
        title="Disputes"
        subtitle="Resolve creator and brand disputes."
        eyebrow="Work Queue"
      >
      <div className="table-shell p-6">
        <ActionBar
          title="Open disputes"
          description="Assign and resolve disputes before SLA breach."
        >
          <select
            className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
            value={sortDir}
            onChange={(event) => setSortDir(event.target.value as 'ASC' | 'DESC')}
          >
            <option value="DESC">Newest first</option>
            <option value="ASC">Oldest first</option>
          </select>
          <input
            className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
            placeholder="Next action"
            value={nextAction}
            onChange={(event) => setNextAction(event.target.value)}
          />
          <button
            className="h-9 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white"
            disabled={!selectedCount}
            onClick={bulkAssign}
          >
            Assign to me
          </button>
        </ActionBar>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="overflow-x-auto">
            <table className="table-compact w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">
                  <input
                    type="checkbox"
                    checked={selectedCount === items.length && items.length > 0}
                    onChange={(event) => {
                      const next: Record<string, boolean> = {}
                      items.forEach((item: any) => {
                        next[item.id] = event.target.checked
                      })
                      setSelected(next)
                    }}
                  />
                </th>
                <th className="py-2 pr-4">Parties</th>
                <th className="py-2 pr-4">Campaign</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Age</th>
                <th className="py-2 pr-4">Owner / Next</th>
                <th className="py-2 pr-4">SLA</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((dispute: any) => (
                  <tr
                    key={dispute.id}
                    className={`border-t border-slate-100 cursor-pointer ${previewDispute?.id === dispute.id ? 'bg-slate-50' : ''}`}
                    onClick={() => setPreviewDispute(dispute)}
                  >
                    <td className="py-3 pr-4">
                      <input
                        type="checkbox"
                        checked={!!selected[dispute.id]}
                        onChange={(event) =>
                          setSelected((prev) => ({ ...prev, [dispute.id]: event.target.checked }))
                        }
                        onClick={(event) => event.stopPropagation()}
                      />
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{dispute.creatorEmail}</p>
                      <p className="text-xs text-slate-500">{dispute.brandEmail}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{dispute.campaignTitle || '—'}</p>
                    </td>
                    <td className="py-3 pr-4">{dispute.type}</td>
                    <td className="py-3 pr-4">
                      <StatusChip
                        tone={dispute.status === 'RESOLVED' || dispute.status === 'CLOSED' ? 'approved' : dispute.status === 'IN_REVIEW' ? 'needs_action' : 'pending'}
                        size="compact"
                      >
                        {dispute.status}
                      </StatusChip>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-sm text-slate-700">{getAgeLabel(dispute.createdAt)}</p>
                      <p className="text-xs text-slate-500">
                        {dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString() : '—'}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs text-slate-500">
                        {dispute.assignedAdminId ? `Owner: ${dispute.assignedAdminId}` : 'Unassigned'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {dispute.nextAction ? `Next: ${dispute.nextAction}` : 'Next: —'}
                      </p>
                    </td>
                    <td className="py-3 pr-4">
                      {(() => {
                        const badge = getSlaBadge(dispute.slaResolutionDueAt)
                        return (
                          <StatusChip
                            tone={badge.label === 'Breached' ? 'blocked' : badge.label === 'Due Soon' ? 'needs_action' : 'approved'}
                            size="compact"
                          >
                            {badge.label}
                          </StatusChip>
                        )
                      })()}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Link
                          className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                          href={`/admin/disputes/${dispute.id}`}
                          onClick={(event) => event.stopPropagation()}
                        >
                          View
                        </Link>
                        <button
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedDisputeId(dispute.id)
                            setNextStatus(dispute.status || 'RESOLVED')
                            setResolutionNotes('')
                            setResolutionType('NONE')
                            setActionAmount('')
                            setConfirmFinancialAction(false)
                          }}
                        >
                          Resolve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-6">
                    <EmptyState
                      title="No disputes found"
                      description="Disputes will show up when a creator or brand opens a ticket."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>

          <aside className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Inline preview</p>
              <p className="text-xs text-slate-500">View details and take action without leaving the queue.</p>
            </div>
            {previewDispute ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <ContextPanel title="Parties" description={previewDispute.creatorEmail}>
                  Brand: {previewDispute.brandEmail}
                </ContextPanel>
                <ContextPanel title="Campaign" description={previewDispute.campaignTitle || '—'} />
                <ContextPanel title="Next action" description={previewDispute.nextAction || '—'} tone="warning" />
                <div className="flex flex-wrap gap-2">
                  <button
                    className="h-9 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white"
                    onClick={() =>
                      assignMutation.mutate({
                        disputeId: previewDispute.id,
                        adminId: user?.id,
                        nextAction: nextAction || undefined,
                      })
                    }
                  >
                    Assign to me
                  </button>
                  <button
                    className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700"
                    onClick={() => {
                      setSelectedDisputeId(previewDispute.id)
                      setNextStatus(previewDispute.status || 'RESOLVED')
                      setResolutionNotes('')
                      setResolutionType('NONE')
                      setActionAmount('')
                      setConfirmFinancialAction(false)
                    }}
                  >
                    Resolve
                  </button>
                  <Link
                    className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 inline-flex items-center"
                    href={`/admin/disputes/${previewDispute.id}`}
                  >
                    Open detail
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No selection"
                description="Pick a dispute to preview the case."
              />
            )}
          </aside>
        </div>
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
      </DashboardPageShell>

      <Dialog
        open={!!selectedDisputeId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDisputeId(null)
            setResolutionNotes('')
            setResolutionType('NONE')
            setActionAmount('')
            setConfirmFinancialAction(false)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve dispute</DialogTitle>
            <DialogDescription>Update dispute status and add resolution notes.</DialogDescription>
          </DialogHeader>
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={nextStatus}
            onChange={(event) => setNextStatus(event.target.value)}
          >
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="IN_REVIEW">IN_REVIEW</option>
          </select>
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={resolutionType}
            onChange={(event) => {
              setResolutionType(event.target.value)
              setConfirmFinancialAction(false)
            }}
          >
            <option value="NONE">No financial action</option>
            <option value="REFUND">Refund brand</option>
            <option value="PENALTY">Penalty creator</option>
          </select>
          {(resolutionType === 'REFUND' || resolutionType === 'PENALTY') && (
            <>
              <input
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
                type="number"
                min="0"
                step="0.01"
                value={actionAmount}
                onChange={(event) => setActionAmount(event.target.value)}
                placeholder="Action amount"
              />
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-200"
                  checked={confirmFinancialAction}
                  onChange={(event) => setConfirmFinancialAction(event.target.checked)}
                />
                Confirm financial action for this dispute.
              </label>
            </>
          )}
          <textarea
            className="h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={resolutionNotes}
            onChange={(event) => setResolutionNotes(event.target.value)}
            placeholder="Resolution notes"
          />
          <DialogFooter>
            <button
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => setSelectedDisputeId(null)}
            >
              Cancel
            </button>
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
              disabled={
                (resolutionType === 'REFUND' || resolutionType === 'PENALTY') &&
                (!confirmFinancialAction || Number(actionAmount) <= 0)
              }
              onClick={() => {
                if (selectedDisputeId) {
                  resolveMutation.mutate({
                    disputeId: selectedDisputeId,
                    status: nextStatus,
                    resolution: resolutionNotes || undefined,
                    resolutionType: resolutionType === 'NONE' ? undefined : resolutionType,
                    actionAmount:
                      resolutionType === 'REFUND' || resolutionType === 'PENALTY'
                        ? Number(actionAmount)
                        : undefined,
                  })
                  setSelectedDisputeId(null)
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

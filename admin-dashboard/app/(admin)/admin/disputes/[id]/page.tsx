'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { adminDisputeService } from '@/lib/api/admin/disputes'
import { useAuthStore } from '@/lib/store/auth-store'
import { ToastStack } from '@/components/shared/toast'
import { useToast } from '@/lib/hooks/useToast'
import { ContextPanel } from '@/components/shared/context-panel'
import { StatusChip } from '@/components/shared/status-chip'

export default function AdminDisputeDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const disputeId = params?.id
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { toasts, pushToast, dismissToast } = useToast()

  const { data: dispute, isLoading } = useQuery({
    queryKey: ['admin-dispute', disputeId],
    queryFn: () => adminDisputeService.getById(disputeId),
    enabled: !!disputeId,
  })

  const { data: evidence = [] } = useQuery({
    queryKey: ['admin-dispute-evidence', disputeId],
    queryFn: () => adminDisputeService.listEvidence(disputeId),
    enabled: !!disputeId,
  })

  const { data: notes = [] } = useQuery({
    queryKey: ['admin-dispute-notes', disputeId],
    queryFn: () => adminDisputeService.listNotes(disputeId),
    enabled: !!disputeId,
  })

  const [assignAdminId, setAssignAdminId] = useState('')
  const [nextAction, setNextAction] = useState('')
  const [resolutionStatus, setResolutionStatus] = useState('RESOLVED')
  const [resolutionType, setResolutionType] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [actionAmount, setActionAmount] = useState('')
  const [confirmFinancialAction, setConfirmFinancialAction] = useState(false)
  const [internalNote, setInternalNote] = useState('')

  const assignMutation = useMutation({
    mutationFn: () =>
      adminDisputeService.assign(disputeId, assignAdminId || undefined, nextAction || undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-dispute', disputeId] }),
  })

  const resolveMutation = useMutation({
    mutationFn: () => {
      const normalizedResolutionType = resolutionType.trim().toUpperCase()
      return adminDisputeService.resolve(
        disputeId,
        resolutionStatus,
        resolutionNotes || undefined,
        normalizedResolutionType || undefined,
        normalizedResolutionType && (normalizedResolutionType === 'REFUND' || normalizedResolutionType === 'PENALTY')
          ? Number(actionAmount)
          : undefined
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-dispute', disputeId] })
      pushToast('Dispute resolved', 'success')
      router.push('/admin/disputes')
    },
    onError: () => pushToast('Failed to resolve dispute', 'error'),
  })

  const noteMutation = useMutation({
    mutationFn: () => adminDisputeService.addNote(disputeId, internalNote),
    onSuccess: () => {
      setInternalNote('')
      queryClient.invalidateQueries({ queryKey: ['admin-dispute-notes', disputeId] })
    },
  })

  const slaSummary = useMemo(() => {
    if (!dispute) return []
    return [
      { label: 'First response due', value: dispute.slaFirstResponseDueAt },
      { label: 'Resolution due', value: dispute.slaResolutionDueAt },
    ]
  }, [dispute])
  const normalizedResolutionType = resolutionType.trim().toUpperCase()
  const keyFacts = useMemo(() => {
    if (!dispute) return []
    return [
      { label: 'Dispute ID', value: dispute.id },
      { label: 'Status', value: dispute.status },
      { label: 'Type', value: dispute.type },
      { label: 'Campaign', value: dispute.campaignTitle || '—' },
      { label: 'Assignee', value: dispute.assignedAdminId || 'Unassigned' },
      { label: 'Next action', value: dispute.nextAction || '—' },
      { label: 'Resolution type', value: dispute.resolutionType || '—' },
      { label: 'Evidence', value: dispute.evidence?.length ? `${dispute.evidence.length} file(s)` : 'None' },
    ]
  }, [dispute])
  const timeline = useMemo(() => {
    if (!dispute) return []
    return [
      { label: 'Created', value: dispute.createdAt, tone: 'info' },
      { label: 'Assigned', value: dispute.assignedAdminId ? dispute.createdAt : null, tone: 'needs_action' },
      { label: 'Resolved', value: dispute.resolvedAt, tone: 'approved' },
    ]
  }, [dispute])

  if (isLoading || !dispute) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Loading dispute...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Dispute Detail</p>
          <h1 className="text-3xl font-semibold text-slate-900">{dispute.campaignTitle || 'Dispute'}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-slate-500">{dispute.type}</p>
            <StatusChip
              tone={dispute.status === 'RESOLVED' || dispute.status === 'CLOSED' ? 'approved' : dispute.status === 'IN_REVIEW' ? 'needs_action' : 'pending'}
              size="compact"
            >
              {dispute.status}
            </StatusChip>
          </div>
        </div>
        <Link className="text-sm font-semibold text-slate-600 hover:text-slate-900" href="/admin/disputes">
          Back to disputes
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Parties</h2>
            <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-700">
              <div>
                <p className="text-xs uppercase text-slate-400">Creator</p>
                <p>{dispute.creatorEmail}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-400">Brand</p>
                <p>{dispute.brandEmail}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Key Facts</h2>
            <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2">
              {keyFacts.map((fact) => (
                <ContextPanel key={fact.label} title={fact.label} description={String(fact.value)} />
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Description</h2>
            <p className="text-sm text-slate-700 whitespace-pre-line">{dispute.description}</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
            <div className="space-y-3 text-sm">
              {timeline.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <div>
                    <p className="text-xs uppercase text-slate-400">{item.label}</p>
                    <p className="text-sm text-slate-700">
                      {item.value ? new Date(item.value).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Internal Notes</h2>
            <div className="space-y-3">
              <textarea
                className="w-full rounded-lg border border-slate-200 p-3 text-sm"
                rows={3}
                placeholder="Add an internal note..."
                value={internalNote}
                onChange={(event) => setInternalNote(event.target.value)}
              />
              <button
                className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
                onClick={() => noteMutation.mutate()}
                disabled={!internalNote.trim()}
              >
                Add Note
              </button>
            </div>
            {notes.length ? (
              <div className="space-y-3 text-sm">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-slate-100 p-3">
                    <p className="font-medium text-slate-900">{note.adminEmail}</p>
                    <p className="text-xs text-slate-500">
                      {note.createdAt ? new Date(note.createdAt).toLocaleString() : '—'}
                    </p>
                    <p className="text-sm text-slate-700 mt-2">{note.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No internal notes yet.</p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-sm">
            <h2 className="text-lg font-semibold text-slate-900">Evidence</h2>
            {evidence.length ? (
              <div className="space-y-3">
                {evidence.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{item.fileType || 'File'}</p>
                        <p className="text-xs text-slate-500">{item.notes || 'No notes'}</p>
                      </div>
                      <a
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No evidence uploaded.</p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 text-sm">
            <h2 className="text-lg font-semibold text-slate-900">Assignment</h2>
            <p className="text-xs text-slate-500">
              Current assignee: {dispute.assignedAdminId || user?.userId || 'Unassigned'}
            </p>
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              placeholder="Admin ID (optional)"
              value={assignAdminId}
              onChange={(event) => setAssignAdminId(event.target.value)}
            />
            <input
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              placeholder="Next action"
              value={nextAction}
              onChange={(event) => setNextAction(event.target.value)}
            />
            <button
              className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white"
              onClick={() => assignMutation.mutate()}
            >
              Assign
            </button>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 text-sm">
            <h2 className="text-lg font-semibold text-slate-900">Resolution Actions</h2>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              Templates:
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
                  onClick={() => {
                    setResolutionStatus('RESOLVED')
                    setResolutionType('REFUND')
                    setResolutionNotes('Refund approved due to dispute resolution.')
                  }}
                >
                  Refund brand
                </button>
                <button
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
                  onClick={() => {
                    setResolutionStatus('RESOLVED')
                    setResolutionType('PENALTY')
                    setResolutionNotes('Penalty applied due to dispute resolution.')
                  }}
                >
                  Penalty creator
                </button>
                <button
                  className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600"
                  onClick={() => {
                    setResolutionStatus('CLOSED')
                    setResolutionType('NONE')
                    setResolutionNotes('Closed with no financial action.')
                  }}
                >
                  Close with no action
                </button>
              </div>
            </div>
            <select
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={resolutionStatus}
              onChange={(event) => setResolutionStatus(event.target.value)}
            >
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="IN_REVIEW">IN_REVIEW</option>
            </select>
            <select
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
              value={resolutionType}
              onChange={(event) => {
                setResolutionType(event.target.value)
                setConfirmFinancialAction(false)
              }}
            >
              <option value="NONE">No financial action</option>
              <option value="REFUND">Refund brand</option>
              <option value="PENALTY">Penalty creator</option>
              <option value="OTHER">Other</option>
            </select>
            {(normalizedResolutionType === 'REFUND' || normalizedResolutionType === 'PENALTY') && (
              <>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Action amount"
                  value={actionAmount}
                  onChange={(event) => setActionAmount(event.target.value)}
                />
                <label className="flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-200"
                    checked={confirmFinancialAction}
                    onChange={(event) => setConfirmFinancialAction(event.target.checked)}
                  />
                  Confirm this financial action will update wallets.
                </label>
              </>
            )}
            <textarea
              className="w-full rounded-lg border border-slate-200 p-3 text-sm"
              rows={3}
              placeholder="Resolution notes"
              value={resolutionNotes}
              onChange={(event) => setResolutionNotes(event.target.value)}
            />
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
              disabled={
                (normalizedResolutionType === 'REFUND' || normalizedResolutionType === 'PENALTY') &&
                (!confirmFinancialAction || Number(actionAmount) <= 0)
              }
              onClick={() => resolveMutation.mutate()}
            >
              Submit Resolution
            </button>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3 text-sm">
            <h2 className="text-lg font-semibold text-slate-900">SLA</h2>
            {slaSummary.map((item) => (
              <div key={item.label}>
                <p className="text-xs uppercase text-slate-400">{item.label}</p>
                <p className="text-sm text-slate-700">
                  {item.value ? new Date(item.value).toLocaleString() : '—'}
                </p>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </div>
  )
}

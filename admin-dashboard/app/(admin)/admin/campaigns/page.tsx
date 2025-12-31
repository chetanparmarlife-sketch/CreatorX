'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminModerationService } from '@/lib/api/admin/moderation'
import { CampaignFlagStatus } from '@/lib/types'
import { Pagination } from '@/components/shared/pagination'
import { ToastStack } from '@/components/shared/toast'
import { useToast } from '@/lib/hooks/useToast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const flagStatuses = Object.values(CampaignFlagStatus)
const policyReasons = [
  'Prohibited content',
  'Fraud or scam',
  'IP infringement',
  'Misleading claims',
  'Adult or sensitive content',
  'Spam or low quality',
  'Other',
]

export default function AdminCampaignFlagsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC')
  const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null)
  const [nextStatus, setNextStatus] = useState<CampaignFlagStatus | null>(null)
  const [removeCampaign, setRemoveCampaign] = useState(false)
  const [policyReason, setPolicyReason] = useState('')
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [previewFlag, setPreviewFlag] = useState<any | null>(null)
  const { toasts, pushToast, dismissToast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-campaign-flags', page, sortDir],
    queryFn: () => adminModerationService.listFlags({ page, size: 20, sortDir }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1
  const severityBadge = (severity?: string) => {
    if (!severity) return { label: '—', className: 'bg-slate-100 text-slate-600' }
    const normalized = severity.toUpperCase()
    if (normalized === 'CRITICAL') return { label: 'Critical', className: 'bg-rose-100 text-rose-700' }
    if (normalized === 'HIGH') return { label: 'High', className: 'bg-amber-100 text-amber-700' }
    if (normalized === 'MEDIUM') return { label: 'Medium', className: 'bg-sky-100 text-sky-700' }
    return { label: 'Low', className: 'bg-emerald-100 text-emerald-700' }
  }
  const confidenceLabel = (flag: any) => (flag.ruleId ? 'Auto' : 'Manual')
  const selectedFlag = useMemo(
    () => items.find((flag: any) => flag.id === selectedFlagId) || null,
    [items, selectedFlagId]
  )

  const resolveMutation = useMutation({
    mutationFn: ({ flagId, status, removeCampaign }: { flagId: string; status: CampaignFlagStatus; removeCampaign: boolean }) => {
      const trimmedNotes = resolutionNotes.trim()
      const policy = policyReason || 'Other'
      const combinedNotes = trimmedNotes
        ? `Policy: ${policy}. Notes: ${trimmedNotes}`
        : `Policy: ${policy}.`
      return adminModerationService.resolveFlag(flagId, {
        status,
        removeCampaign,
        notes: combinedNotes,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaign-flags'] })
      pushToast('Flag resolved', 'success')
    },
    onError: () => pushToast('Failed to resolve flag', 'error'),
  })

  return (
    <div className="space-y-6">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Campaign Flags</h1>
        <p className="text-slate-500">Review flagged campaigns and apply enforcement actions.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">Open flags</div>
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
                <th className="py-2 pr-4">Campaign</th>
                <th className="py-2 pr-4">Rule</th>
                <th className="py-2 pr-4">Severity</th>
                <th className="py-2 pr-4">Confidence</th>
                <th className="py-2 pr-4">Reason</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((flag: any) => (
                  <tr key={flag.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{flag.campaignTitle}</p>
                      <p className="text-xs text-slate-500">{flag.campaignId}</p>
                      <button
                        className="mt-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                        onClick={() => setPreviewFlag(flag)}
                      >
                        Preview
                      </button>
                    </td>
                    <td className="py-3 pr-4">{flag.ruleName || 'Manual'}</td>
                    <td className="py-3 pr-4">
                      {(() => {
                        const badge = severityBadge(flag.ruleSeverity)
                        return (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
                            {badge.label}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs font-semibold text-slate-600">{confidenceLabel(flag)}</span>
                    </td>
                    <td className="py-3 pr-4 max-w-sm text-slate-600">{flag.reason}</td>
                    <td className="py-3 pr-4">{flag.status}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <select
                          className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
                          defaultValue={flag.status}
                          onChange={(event) => {
                            const status = event.target.value as CampaignFlagStatus
                            setSelectedFlagId(flag.id)
                            setNextStatus(status)
                            setRemoveCampaign(false)
                            setPolicyReason('')
                            setResolutionNotes('')
                          }}
                        >
                          {flagStatuses.map((status) => (
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
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No campaign flags found.
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

      <Dialog
        open={!!selectedFlagId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedFlagId(null)
            setNextStatus(null)
            setRemoveCampaign(false)
            setPolicyReason('')
            setResolutionNotes('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve campaign flag</DialogTitle>
            <DialogDescription>Confirm resolution action and add notes.</DialogDescription>
          </DialogHeader>
          {selectedFlag ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">{selectedFlag.campaignTitle}</p>
              <p className="text-slate-500">Flagged for: {selectedFlag.reason}</p>
              <p className="text-slate-500">Rule: {selectedFlag.ruleName || 'Manual'} · {confidenceLabel(selectedFlag)}</p>
            </div>
          ) : null}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500">Policy reason</label>
            <select
              className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
              value={policyReason}
              onChange={(event) => setPolicyReason(event.target.value)}
            >
              <option value="">Select policy reason</option>
              {policyReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>
          <textarea
            className="h-24 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={resolutionNotes}
            onChange={(event) => setResolutionNotes(event.target.value)}
            placeholder="Resolution notes"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={removeCampaign}
              onChange={(event) => setRemoveCampaign(event.target.checked)}
            />
            Remove campaign from listings
          </label>
          <DialogFooter>
            <button
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => setSelectedFlagId(null)}
            >
              Cancel
            </button>
            <button
              className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white"
              onClick={() => {
                if (selectedFlagId && nextStatus) {
                  if (!policyReason) {
                    pushToast('Select a policy reason', 'error')
                    return
                  }
                  resolveMutation.mutate({ flagId: selectedFlagId, status: nextStatus, removeCampaign })
                  setSelectedFlagId(null)
                }
              }}
            >
              Resolve
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!previewFlag}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewFlag(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Campaign preview</DialogTitle>
            <DialogDescription>Quick context for moderation decisions.</DialogDescription>
          </DialogHeader>
          {previewFlag ? (
            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <p className="font-semibold text-slate-900">{previewFlag.campaignTitle}</p>
                <p className="text-xs text-slate-500">Campaign ID: {previewFlag.campaignId}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-900">Flag reason</p>
                <p className="text-slate-500">{previewFlag.reason}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(() => {
                  const badge = severityBadge(previewFlag.ruleSeverity)
                  return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                  )
                })()}
                <span className="text-xs text-slate-500">{confidenceLabel(previewFlag)} flag</span>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <button
              className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700"
              onClick={() => setPreviewFlag(null)}
            >
              Close
            </button>
            {previewFlag ? (
              <Link
                className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white flex items-center"
                href={`/admin/campaign-reviews/${previewFlag.campaignId}`}
              >
                Review campaign
              </Link>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

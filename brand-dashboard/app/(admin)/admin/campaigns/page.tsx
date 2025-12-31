'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminModerationService } from '@/lib/api/admin/moderation'
import { CampaignFlagStatus } from '@/lib/types'

const flagStatuses = Object.values(CampaignFlagStatus)

export default function AdminCampaignFlagsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<CampaignFlagStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-campaign-flags'],
    queryFn: () => adminModerationService.listFlags({ page: 0, size: 50 }),
  })

  const items = (data as any)?.items ?? (data as any)?.content ?? []

  const filteredItems = useMemo(() => {
    return items.filter((flag: any) => {
      const matchesStatus = statusFilter === 'ALL' || flag.status === statusFilter
      const matchesSearch =
        !search ||
        flag.campaignTitle?.toLowerCase().includes(search.toLowerCase()) ||
        flag.campaignId?.toLowerCase().includes(search.toLowerCase()) ||
        flag.reason?.toLowerCase().includes(search.toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [items, search, statusFilter])

  const resolveMutation = useMutation({
    mutationFn: ({ flagId, status, removeCampaign }: { flagId: string; status: CampaignFlagStatus; removeCampaign: boolean }) =>
      adminModerationService.resolveFlag(flagId, { status, removeCampaign }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-campaign-flags'] }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Campaign Flags</h1>
        <p className="text-slate-500">Review flagged campaigns and apply enforcement actions.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Open flags</p>
            <p className="text-xl font-semibold text-slate-900">
              {items.filter((flag: any) => flag.status === CampaignFlagStatus.OPEN).length}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              placeholder="Search campaign or reason"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="h-10 rounded-lg border border-slate-200 px-2 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as CampaignFlagStatus | 'ALL')}
            >
              <option value="ALL">All Status</option>
              {flagStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Campaign</th>
                <th className="py-2 pr-4">Rule</th>
                <th className="py-2 pr-4">Reason</th>
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
              ) : filteredItems.length ? (
                filteredItems.map((flag: any) => (
                  <tr key={flag.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">{flag.campaignTitle}</p>
                      <p className="text-xs text-slate-500">{flag.campaignId}</p>
                    </td>
                    <td className="py-3 pr-4">{flag.ruleName || 'Manual'}</td>
                    <td className="py-3 pr-4 max-w-sm text-slate-600">{flag.reason}</td>
                    <td className="py-3 pr-4">{flag.status}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <select
                          className="h-9 rounded-lg border border-slate-200 px-2 text-sm"
                          defaultValue={flag.status}
                          onChange={(event) => {
                            const status = event.target.value as CampaignFlagStatus
                            const removeCampaign = window.confirm('Remove campaign from listings?')
                            resolveMutation.mutate({ flagId: flag.id, status, removeCampaign })
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
      </div>
    </div>
  )
}

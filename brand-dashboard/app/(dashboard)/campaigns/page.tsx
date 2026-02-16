'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/shared/skeleton'
import { useCampaigns, useUpdateCampaign } from '@/lib/hooks/use-campaigns'
import { useCreateTemplateFromCampaign } from '@/lib/hooks/use-templates'
import { QueueToolbar } from '@/components/shared/queue-toolbar'
import { ContextPanel } from '@/components/shared/context-panel'
import { EmptyState } from '@/components/shared/empty-state'
import { ActionBar } from '@/components/shared/action-bar'
import { DashboardPageShell } from '@/components/shared/dashboard-page-shell'
import { Campaign, CampaignStatus, CampaignPlatform } from '@/lib/types'
import { FundingStatusBadge } from '@/components/campaigns/funding-status-badge'

const platformOptions = ['All', ...Object.values(CampaignPlatform)] as const

type LifecycleTab = {
  id: string
  label: string
  statuses: CampaignStatus[]
}

const lifecycleTabs: LifecycleTab[] = [
  { id: 'DRAFT', label: 'Draft', statuses: [CampaignStatus.DRAFT] },
  { id: 'OPEN', label: 'Open', statuses: [CampaignStatus.ACTIVE, CampaignStatus.PAUSED] },
  { id: 'IN_REVIEW', label: 'In Review', statuses: [CampaignStatus.PENDING_REVIEW] },
  { id: 'ACTIVE', label: 'Active', statuses: [CampaignStatus.ACTIVE] },
  { id: 'COMPLETED', label: 'Completed', statuses: [CampaignStatus.COMPLETED] },
]

const nextActionByStatus: Record<CampaignStatus, string> = {
  DRAFT: 'Submit for review',
  PENDING_REVIEW: 'Review in progress',
  ACTIVE: 'Review deliverables',
  PAUSED: 'Resume campaign',
  COMPLETED: 'Review performance',
  CANCELLED: 'Archive',
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

function StatusBadge({ status }: { status: CampaignStatus }) {
  const styles: Record<CampaignStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    PAUSED: 'bg-amber-100 text-amber-700',
    COMPLETED: 'bg-gray-100 text-gray-700',
    CANCELLED: 'bg-red-100 text-red-700',
    PENDING_REVIEW: 'bg-blue-100 text-blue-700',
    DRAFT: 'bg-slate-100 text-slate-600',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]
        }`}
    >
      {status}
    </span>
  )
}

export default function CampaignsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeLifecycleTab, setActiveLifecycleTab] = useState<(typeof lifecycleTabs)[number]['id']>('OPEN')
  const [platformFilter, setPlatformFilter] =
    useState<(typeof platformOptions)[number]>('All')
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([])
  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null)
  const [bulkResult, setBulkResult] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const updateCampaign = useUpdateCampaign()
  const createTemplate = useCreateTemplateFromCampaign()

  const { data, isLoading, error } = useCampaigns(
    {
      search: searchQuery || undefined,
      platform: platformFilter === 'All' ? undefined : platformFilter,
    },
    0
  )

  const campaigns = useMemo(() => data?.items ?? [], [data?.items])
  const lifecycleStatuses = useMemo<readonly CampaignStatus[]>(
    () => lifecycleTabs.find((tab) => tab.id === activeLifecycleTab)?.statuses ?? [],
    [activeLifecycleTab]
  )
  const filteredCampaigns = useMemo(
    () => campaigns.filter((campaign) => lifecycleStatuses.includes(campaign.status)),
    [campaigns, lifecycleStatuses]
  )
  const selectedCampaigns = useMemo(
    () => filteredCampaigns.filter((campaign) => selectedCampaignIds.includes(String(campaign.id))),
    [filteredCampaigns, selectedCampaignIds]
  )
  const allSelected = filteredCampaigns.length > 0 && selectedCampaignIds.length === filteredCampaigns.length
  const toggleSelection = (campaignId: string) => {
    setSelectedCampaignIds((prev) =>
      prev.includes(campaignId) ? prev.filter((id) => id !== campaignId) : [...prev, campaignId]
    )
  }
  const toggleSelectAll = () => {
    setSelectedCampaignIds(allSelected ? [] : filteredCampaigns.map((campaign) => String(campaign.id)))
  }

  const handleBulkSubmit = async () => {
    setBulkResult(null)
    const draftCampaigns = selectedCampaigns.filter((campaign) => campaign.status === CampaignStatus.DRAFT)
    if (draftCampaigns.length === 0) return
    const shouldContinue = window.confirm(
      `Submit ${draftCampaigns.length} draft campaign(s) for review?`
    )
    if (!shouldContinue) return

    let successCount = 0
    let failedCount = 0
    await Promise.all(
      draftCampaigns.map(async (campaign) => {
        try {
          await updateCampaign.mutateAsync({
            id: String(campaign.id),
            data: { status: CampaignStatus.PENDING_REVIEW },
          })
          successCount += 1
        } catch {
          failedCount += 1
        }
      )
    )
    setSelectedCampaignIds([])
    setBulkResult({
      tone: failedCount > 0 ? 'error' : 'success',
      message:
        failedCount > 0
          ? `Submitted ${successCount} draft(s), ${failedCount} failed.`
          : `Submitted ${successCount} draft(s) for review.`,
    })
  }

  const handleBulkTemplate = async () => {
    setBulkResult(null)
    const templateCampaigns = selectedCampaigns.filter((campaign) => campaign.status !== CampaignStatus.DRAFT)
    if (templateCampaigns.length === 0) return
    const shouldContinue = window.confirm(
      `Save ${templateCampaigns.length} campaign(s) as reusable templates?`
    )
    if (!shouldContinue) return

    let successCount = 0
    let failedCount = 0
    await Promise.all(
      templateCampaigns.map(async (campaign) => {
        try {
          await createTemplate.mutateAsync(String(campaign.id))
          successCount += 1
        } catch {
          failedCount += 1
        }
      })
    )
    setSelectedCampaignIds([])
    setBulkResult({
      tone: failedCount > 0 ? 'error' : 'success',
      message:
        failedCount > 0
          ? `Saved ${successCount} template(s), ${failedCount} failed.`
          : `Saved ${successCount} campaign template(s).`,
    })
  }

  return (
    <DashboardPageShell
      title="Campaigns"
      subtitle="Plan, launch, and optimize campaigns across each lifecycle stage."
      ctaLabel="Create Campaign"
      onCtaClick={() => router.push('/campaigns/new')}
      actionBar={
        <div className="space-y-3">
          <ActionBar
            title="Quick actions"
            description="Move campaigns faster with direct operation shortcuts."
          >
            <Button onClick={() => router.push('/campaigns/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New campaign
            </Button>
            <Button variant="outline" onClick={() => router.push('/deliverables')}>
              Review deliverables
            </Button>
            <Button variant="outline" onClick={() => router.push('/campaigns/templates')}>
              Templates
            </Button>
          </ActionBar>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-white border-gray-300 w-full"
              />
            </div>
            <Button variant="outline" onClick={() => router.push('/campaigns/templates')}>
              Manage Templates
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={platformFilter}
              onChange={(event) =>
                setPlatformFilter(event.target.value as typeof platformFilter)
              }
              className="h-11 rounded-lg border border-input bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {platformOptions.map((platform) => (
                <option key={platform} value={platform}>
                  {platform === 'All' ? 'All Platforms' : platform}
                </option>
              ))}
            </select>
          </div>
        </div>
      }
    >

      <div className="mb-6 flex flex-wrap gap-2">
        {lifecycleTabs.map((tab) => {
          const isActive = tab.id === activeLifecycleTab
          const count = campaigns.filter((campaign) => tab.statuses.includes(campaign.status)).length
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveLifecycleTab(tab.id)
                setSelectedCampaignIds([])
              }}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${isActive
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                }`}
            >
              {tab.label} <span className="ml-2 text-xs">{count}</span>
            </button>
          )
        })}
      </div>

      {bulkResult ? (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            bulkResult.tone === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {bulkResult.message}
        </div>
      ) : null}

      <QueueToolbar
        title="Campaign queue"
        description="Use bulk actions to submit, template, and move campaigns faster."
        selectedCount={selectedCampaignIds.length}
        totalCount={filteredCampaigns.length}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkSubmit}
              disabled={!selectedCampaigns.some((campaign) => campaign.status === CampaignStatus.DRAFT)}
            >
              Submit drafts
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkTemplate}
              disabled={!selectedCampaigns.some((campaign) => campaign.status !== CampaignStatus.DRAFT)}
            >
              Save templates
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCampaignIds([])}
            >
              Clear
            </Button>
          </>
        }
      />

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load campaigns. Please try again.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="table-compact w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Campaign Name</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Platform</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Budget</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Snapshot</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Next Action</th>
                  <th className="text-right px-6 py-3 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <EmptyState
                        title="No campaigns found"
                        description="Create a campaign to start collaborating with creators."
                        action={
                          <Button
                            onClick={() => router.push('/campaigns/new')}
                            className="mt-4 bg-sky-500 hover:bg-sky-600 text-white"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create your first campaign
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((campaign: Campaign) => (
                    <tr
                      key={campaign.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${previewCampaign?.id === campaign.id ? 'bg-slate-50' : ''}`}
                      onClick={() => setPreviewCampaign(campaign)}
                    >
                      <td className="px-6 py-4" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedCampaignIds.includes(String(campaign.id))}
                          onChange={() => toggleSelection(String(campaign.id))}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                        <div className="text-xs text-gray-500">
                          {campaign.startDate} - {campaign.endDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{campaign.platform}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatCurrency(campaign.budget ?? 0)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium text-gray-900">{campaign.selectedCreatorsCount ?? 0}</span> creators
                        </div>
                        <div className="text-xs text-gray-500">Window: {campaign.startDate} to {campaign.endDate}</div>
                        <div className="text-xs text-gray-400">Performance: N/A | Spend: N/A</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <StatusBadge status={campaign.status} />
                          <FundingStatusBadge campaign={campaign} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {nextActionByStatus[campaign.status]}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {campaign.status === CampaignStatus.DRAFT && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation()
                              updateCampaign.mutate({
                                id: String(campaign.id),
                                data: { status: CampaignStatus.PENDING_REVIEW },
                              })
                            }}
                          >
                            Submit for review
                          </Button>
                        )}
                        {campaign.status === CampaignStatus.PENDING_REVIEW && (
                          <span className="text-xs font-medium text-slate-500">Awaiting approval</span>
                        )}
                        {campaign.status === CampaignStatus.ACTIVE && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation()
                              updateCampaign.mutate({
                                id: String(campaign.id),
                                data: { status: CampaignStatus.PAUSED },
                              })
                            }}
                          >
                            Pause
                          </Button>
                        )}
                        {campaign.status === CampaignStatus.PAUSED && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation()
                              updateCampaign.mutate({
                                id: String(campaign.id),
                                data: { status: CampaignStatus.ACTIVE },
                              })
                            }}
                          >
                            Resume
                          </Button>
                        )}
                        {campaign.status !== CampaignStatus.DRAFT && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation()
                              createTemplate.mutate(String(campaign.id))
                            }}
                            className="ml-2"
                          >
                            Save Template
                          </Button>
                        )}
                        {campaign.status !== CampaignStatus.DRAFT && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation()
                              router.push(`/campaigns/${campaign.id}/analytics`)
                            }}
                            className="ml-2"
                          >
                            Analytics
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation()
                            router.push(`/campaigns/${campaign.id}`)
                          }}
                          className="ml-2"
                        >
                          Open
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <aside className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Inline preview</p>
              <p className="text-xs text-slate-500">Review context before opening details.</p>
            </div>
            {previewCampaign ? (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                <ContextPanel title="Campaign" description={previewCampaign.title} />
                <ContextPanel title="Status" description={previewCampaign.status} />
                <ContextPanel title="Budget" description={formatCurrency(previewCampaign.budget ?? 0)} />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/campaigns/${previewCampaign.id}`)}
                  >
                    Open details
                  </Button>
                  {previewCampaign.status === CampaignStatus.DRAFT && (
                    <Button
                      size="sm"
                      onClick={() =>
                        updateCampaign.mutate({
                          id: String(previewCampaign.id),
                          data: { status: CampaignStatus.PENDING_REVIEW },
                        })
                      }
                    >
                      Submit for review
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No selection"
                description="Pick a campaign to preview details."
              />
            )}
          </aside>
        </div>
      )}
    </DashboardPageShell>
  )
}

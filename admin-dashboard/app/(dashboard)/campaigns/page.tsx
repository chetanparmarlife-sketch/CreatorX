'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/shared/skeleton'
import { useCampaigns, useUpdateCampaign } from '@/lib/hooks/use-campaigns'
import { useCreateTemplateFromCampaign } from '@/lib/hooks/use-templates'
import { Campaign, CampaignStatus, CampaignPlatform } from '@/lib/types'

const statusOptions = ['All', 'ACTIVE', 'PAUSED', 'COMPLETED', 'DRAFT'] as const
const platformOptions = ['All', ...Object.values(CampaignPlatform)] as const

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
    DRAFT: 'bg-slate-100 text-slate-600',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
        styles[status]
      }`}
    >
      {status}
    </span>
  )
}

export default function CampaignsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>('All')
  const [platformFilter, setPlatformFilter] =
    useState<(typeof platformOptions)[number]>('All')
  const updateCampaign = useUpdateCampaign()
  const createTemplate = useCreateTemplateFromCampaign()

  const { data, isLoading, error } = useCampaigns(
    {
      search: searchQuery || undefined,
      status: statusFilter === 'All' ? undefined : statusFilter,
      platform: platformFilter === 'All' ? undefined : platformFilter,
    },
    0
  )

  const campaigns = useMemo(() => data?.items ?? [], [data?.items])

  return (
    <div>
      <PageHeader 
        title="Campaigns" 
        ctaLabel="Create Campaign"
        onCtaClick={() => router.push('/campaigns/new')}
      />

      <div className="mb-6 space-y-4">
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
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="h-11 rounded-lg border border-input bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Statuses' : status}
              </option>
            ))}
          </select>
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

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load campaigns. Please try again.
        </div>
      ) : (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Campaign Name</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Platform</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Budget</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Selected</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Status</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="text-gray-500">No campaigns found</p>
                  <Button
                    onClick={() => router.push('/campaigns/new')}
                    className="mt-4 bg-sky-500 hover:bg-sky-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create your first campaign
                  </Button>
                </td>
              </tr>
            ) : (
              campaigns.map((campaign: Campaign) => (
                <tr 
                  key={campaign.id} 
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                >
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
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {campaign.selectedCreatorsCount ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={campaign.status} />
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
                            data: { status: CampaignStatus.ACTIVE },
                          })
                        }}
                      >
                        Publish
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { adminCampaignManagementService } from '@/lib/api/admin/campaign-management'
import { adminUserService } from '@/lib/api/admin/users'
import { PageHeader } from '@/components/shared/page-header'
import { TableSkeleton } from '@/components/shared/skeleton'
import { StatusChip } from '@/components/shared/status-chip'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CampaignStatus, UserRole } from '@/lib/types'

const statusTone: Record<CampaignStatus, 'approved' | 'needs_action' | 'blocked' | 'pending' | 'info'> = {
  DRAFT: 'needs_action',
  PENDING_REVIEW: 'pending',
  ACTIVE: 'approved',
  PAUSED: 'info',
  COMPLETED: 'approved',
  CANCELLED: 'blocked',
}

export default function AdminCampaignManagementPage() {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<CampaignStatus | 'ALL'>('ALL')
  const [brandId, setBrandId] = useState('')

  const { data: brands } = useQuery({
    queryKey: ['admin-brand-users'],
    queryFn: () => adminUserService.listUsers({ role: UserRole.BRAND, page: 0, size: 200 }),
  })

  const brandOptions = useMemo(
    () => (brands as any)?.items ?? (brands as any)?.content ?? [],
    [brands]
  )

  const { data, isLoading } = useQuery({
    queryKey: ['admin-campaign-management', page, search, status, brandId],
    queryFn: () =>
      adminCampaignManagementService.listCampaigns({
        page,
        size: 20,
        search: search || undefined,
        status: status === 'ALL' ? undefined : status,
        brandId: brandId || undefined,
        sortBy: 'created_at',
        sortDirection: 'desc',
      }),
  })

  const campaigns = (data as any)?.items ?? (data as any)?.content ?? []
  const totalPages = (data as any)?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaign Management"
        ctaLabel="Create Campaign"
        onCtaClick={() => router.push('/admin/campaign-management/new')}
      />
      <p className="text-sm text-slate-500">
        Manage campaigns on behalf of brands with the same lifecycle used in the brand and creator apps.
      </p>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search campaigns or descriptions"
              className="pl-9"
            />
          </div>
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
            value={status}
            onChange={(event) => setStatus(event.target.value as CampaignStatus | 'ALL')}
          >
            <option value="ALL">All statuses</option>
            {Object.values(CampaignStatus).map((statusValue) => (
              <option key={statusValue} value={statusValue}>
                {statusValue}
              </option>
            ))}
          </select>
          <select
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm min-w-[200px]"
            value={brandId}
            onChange={(event) => setBrandId(event.target.value)}
          >
            <option value="">All brands</option>
            {brandOptions.map((brand: any) => (
              <option key={brand.id} value={brand.id}>
                {brand.companyName || brand.fullName || brand.email}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Campaign</th>
                  <th className="py-2 pr-4">Brand</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Budget</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {campaigns.length ? (
                  campaigns.map((campaign: any) => (
                    <tr key={campaign.id} className="border-t border-slate-100">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-900">{campaign.title}</p>
                        <p className="text-xs text-slate-500">{campaign.category}</p>
                      </td>
                      <td className="py-3 pr-4">
                        {campaign.brand?.name || campaign.brand?.email || campaign.brandId || '—'}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusChip tone={statusTone[campaign.status as CampaignStatus] || 'info'} size="compact">
                          {campaign.status}
                        </StatusChip>
                      </td>
                      <td className="py-3 pr-4">{campaign.budget ? `₹${campaign.budget}` : '—'}</td>
                      <td className="py-3 pr-4">
                        {campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/admin/campaign-management/${campaign.id}`)}
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No campaigns match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

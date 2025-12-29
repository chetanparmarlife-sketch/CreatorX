'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Edit, Eye, Plus, Trash2 } from 'lucide-react'
import { useCampaigns } from '@/lib/hooks/use-campaigns'
import { Campaign } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const statusOptions = ['All', 'Draft', 'Active', 'Completed'] as const

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-slate-200 text-slate-700',
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

const getApplicationsCount = (campaign: Campaign) => {
  const value =
    (campaign as any).applicationsCount ??
    (campaign as any).applications?.length ??
    campaign.selectedCreatorsCount ??
    0
  return typeof value === 'number' ? value : 0
}

export default function CampaignsPage() {
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading, error } = useCampaigns({}, page)

  const filteredCampaigns = useMemo(() => {
    const items = data?.items ?? []
    return items.filter((campaign) => {
      const matchesStatus =
        statusFilter === 'All' || campaign.status === statusFilter.toUpperCase()
      const matchesSearch =
        !search.trim() ||
        campaign.title.toLowerCase().includes(search.trim().toLowerCase())
      return matchesStatus && matchesSearch
    })
  }, [data?.items, search, statusFilter])

  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-semibold text-slate-900">Campaigns</h1>
        <Button asChild className="w-full md:w-auto">
          <Link href="/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="h-10 rounded-md border border-input bg-white px-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <Input
            placeholder="Search by title..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="md:w-72"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-lg border bg-white">
          <div className="animate-pulse space-y-4 p-6">
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load campaigns. Please try again.
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <p className="text-slate-500">No campaigns yet. Create your first campaign!</p>
          <Button asChild className="mt-4">
            <Link href="/campaigns/new">New Campaign</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Budget</TableHead>
                <TableHead className="hidden lg:table-cell">Applications</TableHead>
                <TableHead className="hidden lg:table-cell">Start Date</TableHead>
                <TableHead className="hidden lg:table-cell">End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium text-slate-900">
                    {campaign.title}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusStyles[campaign.status] ?? 'bg-slate-200 text-slate-700'}>
                      {campaign.status.charAt(0) + campaign.status.slice(1).toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {formatCurrency(campaign.budget)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {getApplicationsCount(campaign)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {new Date(campaign.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {new Date(campaign.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/campaigns/${campaign.id}`} aria-label="View campaign">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/campaigns/${campaign.id}/edit`} aria-label="Edit campaign">
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete campaign"
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {page + 1} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/shared/skeleton'

interface Campaign {
  id: number
  name: string
  platform: string
  paymentTerms: string
  status: 'ACTIVE' | 'COMPLETED' | 'DRAFT'
  budget: string
  applications: number
  startDate: string
  endDate: string
}

const mockCampaigns: Campaign[] = [
  {
    id: 1,
    name: 'Summer Collection Launch',
    platform: 'Instagram',
    paymentTerms: 'BARTER',
    status: 'ACTIVE',
    budget: '$5,000',
    applications: 24,
    startDate: 'Jan 15, 2025',
    endDate: 'Feb 15, 2025',
  },
  {
    id: 2,
    name: 'Product Review Campaign',
    platform: 'YouTube',
    paymentTerms: 'PAID',
    status: 'ACTIVE',
    budget: '$10,000',
    applications: 18,
    startDate: 'Jan 20, 2025',
    endDate: 'Mar 1, 2025',
  },
  {
    id: 3,
    name: 'Holiday Special 2024',
    platform: 'Instagram',
    paymentTerms: 'BOTH',
    status: 'COMPLETED',
    budget: '$8,000',
    applications: 45,
    startDate: 'Dec 1, 2024',
    endDate: 'Dec 31, 2024',
  },
  {
    id: 4,
    name: 'Tech Review Series',
    platform: 'YouTube',
    paymentTerms: 'PAID',
    status: 'ACTIVE',
    budget: '$15,000',
    applications: 32,
    startDate: 'Jan 10, 2025',
    endDate: 'Mar 10, 2025',
  },
  {
    id: 5,
    name: 'Spring Fashion Week',
    platform: 'Instagram',
    paymentTerms: 'BARTER',
    status: 'DRAFT',
    budget: '$7,500',
    applications: 0,
    startDate: 'Mar 1, 2025',
    endDate: 'Mar 15, 2025',
  },
]

function FilterButton({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
      <span className="text-sm text-gray-700">{label}</span>
      <ChevronDown className="w-4 h-4 text-gray-500" />
    </button>
  )
}

function StatusBadge({ status }: { status: Campaign['status'] }) {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-gray-100 text-gray-700',
    DRAFT: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

function PaymentBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-700 bg-white">
      {type}
    </span>
  )
}

export default function CampaignsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const filtered = mockCampaigns.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <PageHeader 
        title="Campaigns" 
        ctaLabel="Create Campaign"
        onCtaClick={() => router.push('/campaigns/new')}
      />

      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-white border-gray-300"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <FilterButton label="Status" />
          <FilterButton label="Platform" />
          <FilterButton label="Payment Type" />
          <FilterButton label="Date Range" />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Campaign Name</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Platform</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Payment</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Budget</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Applications</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
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
              filtered.map((campaign) => (
                <tr 
                  key={campaign.id} 
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/campaigns/${campaign.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                    <div className="text-xs text-gray-500">{campaign.startDate} - {campaign.endDate}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{campaign.platform}</td>
                  <td className="px-6 py-4">
                    <PaymentBadge type={campaign.paymentTerms} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{campaign.budget}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{campaign.applications}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={campaign.status} />
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

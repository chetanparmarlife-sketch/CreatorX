'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ClipboardList,
  FileText,
  BarChart3,
  Loader2,
  Users,
  Wallet,
} from 'lucide-react'
import { useCampaign } from '@/lib/hooks/use-campaigns'
import { useBrandWallet, useAllocateToCampaign } from '@/lib/hooks/use-wallet'
import { CampaignStatus, EscrowStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { FundingStatusBadge } from '@/components/campaigns/funding-status-badge'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
  PENDING_REVIEW: 'bg-blue-100 text-blue-700',
  DRAFT: 'bg-slate-100 text-slate-600',
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params?.id as string

  const { data: campaign, isLoading, error, refetch: refetchCampaign } = useCampaign(campaignId)
  const { data: wallet } = useBrandWallet()
  const allocateMutation = useAllocateToCampaign()

  const handleFundCampaign = async () => {
    if (!campaign || !wallet) return

    const amountNeeded = campaign.budget

    if (wallet.balance < amountNeeded) {
      router.push(`/payments?action=deposit&amount=${amountNeeded - wallet.balance}&campaignId=${campaign.id}`)
      return
    }

    try {
      await allocateMutation.mutateAsync({
        campaignId: campaign.id,
        request: { amount: amountNeeded },
      })
      refetchCampaign()
    } catch (error: any) {
      alert('Failed to fund campaign: ' + (error?.message || 'Unknown error'))
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="h-10 w-80 rounded bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-slate-100" />
            ))}
          </div>
          <div className="h-40 rounded-lg bg-slate-100" />
        </div>
      </div>
    )
  }

  if (error || !campaign) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-slate-500">
          <Link href="/campaigns" className="hover:text-slate-700">Campaigns</Link>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Failed to load campaign. It may have been deleted or you don&apos;t have access.
        </div>
      </div>
    )
  }

  const remaining = (campaign.escrowAllocated || 0) - (campaign.escrowReleased || 0)

  const navLinks = [
    { label: 'Applications', href: `/campaigns/${campaignId}/applications`, icon: Users },
    { label: 'Deliverables', href: `/campaigns/${campaignId}/deliverables`, icon: ClipboardList },
    { label: 'Analytics', href: `/campaigns/${campaignId}/analytics`, icon: BarChart3 },
  ]

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-slate-500">
        <Link href="/campaigns" className="hover:text-slate-700">Campaigns</Link>
        <span className="px-1 text-slate-400">&gt;</span>
        <span className="text-slate-700">{campaign.title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold text-slate-900">{campaign.title}</h1>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[campaign.status] || ''}`}>
              {campaign.status}
            </span>
            <FundingStatusBadge campaign={campaign} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span>{campaign.platform}</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {campaign.startDate} &mdash; {campaign.endDate}
            </span>
            {campaign.category && <span>{campaign.category}</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push(`/campaigns/${campaignId}/applications`)}>
            <Users className="mr-2 h-4 w-4" />
            Applications
          </Button>
          <Button variant="outline" onClick={() => router.push(`/campaigns/${campaignId}/deliverables`)}>
            <ClipboardList className="mr-2 h-4 w-4" />
            Deliverables
          </Button>
        </div>
      </div>

      {/* Escrow Status Banner */}
      {campaign.escrowStatus === EscrowStatus.UNFUNDED && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Campaign Not Funded</AlertTitle>
          <AlertDescription className="text-orange-700">
            <div className="flex items-center justify-between mt-2">
              <span>
                This campaign needs {formatCurrency(campaign.budget)} to be activated.
                {wallet && wallet.balance < campaign.budget && (
                  <span className="block text-sm mt-1">
                    Your balance: {formatCurrency(wallet.balance)} (Need {formatCurrency(campaign.budget - wallet.balance)} more)
                  </span>
                )}
              </span>
              <Button
                onClick={handleFundCampaign}
                disabled={allocateMutation.isPending}
                className="ml-4"
              >
                {allocateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Funding...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Fund Campaign
                  </>
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {campaign.escrowStatus === EscrowStatus.FUNDED && (
        <Card className="bg-green-50 border-green-200 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-800">Campaign Funded</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm text-green-700">
                <div>
                  <span className="text-green-600">Allocated:</span>
                  <p className="font-medium">{formatCurrency(campaign.escrowAllocated || 0)}</p>
                </div>
                <div>
                  <span className="text-green-600">Released:</span>
                  <p className="font-medium">{formatCurrency(campaign.escrowReleased || 0)}</p>
                </div>
                <div>
                  <span className="text-green-600">Remaining:</span>
                  <p className="font-medium">{formatCurrency(remaining)}</p>
                </div>
                <div>
                  <span className="text-green-600">Status:</span>
                  <Badge className="bg-green-100 text-green-800 border-green-300">Funded</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {campaign.escrowStatus === EscrowStatus.PARTIAL && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Partially Funded</AlertTitle>
          <AlertDescription className="text-yellow-700">
            <div className="mt-2">
              <div className="flex justify-between mb-1">
                <span>Funding Progress</span>
                <span className="font-medium">
                  {formatCurrency(campaign.escrowAllocated || 0)} / {formatCurrency(campaign.budget)}
                </span>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{ width: `${((campaign.escrowAllocated || 0) / campaign.budget) * 100}%` }}
                />
              </div>
              <Button onClick={handleFundCampaign} className="mt-3" size="sm" disabled={allocateMutation.isPending}>
                {allocateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Funding...
                  </>
                ) : (
                  `Add Remaining ${formatCurrency(campaign.budget - (campaign.escrowAllocated || 0))}`
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">{formatCurrency(campaign.budget)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Escrow Allocated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">{formatCurrency(campaign.escrowAllocated || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Released to Creators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">{formatCurrency(campaign.escrowReleased || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Selected Creators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-slate-900">{campaign.selectedCreatorsCount ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details + Nav Links */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {campaign.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{campaign.description}</p>
              </CardContent>
            </Card>
          )}

          {campaign.requirements && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{campaign.requirements}</p>
              </CardContent>
            </Card>
          )}

          {campaign.deliverables && campaign.deliverables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Deliverables ({campaign.deliverables.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaign.deliverables.map((deliverable, index) => (
                    <div
                      key={deliverable.id}
                      className="flex items-start gap-3 rounded-lg border border-slate-200 p-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900">{deliverable.title}</p>
                        {deliverable.description && (
                          <p className="mt-0.5 text-xs text-slate-500">{deliverable.description}</p>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <Badge variant="outline" className="text-xs">{deliverable.type}</Badge>
                          {deliverable.dueDate && <span>Due: {deliverable.dueDate}</span>}
                          {deliverable.isMandatory && (
                            <Badge className="bg-red-50 text-red-600 border-red-200 text-xs">Required</Badge>
                          )}
                          {deliverable.price != null && deliverable.price > 0 && (
                            <span className="font-medium text-slate-600">
                              {formatCurrency(deliverable.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Quick Nav + Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Navigate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:border-slate-300"
                >
                  <link.icon className="h-4 w-4 text-slate-400" />
                  {link.label}
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Platform</span>
                <span className="font-medium text-slate-900">{campaign.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category</span>
                <span className="font-medium text-slate-900">{campaign.category || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Start Date</span>
                <span className="font-medium text-slate-900">{campaign.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">End Date</span>
                <span className="font-medium text-slate-900">{campaign.endDate}</span>
              </div>
              {campaign.applicationDeadline && (
                <div className="flex justify-between">
                  <span className="text-slate-500">App. Deadline</span>
                  <span className="font-medium text-slate-900">{campaign.applicationDeadline}</span>
                </div>
              )}
              {campaign.maxApplicants && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Max Applicants</span>
                  <span className="font-medium text-slate-900">{campaign.maxApplicants}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Created</span>
                <span className="font-medium text-slate-900">{campaign.createdAt?.split('T')[0]}</span>
              </div>
            </CardContent>
          </Card>

          {campaign.tags && campaign.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {campaign.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

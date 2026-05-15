'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ThumbsDown, ThumbsUp, AlertCircle, CheckCircle, Wallet, Loader2, Plus } from 'lucide-react'
import { applicationService } from '@/lib/api/applications'
import { messageService } from '@/lib/api/messages'
import { useCampaign } from '@/lib/hooks/use-campaigns'
import { Application, EscrowStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { useBrandWallet, useAllocateToCampaign } from '@/lib/hooks/use-wallet'
import { useBrandEventTracker } from '@/lib/analytics/use-brand-event-tracker'

const tabOptions = ['All', 'Pending', 'Shortlisted', 'Selected', 'Rejected'] as const

const statusToLabel: Record<string, string> = {
  APPLIED: 'Pending',
  SHORTLISTED: 'Shortlisted',
  SELECTED: 'Selected',
  REJECTED: 'Rejected',
}

const statusStyles: Record<string, string> = {
  APPLIED: 'bg-slate-200 text-slate-700',
  SHORTLISTED: 'bg-amber-100 text-amber-700',
  SELECTED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

export default function ApplicationsPage() {
  const params = useParams()
  const campaignId = params?.id as string
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: campaign, refetch: refetchCampaign } = useCampaign(campaignId)
  const { data: wallet } = useBrandWallet()
  const allocateMutation = useAllocateToCampaign()
  const { track } = useBrandEventTracker({
    walletBalance: wallet?.balance ?? null,
  })
  const [activeTab, setActiveTab] = useState<(typeof tabOptions)[number]>('All')
  const [profileApplication, setProfileApplication] = useState<Application | null>(null)
  const [pitchApplication, setPitchApplication] = useState<Application | null>(null)
  const [rejectApplication, setRejectApplication] = useState<Application | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const { data, isLoading, error } = useQuery({
    queryKey: ['campaign-applications', campaignId],
    queryFn: () => applicationService.getCampaignApplications(campaignId),
    enabled: !!campaignId,
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      applicationService.updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-applications', campaignId] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      applicationService.rejectApplication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-applications', campaignId] })
    },
  })

  const bulkMutation = useMutation({
    mutationFn: ({ ids, status, reason }: { ids: string[]; status: string; reason?: string }) =>
      applicationService.updateApplicationsBulkStatus(ids, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-applications', campaignId] })
      setSelectedIds(new Set())
    },
  })

  const filteredApplications = useMemo(() => {
    const items = data ?? []
    if (activeTab === 'All') return items
    if (activeTab === 'Pending') {
      return items.filter((application) => application.status === 'APPLIED')
    }
    return items.filter((application) => application.status === activeTab.toUpperCase())
  }, [activeTab, data])

  const handleStatusChange = (applicationId: string, status: string) => {
    statusMutation.mutate({ id: applicationId, status })
  }

  const handleRejectConfirm = () => {
    if (!rejectApplication) return
    rejectMutation.mutate({
      id: String(rejectApplication.id),
      reason: rejectReason.trim() || 'Not a fit for this campaign.',
    })
    setRejectApplication(null)
    setRejectReason('')
  }

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (filteredApplications.length === 0) return
    const allIds = filteredApplications.map((item) => String(item.id))
    const allSelected = allIds.every((id) => selectedIds.has(id))
    setSelectedIds(allSelected ? new Set() : new Set(allIds))
  }

  const handleBulkAction = (status: string) => {
    if (selectedIds.size === 0) return
    bulkMutation.mutate({
      ids: Array.from(selectedIds),
      status,
      reason: status === 'REJECTED' ? 'Not selected' : undefined,
    })
  }

  const handleFundCampaign = async () => {
    if (!campaign || !wallet) return

    const amountNeeded = campaign.budget

    if (wallet.balance < amountNeeded) {
      // Redirect to add funds
      router.push(`/payments?action=deposit&amount=${amountNeeded - wallet.balance}&campaignId=${campaign.id}`)
      return
    }

    try {
      await allocateMutation.mutateAsync({
        campaignId: campaign.id,
        request: { amount: amountNeeded },
      })
      track('campaign_funded', {
        campaign_id: campaign.id,
        amount: amountNeeded,
        source: 'campaign_applications',
      })
      // Success - refetch campaign data
      refetchCampaign()
    } catch (error: any) {
      alert('Failed to fund campaign: ' + (error?.message || 'Unknown error'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-500">
        <Link href="/campaigns" className="hover:text-slate-700">
          Campaigns
        </Link>{' '}
        <span className="px-1 text-slate-400">&gt;</span>
        <span className="text-slate-700">{campaign?.title ?? 'Campaign'}</span>{' '}
        <span className="px-1 text-slate-400">&gt;</span>
        <span className="text-slate-700">Applications</span>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Applications</h1>
          <p className="text-sm text-slate-500">
            Review and manage creators applying to this campaign.
          </p>
        </div>
      </div>

      {/* Escrow Status Banner */}
      {campaign && (
        <div className="space-y-4">
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
                      <span className="text-green-600">Total Allocated:</span>
                      <p className="font-medium">{formatCurrency(campaign.escrowAllocated || 0)}</p>
                    </div>
                    <div>
                      <span className="text-green-600">Released to Creators:</span>
                      <p className="font-medium">{formatCurrency(campaign.escrowReleased || 0)}</p>
                    </div>
                    <div>
                      <span className="text-green-600">Remaining:</span>
                      <p className="font-medium">
                        {formatCurrency((campaign.escrowAllocated || 0) - (campaign.escrowReleased || 0))}
                      </p>
                    </div>
                    <div>
                      <span className="text-green-600">Status:</span>
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        Funded
                      </Badge>
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
                  <Button
                    onClick={handleFundCampaign}
                    className="mt-3"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Remaining {formatCurrency(campaign.budget - (campaign.escrowAllocated || 0))}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="w-full justify-start">
          {tabOptions.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab}>
          {selectedIds.size > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border bg-white p-3">
              <span className="text-sm text-slate-600">
                {selectedIds.size} selected
              </span>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('SHORTLISTED')}>
                Bulk Shortlist
              </Button>
              <Button size="sm" onClick={() => handleBulkAction('SELECTED')}>
                Bulk Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction('REJECTED')}
              >
                Bulk Reject
              </Button>
            </div>
          )}
          {isLoading ? (
            <div className="rounded-lg border bg-white p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 w-1/3 rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-200" />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load applications. Please try again.
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="rounded-lg border bg-white p-12 text-center text-slate-500">
              No applications found for this status.
            </div>
          ) : (
            <div className="rounded-lg border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={
                          filteredApplications.length > 0 &&
                          filteredApplications.every((item) => selectedIds.has(String(item.id)))
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Pitch</TableHead>
                    <TableHead className="hidden md:table-cell">Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => {
                    const creatorName =
                      application.creator?.profile?.fullName ||
                      application.creator?.email?.split('@')[0] ||
                      'Creator'
                    const initials = creatorName.slice(0, 2).toUpperCase()
                    const pitch = application.pitchText || ''
                    const isRejected = application.status === 'REJECTED'
                    const isSelected = application.status === 'SELECTED'
                    const isShortlisted = application.status === 'SHORTLISTED'

                    return (
                      <TableRow key={application.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(String(application.id))}
                            onCheckedChange={() => toggleSelection(String(application.id))}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-purple-100 text-purple-700">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-slate-900">{creatorName}</div>
                              <div className="text-xs text-slate-500">
                                {application.creator?.email ?? 'Creator profile'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {pitch.length > 100 ? `${pitch.slice(0, 100)}...` : pitch || 'No pitch'}
                          {pitch.length > 100 && (
                            <Button
                              variant="link"
                              className="ml-2 h-auto p-0 text-purple-600"
                              onClick={() => setPitchApplication(application)}
                            >
                              Read more
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusStyles[application.status] ?? 'bg-slate-200 text-slate-700'}>
                            {statusToLabel[application.status] ?? application.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setProfileApplication(application)}
                            >
                              View Profile
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const conversation = await messageService.getConversationByApplication(
                                  String(application.id)
                                )
                                window.location.href = `/messages?conversationId=${conversation.id}`
                              }}
                            >
                              Message
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isShortlisted || isSelected || isRejected}
                              onClick={() => handleStatusChange(String(application.id), 'SHORTLISTED')}
                            >
                              Shortlist
                            </Button>
                            <Button
                              size="sm"
                              disabled={isSelected || isRejected}
                              onClick={() => handleStatusChange(String(application.id), 'SELECTED')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={isRejected}
                              onClick={() => setRejectApplication(application)}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!profileApplication} onOpenChange={() => setProfileApplication(null)}>
        <DialogContent className="max-w-2xl">
          {profileApplication && (
            <>
              <DialogHeader>
                <DialogTitle>Creator Profile</DialogTitle>
                <DialogDescription>Overview of creator details and stats.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-lg">
                      {(profileApplication.creator?.profile?.fullName ||
                        profileApplication.creator?.email ||
                        'CR')
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {profileApplication.creator?.profile?.fullName ||
                        profileApplication.creator?.email ||
                        'Creator'}
                    </div>
                    <p className="text-sm text-slate-500">
                      {profileApplication.creator?.profile?.bio || 'No bio available.'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Instagram</p>
                    <p className="text-sm text-slate-700">
                      {(profileApplication as any).creator?.instagram || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">YouTube</p>
                    <p className="text-sm text-slate-700">
                      {(profileApplication as any).creator?.youtube || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Portfolio</p>
                  <div className="mt-2 grid gap-2 text-sm text-slate-700">
                    {((profileApplication as any).portfolioItems as string[] | undefined)?.length
                      ? ((profileApplication as any).portfolioItems as string[]).map((item, index) => (
                          <div key={`${item}-${index}`} className="rounded-md bg-slate-50 p-2">
                            {item}
                          </div>
                        ))
                      : 'No portfolio items.'}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Followers</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {(profileApplication as any).stats?.followers ?? 'N/A'}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Engagement</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {(profileApplication as any).stats?.engagementRate ?? 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() =>
                    handleStatusChange(String(profileApplication.id), 'SHORTLISTED')
                  }
                  disabled={profileApplication.status !== 'APPLIED'}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Shortlist
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setProfileApplication(null)
                    setRejectApplication(profileApplication)
                  }}
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!pitchApplication} onOpenChange={() => setPitchApplication(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Creator Pitch</DialogTitle>
            <DialogDescription>Full pitch from the creator.</DialogDescription>
          </DialogHeader>
          <div className="whitespace-pre-wrap text-sm text-slate-700">
            {pitchApplication?.pitchText || 'No pitch provided.'}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!rejectApplication} onOpenChange={() => setRejectApplication(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Share a brief reason that will be sent to the creator.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Add rejection reason..."
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectApplication(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={rejectMutation.isPending}
            >
              Send Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

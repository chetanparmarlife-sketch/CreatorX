'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { applicationService } from '@/lib/api/applications'
import { useCampaign } from '@/lib/hooks/use-campaigns'
import { Application } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

export default function ApplicationsPage() {
  const params = useParams()
  const campaignId = params?.id as string
  const queryClient = useQueryClient()

  const { data: campaign } = useCampaign(campaignId)
  const [activeTab, setActiveTab] = useState<(typeof tabOptions)[number]>('All')
  const [profileApplication, setProfileApplication] = useState<Application | null>(null)
  const [pitchApplication, setPitchApplication] = useState<Application | null>(null)
  const [rejectApplication, setRejectApplication] = useState<Application | null>(null)
  const [rejectReason, setRejectReason] = useState('')

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

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="w-full justify-start">
          {tabOptions.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab}>
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

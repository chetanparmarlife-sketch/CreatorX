'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminCampaignManagementService,
} from '@/lib/api/admin/campaign-management'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { StatusChip } from '@/components/shared/status-chip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CampaignPlatform, CampaignStatus } from '@/lib/types'

const statusTone: Record<CampaignStatus, 'approved' | 'needs_action' | 'blocked' | 'pending' | 'info'> = {
  DRAFT: 'needs_action',
  PENDING_REVIEW: 'pending',
  ACTIVE: 'approved',
  PAUSED: 'info',
  COMPLETED: 'approved',
  CANCELLED: 'blocked',
}

const reviewStatusOptions = [
  { label: 'Approve', value: 'APPROVED' },
  { label: 'Request revision', value: 'REVISION_REQUESTED' },
  { label: 'Reject', value: 'REJECTED' },
]

const nextActionByStatus: Record<CampaignStatus, string> = {
  DRAFT: 'Complete details and submit for review.',
  PENDING_REVIEW: 'Awaiting admin approval before launch.',
  ACTIVE: 'Monitor applications and review deliverables.',
  PAUSED: 'Resume when ready or adjust requirements.',
  COMPLETED: 'Review outcomes and archive learnings.',
  CANCELLED: 'Confirm cancellation reason with brand.',
}

export default function AdminCampaignManagementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const campaignId = params?.id as string

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['admin-campaign-management-detail', campaignId],
    queryFn: () => adminCampaignManagementService.getCampaign(campaignId),
    enabled: !!campaignId,
  })

  const { data: applications } = useQuery({
    queryKey: ['admin-campaign-applications', campaignId],
    queryFn: () => adminCampaignManagementService.listApplications(campaignId, { page: 0, size: 50 }),
    enabled: !!campaignId,
  })

  const { data: deliverables } = useQuery({
    queryKey: ['admin-campaign-deliverables', campaignId],
    queryFn: () => adminCampaignManagementService.listDeliverables(campaignId),
    enabled: !!campaignId,
  })

  const applicationItems = (applications as any)?.items ?? (applications as any)?.content ?? []

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [category, setCategory] = useState('')
  const [platform, setPlatform] = useState<CampaignPlatform | ''>('')
  const [status, setStatus] = useState<CampaignStatus | ''>('')
  const [requirements, setRequirements] = useState('')
  const [inviteCreatorId, setInviteCreatorId] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectApplicationId, setRejectApplicationId] = useState<string | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [reviewSubmissionId, setReviewSubmissionId] = useState<string | null>(null)
  const [reviewStatus, setReviewStatus] = useState('APPROVED')
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusApplicationId, setStatusApplicationId] = useState<string | null>(null)
  const [statusDecision, setStatusDecision] = useState('SHORTLISTED')
  const [statusReason, setStatusReason] = useState('')

  useEffect(() => {
    if (!campaign) return
    setTitle(campaign.title || '')
    setDescription(campaign.description || '')
    setBudget(campaign.budget ? String(campaign.budget) : '')
    setCategory(campaign.category || '')
    setPlatform((campaign.platform as CampaignPlatform) || '')
    setStatus((campaign.status as CampaignStatus) || '')
    setRequirements(campaign.requirements || '')
  }, [campaign])

  const updateMutation = useMutation({
    mutationFn: () =>
      adminCampaignManagementService.updateCampaign(campaignId, {
        title,
        description,
        budget: budget ? Number(budget) : undefined,
        category,
        platform: platform || undefined,
        status: status || undefined,
        requirements,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-campaign-management-detail', campaignId] }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => adminCampaignManagementService.deleteCampaign(campaignId),
    onSuccess: () => router.push('/admin/campaign-management'),
  })

  const inviteMutation = useMutation({
    mutationFn: () => adminCampaignManagementService.inviteCreator(campaignId, inviteCreatorId, inviteMessage),
    onSuccess: () => {
      setInviteCreatorId('')
      setInviteMessage('')
      queryClient.invalidateQueries({ queryKey: ['admin-campaign-applications', campaignId] })
    },
  })

  const resolvedBrandId = campaign?.brand?.userId || campaign?.brandId || ''
  const templateMutation = useMutation({
    mutationFn: () =>
      adminCampaignManagementService.createTemplateFromCampaign(
        resolvedBrandId,
        campaignId
      ),
  })

  const statusMutation = useMutation({
    mutationFn: (nextStatus: CampaignStatus) =>
      adminCampaignManagementService.updateCampaign(campaignId, { status: nextStatus }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-campaign-management-detail', campaignId] }),
  })

  const shortlistMutation = useMutation({
    mutationFn: (applicationId: string) => adminCampaignManagementService.shortlistApplication(applicationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-campaign-applications', campaignId] }),
  })

  const selectMutation = useMutation({
    mutationFn: (applicationId: string) => adminCampaignManagementService.selectApplication(applicationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-campaign-applications', campaignId] }),
  })

  const rejectMutation = useMutation({
    mutationFn: () =>
      adminCampaignManagementService.rejectApplication(rejectApplicationId as string, rejectReason || undefined),
    onSuccess: () => {
      setRejectDialogOpen(false)
      setRejectReason('')
      setRejectApplicationId(null)
      queryClient.invalidateQueries({ queryKey: ['admin-campaign-applications', campaignId] })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: () =>
      adminCampaignManagementService.updateApplicationStatus(
        statusApplicationId as string,
        statusDecision,
        statusReason || undefined
      ),
    onSuccess: () => {
      setStatusDialogOpen(false)
      setStatusApplicationId(null)
      setStatusReason('')
      queryClient.invalidateQueries({ queryKey: ['admin-campaign-applications', campaignId] })
    },
  })

  const reviewMutation = useMutation({
    mutationFn: () =>
      adminCampaignManagementService.reviewDeliverable(
        reviewSubmissionId as string,
        reviewStatus,
        reviewFeedback || undefined
      ),
    onSuccess: () => {
      setReviewDialogOpen(false)
      setReviewSubmissionId(null)
      setReviewFeedback('')
      queryClient.invalidateQueries({ queryKey: ['admin-campaign-deliverables', campaignId] })
    },
  })

  const statusOptions = useMemo(() => Object.values(CampaignStatus), [])

  if (isLoading || !campaign) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
        Loading campaign...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{campaign.title}</h1>
          <p className="text-slate-500">Manage this campaign on behalf of the brand.</p>
        </div>
        <StatusChip tone={statusTone[campaign.status as CampaignStatus] || 'info'} size="comfortable">
          {campaign.status}
        </StatusChip>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Next action</p>
        <p className="text-sm text-slate-600">{nextActionByStatus[campaign.status as CampaignStatus]}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Acting as brand</p>
            <p className="text-xs text-slate-500">
              {campaign.brand?.companyName || campaign.brandId}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => statusMutation.mutate(CampaignStatus.PAUSED)}>
              Pause
            </Button>
            <Button variant="outline" size="sm" onClick={() => statusMutation.mutate(CampaignStatus.ACTIVE)}>
              Resume
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => statusMutation.mutate(CampaignStatus.PENDING_REVIEW)}
            >
              Submit for review
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => templateMutation.mutate()}
              disabled={!resolvedBrandId || templateMutation.isPending}
            >
              Save template
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <Input value={category} onChange={(event) => setCategory(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Budget</label>
            <Input type="number" value={budget} onChange={(event) => setBudget(event.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Platform</label>
            <select
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              value={platform}
              onChange={(event) => setPlatform(event.target.value as CampaignPlatform)}
            >
              <option value="">Select</option>
              {Object.values(CampaignPlatform).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              value={status}
              onChange={(event) => setStatus(event.target.value as CampaignStatus)}
            >
              {statusOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Description</label>
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Requirements</label>
          <Textarea value={requirements} onChange={(event) => setRequirements(event.target.value)} />
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => router.push('/admin/campaign-management')}>
            Back
          </Button>
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Applications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Creator</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Applied</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {applicationItems.length ? (
                  applicationItems.map((application: any) => (
                    <tr key={application.id} className="border-t border-slate-100">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-900">
                          {application.creator?.profile?.fullName || application.creator?.email || 'Creator'}
                        </p>
                        <p className="text-xs text-slate-500">{application.creator?.email || application.creatorId}</p>
                      </td>
                      <td className="py-3 pr-4">{application.status}</td>
                      <td className="py-3 pr-4">
                        {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3 pr-4 text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => shortlistMutation.mutate(application.id)}>
                          Shortlist
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => selectMutation.mutate(application.id)}>
                          Select
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRejectApplicationId(application.id)
                            setRejectDialogOpen(true)
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setStatusApplicationId(application.id)
                            setStatusDecision(application.status || 'SHORTLISTED')
                            setStatusDialogOpen(true)
                          }}
                        >
                          Override status
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No applications yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Invite creator</h2>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Creator ID</label>
              <Input value={inviteCreatorId} onChange={(event) => setInviteCreatorId(event.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Message</label>
              <Textarea value={inviteMessage} onChange={(event) => setInviteMessage(event.target.value)} />
            </div>
            <Button onClick={() => inviteMutation.mutate()} disabled={!inviteCreatorId || inviteMutation.isPending}>
              Send invite
            </Button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-2 text-sm text-slate-600">
            <p className="text-sm font-semibold text-slate-900">Workflow alignment</p>
            <p>Creation mirrors the brand flow: draft → review → active.</p>
            <p>Use Applications to shortlist/select creators, then track Deliverables for approvals.</p>
            <p>Override status and deliverable reviews follow the brand rules and log as admin actions.</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Deliverables</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Deliverable</th>
                <th className="py-2 pr-4">Creator</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Submitted</th>
                <th className="py-2 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {(deliverables as any)?.length ? (
                (deliverables as any[]).map((deliverable) => (
                  <tr key={deliverable.id} className="border-t border-slate-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-slate-900">
                        {deliverable.campaignDeliverable?.title || 'Deliverable'}
                      </p>
                      <p className="text-xs text-slate-500">{deliverable.campaignTitle || campaign.title}</p>
                    </td>
                    <td className="py-3 pr-4">{deliverable.creatorName || deliverable.creatorId || '—'}</td>
                    <td className="py-3 pr-4">{deliverable.status || 'PENDING'}</td>
                    <td className="py-3 pr-4">
                      {deliverable.submittedAt ? new Date(deliverable.submittedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReviewSubmissionId(deliverable.id)
                          setReviewDialogOpen(true)
                        }}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No deliverables submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
            <DialogDescription>Provide a reason to share with the creator.</DialogDescription>
          </DialogHeader>
          <Textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => rejectMutation.mutate()} disabled={rejectMutation.isPending}>
              Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review deliverable</DialogTitle>
            <DialogDescription>Choose the outcome and include feedback if needed.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Decision</label>
            <select
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              value={reviewStatus}
              onChange={(event) => setReviewStatus(event.target.value)}
            >
              {reviewStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Feedback</label>
            <Textarea value={reviewFeedback} onChange={(event) => setReviewFeedback(event.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => reviewMutation.mutate()} disabled={reviewMutation.isPending}>
              Submit review
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override application status</DialogTitle>
            <DialogDescription>
              Apply the same status transitions as the brand workflow with an admin override note.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              className="h-10 rounded-lg border border-slate-200 px-3 text-sm"
              value={statusDecision}
              onChange={(event) => setStatusDecision(event.target.value)}
            >
              <option value="APPLIED">APPLIED</option>
              <option value="SHORTLISTED">SHORTLISTED</option>
              <option value="SELECTED">SELECTED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Reason (optional)</label>
            <Textarea value={statusReason} onChange={(event) => setStatusReason(event.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => updateStatusMutation.mutate()} disabled={updateStatusMutation.isPending}>
              Apply override
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

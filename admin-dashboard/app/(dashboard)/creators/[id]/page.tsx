'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useCreator, useInviteCreator } from '@/lib/hooks/use-creators'
import { useCampaigns } from '@/lib/hooks/use-campaigns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type CreatorProfile = {
  id: string | number
  name: string
  bio?: string
  avatarUrl?: string
  category?: string
  followers?: number
  engagementRate?: number
  campaignsCompleted?: number
  social?: {
    instagram?: string
    youtube?: string
    tiktok?: string
  }
  portfolio?: Array<{ url: string; type?: string }>
  recentCampaigns?: Array<{ id: string | number; title: string; status?: string }>
}

const formatFollowers = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

export default function CreatorProfilePage() {
  const params = useParams()
  const creatorId = params?.id as string
  const [selectedCampaign, setSelectedCampaign] = useState<string>('')
  const [message, setMessage] = useState('')

  const { data, isLoading, error } = useCreator(creatorId)

  const { data: campaignsData } = useCampaigns({}, 0)
  const campaigns = campaignsData?.items ?? []

  const inviteMutation = useInviteCreator()

  useEffect(() => {
    if (inviteMutation.isSuccess) {
      setMessage('')
      setSelectedCampaign('')
    }
  }, [inviteMutation.isSuccess])

  const creator = data as CreatorProfile | undefined
  const initials = creator?.name?.slice(0, 2).toUpperCase() || 'CR'

  const portfolioItems = useMemo(() => creator?.portfolio ?? [], [creator?.portfolio])

  if (isLoading) {
    return <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">Loading creator...</div>
  }

  if (error || !creator) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load creator profile.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={creator.avatarUrl} />
              <AvatarFallback className="bg-purple-100 text-purple-700 text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{creator.name}</h1>
              <p className="text-sm text-slate-500">{creator.bio || 'No bio provided.'}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {creator.category && (
                  <Badge className="bg-slate-100 text-slate-600">{creator.category}</Badge>
                )}
                {creator.social?.instagram && (
                  <a href={creator.social.instagram} className="text-xs text-purple-600" target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                )}
                {creator.social?.youtube && (
                  <a href={creator.social.youtube} className="text-xs text-purple-600" target="_blank" rel="noreferrer">
                    YouTube
                  </a>
                )}
                {creator.social?.tiktok && (
                  <a href={creator.social.tiktok} className="text-xs text-purple-600" target="_blank" rel="noreferrer">
                    TikTok
                  </a>
                )}
              </div>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Invite Creator</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite to Campaign</DialogTitle>
                <DialogDescription>
                  Select a campaign and include a personal message.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign: { id: string | number; title: string }) => (
                      <SelectItem key={campaign.id} value={String(campaign.id)}>
                        {campaign.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Add a personal note..."
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={() =>
                    inviteMutation.mutate({
                      campaignId: selectedCampaign,
                      creatorId,
                      message: message.trim(),
                    })
                  }
                  disabled={!selectedCampaign || inviteMutation.isPending}
                >
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Followers</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {formatFollowers(creator.followers || 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {creator.engagementRate || 0}%
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Campaigns Completed</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-900">
            {creator.campaignsCompleted || 0}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          {portfolioItems.length === 0 ? (
            <p className="text-sm text-slate-500">No portfolio items yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {portfolioItems.map((item, index) => (
                <div key={`${item.url}-${index}`} className="overflow-hidden rounded-lg border bg-slate-50">
                  {item.type === 'video' ? (
                    <video controls className="h-44 w-full object-cover">
                      <source src={item.url} />
                    </video>
                  ) : (
                    <img src={item.url} alt="Portfolio" className="h-44 w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {creator.recentCampaigns?.length ? (
            <div className="space-y-3">
              {creator.recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{campaign.title}</span>
                  <Badge className="bg-slate-100 text-slate-600">
                    {campaign.status || 'Completed'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No recent campaigns.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

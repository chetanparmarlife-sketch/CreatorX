'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, GitCompare, Star } from 'lucide-react'
import { useCreators } from '@/lib/hooks/use-creators'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useCampaigns } from '@/lib/hooks/use-campaigns'
import { useInviteCreator } from '@/lib/hooks/use-creators'
import { extractShortlistedCreatorIds, listsService } from '@/lib/api/listsService'

type CreatorCard = {
  id: string | number
  name: string
  category?: string
  followers?: number
  engagementRate?: number
  avatarUrl?: string
  portfolio?: string[]
  platforms?: string[]
  location?: string
  bio?: string
}

type PlatformPresence = 'any' | 'platform-only' | 'multi-platform'

const categories = ['Fashion', 'Beauty', 'Tech', 'Lifestyle', 'Food', 'Travel']
const platforms = ['Instagram', 'YouTube', 'TikTok', 'Facebook', 'Twitter']

const formatFollowers = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return String(value)
}

const normalizePlatform = (value: string) => value.trim().toLowerCase()

export type CreatorsDiscoveryViewProps = {
  title?: string
  subtitle?: string
  searchPlaceholder?: string
  platformPreset?: string
  hidePlatformFilter?: boolean
}

export default function CreatorsDiscoveryView({
  title = 'Creators',
  subtitle = 'Discover creators that match your campaign goals.',
  searchPlaceholder = 'Search by name, bio, or category',
  platformPreset,
  hidePlatformFilter = false,
}: CreatorsDiscoveryViewProps) {
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    platformPreset ? [platformPreset] : []
  )
  const [followerRange, setFollowerRange] = useState<[number, number]>([1000, 1000000])
  const [engagementRange, setEngagementRange] = useState<[number, number]>([1, 20])
  const [location, setLocation] = useState('')
  const [page, setPage] = useState(0)
  const [sort, setSort] = useState<'RELEVANCE' | 'FOLLOWERS' | 'ENGAGEMENT'>('RELEVANCE')
  const [showShortlistOnly, setShowShortlistOnly] = useState(false)
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([])
  const [shortlistError, setShortlistError] = useState('')
  const [compareOpen, setCompareOpen] = useState(false)
  const [inviteCreatorId, setInviteCreatorId] = useState<string | number | null>(null)
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteCampaignId, setInviteCampaignId] = useState('')
  const [defaultCampaignId, setDefaultCampaignId] = useState('')
  const [platformPresence, setPlatformPresence] = useState<PlatformPresence>('any')
  const pageSize = 20

  const { data, isLoading, error } = useCreators({
    search: search || undefined,
    category: selectedCategories.length ? selectedCategories.join(',') : undefined,
    platform: selectedPlatforms.length ? selectedPlatforms[0].toUpperCase() : undefined,
    minFollowers: followerRange[0],
    maxFollowers: followerRange[1],
    page,
    size: pageSize,
  })

  // Normalize Spring Page response: { content, totalElements, ... }
  // and map backend field names to frontend CreatorCard type
  const creatorsResponse = data as
    | { content?: any[]; totalElements?: number; totalPages?: number; items?: CreatorCard[]; total?: number }
    | CreatorCard[]
    | undefined
  const rawItems = Array.isArray(creatorsResponse)
    ? creatorsResponse
    : creatorsResponse?.content ?? creatorsResponse?.items ?? []
  const creators: CreatorCard[] = rawItems.map((item: any) => ({
    id: item.id,
    name: item.username ?? item.name ?? '',
    category: item.category,
    followers: item.followerCount ?? item.followers,
    engagementRate: item.engagementRate,
    avatarUrl: item.avatarUrl,
    portfolio: item.portfolio,
    platforms: item.platforms,
    location: item.location,
    bio: item.bio,
  }))
  const totalCreators = Array.isArray(creatorsResponse)
    ? creatorsResponse.length
    : creatorsResponse?.totalElements ?? creatorsResponse?.total ?? 0
  const { data: campaignsData } = useCampaigns({}, 0)
  const inviteMutation = useInviteCreator()
  const campaigns = campaignsData?.items ?? []
  const activeCampaignId = useMemo(
    // Shortlists are campaign-scoped in the backend, replacing the old global browser-local ID list.
    () => inviteCampaignId || defaultCampaignId || (campaigns[0]?.id ? String(campaigns[0].id) : ''),
    [campaigns, defaultCampaignId, inviteCampaignId]
  )

  useEffect(() => {
    const storedCampaign = localStorage.getItem('brand_invite_campaign')
    if (storedCampaign) {
      setDefaultCampaignId(storedCampaign)
      setInviteCampaignId(storedCampaign)
    }
  }, [])

  useEffect(() => {
    if (!activeCampaignId) {
      // Without a campaign, there is no backend shortlist scope to load from localStorage anymore.
      setShortlistedIds([])
      return
    }

    let isMounted = true
    // Load shortlist from backend on mount and campaign change, replacing localStorage.getItem.
    listsService
      .getShortlist(activeCampaignId)
      .then((response) => {
        if (isMounted) {
          setShortlistedIds(extractShortlistedCreatorIds(response))
        }
      })
      .catch((err) => {
        console.error('Failed to load backend shortlist:', err)
        if (isMounted) {
          setShortlistError('Could not load shortlist. Please try again.')
        }
      })

    return () => {
      isMounted = false
    }
  }, [activeCampaignId])

  useEffect(() => {
    if (inviteCampaignId) {
      localStorage.setItem('brand_invite_campaign', inviteCampaignId)
      setDefaultCampaignId(inviteCampaignId)
    }
  }, [inviteCampaignId])

  useEffect(() => {
    setPage(0)
  }, [search, selectedCategories, selectedPlatforms, followerRange, engagementRange, location, platformPresence])

  const filteredCreators = useMemo(() => {
    const selectedPlatformsLower = selectedPlatforms.map(normalizePlatform)
    return creators.filter((creator) => {
      const needle = search.toLowerCase()
      const matchesSearch =
        !search.trim() ||
        creator.name?.toLowerCase().includes(needle) ||
        creator.bio?.toLowerCase().includes(needle) ||
        creator.category?.toLowerCase().includes(needle)
      const engagement = creator.engagementRate ?? 0
      const matchesEngagement =
        engagement >= engagementRange[0] && engagement <= engagementRange[1]
      const matchesLocation =
        !location.trim() ||
        creator.location?.toLowerCase().includes(location.toLowerCase())
      const creatorPlatforms = (creator.platforms ?? []).map(normalizePlatform)
      const matchesPlatform =
        selectedPlatformsLower.length === 0 ||
        creatorPlatforms.some((platform) => selectedPlatformsLower.includes(platform))
      const matchesPlatformPresence =
        platformPresence === 'any' ||
        (platformPresence === 'platform-only' && creatorPlatforms.length === 1) ||
        (platformPresence === 'multi-platform' && creatorPlatforms.length > 1)
      return matchesSearch && matchesEngagement && matchesLocation && matchesPlatform && matchesPlatformPresence
    })
  }, [
    creators,
    engagementRange,
    location,
    search,
    selectedPlatforms,
    platformPresence,
  ])

  const sortedCreators = useMemo(() => {
    const list = [...filteredCreators]
    if (sort === 'FOLLOWERS') {
      return list.sort((a, b) => (b.followers ?? 0) - (a.followers ?? 0))
    }
    if (sort === 'ENGAGEMENT') {
      return list.sort((a, b) => (b.engagementRate ?? 0) - (a.engagementRate ?? 0))
    }
    return list
  }, [filteredCreators, sort])

  const visibleCreators = useMemo(() => {
    if (!showShortlistOnly) return sortedCreators
    return sortedCreators.filter((creator) => shortlistedIds.includes(String(creator.id)))
  }, [shortlistedIds, showShortlistOnly, sortedCreators])

  const shortlistedCreators = useMemo(
    () => creators.filter((creator) => shortlistedIds.includes(String(creator.id))),
    [creators, shortlistedIds]
  )

  const serverTotalPages = !Array.isArray(creatorsResponse) ? creatorsResponse?.totalPages : undefined
  const totalPages = serverTotalPages ?? Math.max(1, Math.ceil(totalCreators / pageSize))

  const toggleSelection = (value: string, list: string[], setList: (next: string[]) => void) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value))
    } else {
      setList([...list, value])
    }
  }

  const showShortlistFailure = (message: string) => {
    // Show a lightweight error toast when backend shortlist sync fails instead of silently losing localStorage data.
    setShortlistError(message)
    window.setTimeout(() => setShortlistError(''), 4000)
  }

  const handleShortlistToggle = async (creatorId: string) => {
    if (!activeCampaignId) {
      // Backend shortlists need a campaign ID, unlike the old browser-only global localStorage list.
      showShortlistFailure('Select or create a campaign before shortlisting creators.')
      return
    }

    const wasShortlisted = shortlistedIds.includes(creatorId)
    const previousShortlist = shortlistedIds
    const nextShortlist = wasShortlisted
      ? shortlistedIds.filter((item) => item !== creatorId)
      : [...shortlistedIds, creatorId]

    // Optimistically update the UI first, then persist the creator ID to the backend.
    setShortlistedIds(nextShortlist)
    setShortlistError('')

    try {
      if (wasShortlisted) {
        await listsService.removeFromShortlist(creatorId, activeCampaignId)
      } else {
        await listsService.addToShortlist(creatorId, activeCampaignId)
      }
    } catch (err) {
      console.error('Failed to sync backend shortlist:', err)
      // Revert the optimistic state because the backend, not localStorage, is now the source of truth.
      setShortlistedIds(previousShortlist)
      showShortlistFailure('Shortlist update failed. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {shortlistError && (
        <div className="fixed right-6 top-6 z-50 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {shortlistError}
        </div>
      )}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="w-full lg:w-72 space-y-6 rounded-lg border bg-white p-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
            <p className="text-xs text-slate-500">Narrow down results.</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">Category</p>
            {categories.map((category) => (
              <label key={category} className="flex items-center gap-2 text-sm text-slate-600">
                <Checkbox
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={() =>
                    toggleSelection(category, selectedCategories, setSelectedCategories)
                  }
                />
                {category}
              </label>
            ))}
          </div>

          {!hidePlatformFilter && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-600">Platform</p>
              {platforms.map((platform) => (
                <label key={platform} className="flex items-center gap-2 text-sm text-slate-600">
                  <Checkbox
                    checked={selectedPlatforms.includes(platform)}
                    onCheckedChange={() =>
                      toggleSelection(platform, selectedPlatforms, setSelectedPlatforms)
                    }
                  />
                  {platform}
                </label>
              ))}
            </div>
          )}

          {platformPreset && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-600">Platform profile</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={platformPresence === 'any' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlatformPresence('any')}
                >
                  Any
                </Button>
                <Button
                  type="button"
                  variant={platformPresence === 'platform-only' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlatformPresence('platform-only')}
                >
                  Only
                </Button>
                <Button
                  type="button"
                  variant={platformPresence === 'multi-platform' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPlatformPresence('multi-platform')}
                >
                  Multi
                </Button>
              </div>
              <p className="text-[11px] text-slate-500">
                Filter creators who focus solely on {platformPreset} or publish across platforms.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">Follower range</p>
            <Slider
              value={followerRange}
              min={1000}
              max={1000000}
              step={1000}
              onValueChange={(value) => setFollowerRange([value[0], value[1]])}
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{formatFollowers(followerRange[0])}</span>
              <span>{formatFollowers(followerRange[1])}+</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-slate-600">Engagement rate</p>
            <Slider
              value={engagementRange}
              min={1}
              max={20}
              step={1}
              onValueChange={(value) => setEngagementRange([value[0], value[1]])}
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>{engagementRange[0]}%</span>
              <span>{engagementRange[1]}%</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-600">Location</p>
            <Input
              placeholder="Search by city"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </div>
        </aside>

        <section className="flex-1 space-y-4">
          <div className="rounded-lg border bg-white p-4 space-y-3">
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as typeof sort)}
                className="h-10 rounded-lg border border-input bg-white px-3 text-sm text-slate-700 shadow-sm"
              >
                <option value="RELEVANCE">Sort: Best match</option>
                <option value="FOLLOWERS">Sort: Followers</option>
                <option value="ENGAGEMENT">Sort: Engagement</option>
              </select>
              <Button
                variant={showShortlistOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowShortlistOnly((prev) => !prev)}
              >
                <Star className="mr-2 h-4 w-4" />
                Shortlist ({shortlistedIds.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompareOpen(true)}
                disabled={shortlistedIds.length < 2}
              >
                <GitCompare className="mr-2 h-4 w-4" />
                Compare
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">
              Loading creators...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Failed to load creators. Please try again.
            </div>
          ) : visibleCreators.length === 0 ? (
            <div className="rounded-lg border bg-white p-8 text-center text-sm text-slate-500">
              No creators found. Try adjusting your filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleCreators.map((creator) => (
                <Card key={creator.id} className="flex flex-col">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={creator.avatarUrl} />
                      <AvatarFallback className="bg-purple-100 text-purple-700">
                        {(creator.name || 'CR').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{creator.name}</CardTitle>
                      {creator.category && (
                        <Badge className="mt-1 bg-slate-100 text-slate-600">
                          {creator.category}
                        </Badge>
                      )}
                    </div>
                    {shortlistedIds.includes(String(creator.id)) && (
                      <Badge className="ml-auto bg-amber-100 text-amber-700">Shortlisted</Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>{formatFollowers(creator.followers || 0)} followers</span>
                      <span>{creator.engagementRate || 0}% engagement</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {creator.location && <span>{creator.location}</span>}
                      {(creator.platforms || []).slice(0, 2).map((platform) => (
                        <Badge key={`${creator.id}-${platform}`} className="bg-slate-100 text-slate-600">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                      <p className="font-semibold text-slate-900">Decision signals</p>
                      <div className="mt-2 grid gap-2">
                        <div className="flex items-center justify-between">
                          <span>Brand fit score</span>
                          <Badge className="bg-slate-100 text-slate-500">Coming soon</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Rate card range</span>
                          <Badge className="bg-slate-100 text-slate-500">Coming soon</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Past collabs</span>
                          <Badge className="bg-slate-100 text-slate-500">Coming soon</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(creator.portfolio || []).slice(0, 3).map((image, index) => (
                        <div
                          key={`${creator.id}-portfolio-${index}`}
                          className="h-16 overflow-hidden rounded-md border bg-slate-50"
                        >
                          <img src={image} alt="Portfolio" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <div className="flex w-full gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/creators/${creator.id}`}>View Profile</Link>
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setInviteCreatorId(creator.id)
                          setInviteMessage('')
                          setInviteCampaignId(defaultCampaignId || '')
                        }}
                      >
                        Invite
                      </Button>
                    </div>
                  </CardFooter>
                  <div className="px-6 pb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center text-slate-600"
                      onClick={() => handleShortlistToggle(String(creator.id))}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      {shortlistedIds.includes(String(creator.id))
                        ? 'Remove from shortlist'
                        : 'Add to shortlist'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white px-4 py-3 text-sm text-slate-600">
            <div>
              Showing {visibleCreators.length} of {totalCreators} creators
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Prev
              </Button>
              <span className="text-xs text-slate-500">Page {page + 1} of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                disabled={page + 1 >= totalPages}
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Dialog open={inviteCreatorId !== null} onOpenChange={(open) => !open && setInviteCreatorId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Creator</DialogTitle>
            <DialogDescription>Select a campaign and add a note.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {inviteCampaignId && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-900">Selected campaign</p>
                <p>
                  {campaigns.find((campaign) => String(campaign.id) === String(inviteCampaignId))?.title || '—'}
                </p>
              </div>
            )}
            <select
              value={inviteCampaignId}
              onChange={(event) => setInviteCampaignId(event.target.value)}
              className="h-11 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select campaign</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </option>
              ))}
            </select>
            <Textarea
              value={inviteMessage}
              onChange={(event) => setInviteMessage(event.target.value)}
              placeholder="Add a personal note..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteCreatorId(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!inviteCreatorId || !inviteCampaignId) return
                inviteMutation.mutate({
                  campaignId: inviteCampaignId,
                  creatorId: inviteCreatorId,
                  message: inviteMessage.trim() || 'You are invited to this campaign.',
                })
                setInviteCreatorId(null)
              }}
              disabled={!inviteCampaignId || inviteMutation.isPending}
            >
              {inviteMutation.isPending ? 'Inviting...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={compareOpen} onOpenChange={(open) => setCompareOpen(open)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Compare shortlisted creators</DialogTitle>
            <DialogDescription>Review signals side-by-side before inviting.</DialogDescription>
          </DialogHeader>
          {shortlistedCreators.length === 0 ? (
            <div className="text-sm text-slate-500">Add creators to your shortlist to compare.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {shortlistedCreators.slice(0, 4).map((creator) => (
                <div key={`compare-${creator.id}`} className="rounded-lg border bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">{creator.name}</p>
                  <p className="text-xs text-slate-500">{creator.category}</p>
                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <p>Followers: {formatFollowers(creator.followers || 0)}</p>
                    <p>Engagement: {creator.engagementRate || 0}%</p>
                    {creator.location && <p>Location: {creator.location}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

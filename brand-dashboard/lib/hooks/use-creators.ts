import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { creatorService } from '@/lib/api/creators'

type CreatorFilters = {
  search?: string
  category?: string
  platform?: string
  minFollowers?: number
  maxFollowers?: number
  page?: number
  size?: number
}

export function useCreators(filters: CreatorFilters) {
  return useQuery({
    queryKey: ['creators', filters],
    queryFn: () =>
      creatorService.getCreators({
        search: filters.search,
        category: filters.category,
        platform: filters.platform,
        minFollowers: filters.minFollowers,
        maxFollowers: filters.maxFollowers,
        page: filters.page ?? 0,
        size: filters.size ?? 20,
      }),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}

export function useCreator(id?: string | number) {
  return useQuery({
    queryKey: ['creator', id],
    queryFn: () => creatorService.getCreatorById(id as string | number),
    enabled: !!id,
  })
}

export function useInviteCreator() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      campaignId,
      creatorId,
      message,
    }: {
      campaignId: string | number
      creatorId: string | number
      message: string
    }) => creatorService.inviteToCampaign(campaignId, creatorId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creators'] })
    },
  })
}

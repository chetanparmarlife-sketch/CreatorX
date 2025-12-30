/**
 * React Query hooks for campaigns
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { campaignService } from '@/lib/api/campaigns'
import { CampaignCreateRequest, CampaignUpdateRequest } from '@/lib/types'

export function useCampaigns(filters: Record<string, unknown> = {}, page = 0) {
  return useQuery({
    queryKey: ['campaigns', filters, page],
    queryFn: () => campaignService.getCampaigns(filters, page),
  })
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignService.getCampaignById(id),
    enabled: !!id,
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CampaignCreateRequest) => campaignService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CampaignUpdateRequest }) =>
      campaignService.updateCampaign(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign', variables.id] })
    },
  })
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => campaignService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
    },
  })
}


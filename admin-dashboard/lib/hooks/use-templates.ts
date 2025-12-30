import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { templateService } from '@/lib/api/templates'
import { CampaignTemplate } from '@/lib/types'

export function useTemplates() {
  return useQuery({
    queryKey: ['campaign-templates'],
    queryFn: () => templateService.getTemplates(),
  })
}

export function useTemplate(id?: string) {
  return useQuery({
    queryKey: ['campaign-template', id],
    queryFn: () => templateService.getTemplate(id as string),
    enabled: !!id,
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<CampaignTemplate>) => templateService.createTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-templates'] })
    },
  })
}

export function useCreateTemplateFromCampaign() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (campaignId: string) => templateService.createTemplateFromCampaign(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-templates'] })
    },
  })
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CampaignTemplate> }) =>
      templateService.updateTemplate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-templates'] })
    },
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => templateService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-templates'] })
    },
  })
}

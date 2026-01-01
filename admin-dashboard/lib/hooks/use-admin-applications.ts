import { useQuery } from '@tanstack/react-query'
import { adminApplicationsService, AdminApplicationsParams } from '@/lib/api/admin/applications'
import { AdminApplicationDTO, Page } from '@/lib/types'

export function useAdminApplications(params: AdminApplicationsParams) {
  return useQuery<Page<AdminApplicationDTO>>({
    queryKey: ['admin-applications', params],
    queryFn: () => adminApplicationsService.listApplications(params),
  })
}

export function useAdminCampaignApplications(
  campaignId: string | undefined,
  params: AdminApplicationsParams
) {
  return useQuery<Page<AdminApplicationDTO>>({
    queryKey: ['admin-campaign-applications', campaignId, params],
    queryFn: () => adminApplicationsService.listCampaignApplications(campaignId as string, params),
    enabled: !!campaignId,
  })
}

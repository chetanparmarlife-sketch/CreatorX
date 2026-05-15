import { apiClient } from '@/lib/api/client'
import { ActionQueueItem, Page, WorkspaceSummary } from '@/lib/types'

export const adminWorkspaceService = {
  async getSummary(): Promise<WorkspaceSummary> {
    return apiClient.get<WorkspaceSummary>('/admin/workspace-summary')
  },

  async getActionQueue(page = 0, size = 10): Promise<Page<ActionQueueItem>> {
    return apiClient.get<Page<ActionQueueItem>>('/admin/action-queue', {
      params: { page, size },
    })
  },
}

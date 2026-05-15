import { apiClient } from './client'
import { ActionQueueItem, Page, WorkspaceSummary } from '@/lib/types'

export const workspaceService = {
  async getSummary(): Promise<WorkspaceSummary> {
    return apiClient.get<WorkspaceSummary>('/brand/workspace-summary')
  },

  async getActionQueue(page = 0, size = 10): Promise<Page<ActionQueueItem>> {
    return apiClient.get<Page<ActionQueueItem>>('/brand/action-queue', {
      params: { page, size },
    })
  },
}

import { apiClient } from '@/lib/api/client'
import { PlatformSetting } from '@/lib/types'

export const adminSettingsService = {
  async listSettings(): Promise<PlatformSetting[]> {
    return apiClient.get<PlatformSetting[]>('/admin/settings')
  },

  async upsertSetting(setting: PlatformSetting): Promise<PlatformSetting> {
    return apiClient.put<PlatformSetting>('/admin/settings', setting)
  },
}

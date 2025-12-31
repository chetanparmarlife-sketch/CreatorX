import { apiClient } from '@/lib/api/client'

export const adminPermissionService = {
  async list(adminId: string): Promise<string[]> {
    return apiClient.get<string[]>(`/admin/permissions/${adminId}`)
  },

  async replace(adminId: string, permissions: string[]): Promise<void> {
    await apiClient.put<void>(`/admin/permissions/${adminId}`, { permissions })
  },

  async grant(adminId: string, permission: string): Promise<void> {
    await apiClient.post<void>(`/admin/permissions/${adminId}`, null, { params: { permission } })
  },

  async revoke(adminId: string, permission: string): Promise<void> {
    await apiClient.delete<void>(`/admin/permissions/${adminId}`, { params: { permission } })
  },
}

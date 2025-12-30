import { apiClient } from '@/lib/api/client'
import { AccountAppeal, AdminUser, AppealStatus, Page, UserRole, UserStatus } from '@/lib/types'

export const adminUserService = {
  async listUsers(params?: {
    role?: UserRole
    status?: UserStatus
    search?: string
    page?: number
    size?: number
  }): Promise<Page<AdminUser>> {
    return apiClient.get<Page<AdminUser>>('/admin/users', { params })
  },

  async updateStatus(userId: string, status: UserStatus, reason?: string): Promise<AdminUser> {
    return apiClient.put<AdminUser>(`/admin/users/${userId}/status`, { status, reason })
  },

  async listAppeals(params?: { status?: AppealStatus; page?: number; size?: number }): Promise<Page<AccountAppeal>> {
    return apiClient.get<Page<AccountAppeal>>('/admin/users/appeals', { params })
  },

  async resolveAppeal(appealId: string, status: AppealStatus, resolution?: string): Promise<AccountAppeal> {
    return apiClient.put<AccountAppeal>(`/admin/users/appeals/${appealId}/resolve`, { status, resolution })
  },
}

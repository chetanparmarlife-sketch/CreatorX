import { apiClient } from '@/lib/api/client'
import { BrandProfile, CreatorProfile, UserProfile } from '@/lib/types'

export const adminProfileService = {
  async updateUserProfile(userId: string, payload: { fullName?: string; phone?: string; bio?: string }): Promise<UserProfile> {
    return apiClient.put<UserProfile>(`/admin/profiles/user/${userId}`, payload)
  },

  async updateCreatorProfile(
    userId: string,
    payload: { username?: string; category?: string; instagramUrl?: string; youtubeUrl?: string; twitterUrl?: string }
  ): Promise<CreatorProfile> {
    return apiClient.put<CreatorProfile>(`/admin/profiles/creator/${userId}`, payload)
  },

  async updateBrandProfile(
    userId: string,
    payload: { companyName?: string; gstNumber?: string; industry?: string; website?: string; companyDescription?: string }
  ): Promise<BrandProfile> {
    return apiClient.put<BrandProfile>(`/admin/profiles/brand/${userId}`, payload)
  },
}

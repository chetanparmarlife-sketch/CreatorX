import { apiClient } from './client'

export type BrandProfile = {
  companyName: string
  industry: string
  website?: string
  gstNumber?: string
  logoUrl?: string
}

export type TeamMember = {
  id: string | number
  name: string
  email: string
  role: string
}

export type InvitePayload = {
  email: string
  role: string
}

export const profileService = {
  async getProfile() {
    // Backend /profile returns brand profile for brands
    return apiClient.get<BrandProfile>('/profile')
  },
  async updateProfile(payload: BrandProfile) {
    // Backend uses /profile/brand for brand updates
    return apiClient.put<BrandProfile>('/profile/brand', payload)
  },
  async uploadLogo(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    // Backend has /profile/logo alias that maps to /profile/avatar
    return apiClient.post('/profile/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  async getTeamMembers() {
    return apiClient.get<TeamMember[]>('/team-members')
  },
  async inviteTeamMember(payload: InvitePayload) {
    return apiClient.post('/team-members/invite', payload)
  },
  async removeTeamMember(id: string | number) {
    // Backend now has DELETE /team-members/{id}
    return apiClient.delete(`/team-members/${id}`)
  },
}

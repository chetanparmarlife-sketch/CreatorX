/**
 * listsService.ts
 * Manages brand creator shortlists via the backend API.
 * Replaces the old localStorage approach which was lost on browser change
 * and not visible to other team members.
 */

import { apiClient } from './client'

export type BrandCreatorList = {
  id: string | number
  name?: string
  title?: string
  count?: number
  creatorCount?: number
  totalCreators?: number
  description?: string
  campaignId?: string | number
  creatorIds?: Array<string | number>
  creators?: Array<{ id?: string | number; creatorId?: string | number }>
}

const unwrapListResponse = (response: unknown): any[] => {
  // Backend list responses replace the old localStorage array, so accept common paginated and array shapes.
  if (Array.isArray(response)) return response
  if (response && typeof response === 'object') {
    const value = response as { content?: any[]; items?: any[]; data?: any[]; lists?: any[] }
    const nestedLists = value.content ?? value.items ?? value.data ?? value.lists
    if (nestedLists) return nestedLists
    // Some shortlist endpoints return one list object directly, replacing the old localStorage ID array.
    return [response]
  }
  return []
}

export const extractShortlistedCreatorIds = (response: unknown): string[] => {
  // The backend now owns creator IDs, replacing the old browser-local shortlist ID array.
  const lists = unwrapListResponse(response)
  const directIds = lists.flatMap((item) => {
    if (typeof item === 'string' || typeof item === 'number') return [item]
    if (Array.isArray(item?.creatorIds)) return item.creatorIds
    if (Array.isArray(item?.creators)) {
      return item.creators.map((creator: any) => creator.creatorId ?? creator.id)
    }
    return item?.creatorId ?? item?.id ?? []
  })
  return Array.from(new Set(directIds.filter(Boolean).map(String)))
}

export const normalizeBrandLists = (response: unknown): BrandCreatorList[] => {
  // Lists page now renders backend lists instead of hardcoded mock cards.
  return unwrapListResponse(response)
}

export const listsService = {
  async getLists(): Promise<unknown> {
    // API client base URL already includes the backend API prefix; this calls GET /api/v1/brands/lists.
    return apiClient.get('/brands/lists')
  },

  async getShortlist(campaignId: string): Promise<unknown> {
    // Load the campaign shortlist from backend instead of localStorage.getItem.
    return apiClient.get('/brands/lists', {
      params: { campaignId },
    })
  },

  async addToShortlist(creatorId: string, campaignId: string): Promise<unknown> {
    // Persist shortlisted creator IDs on the backend instead of localStorage.setItem.
    return apiClient.post('/brands/lists/shortlist', { creatorId, campaignId })
  },

  async removeFromShortlist(creatorId: string, campaignId: string): Promise<unknown> {
    // Remove shortlisted creator IDs on the backend instead of editing localStorage.
    return apiClient.delete(`/brands/lists/shortlist/${creatorId}`, {
      params: { campaignId },
    })
  },
}

/**
 * Media Kit service - API integration for creator media kits
 */

import { apiClient } from '../client';

export interface MediaKit {
    id?: string;
    userId?: string;

    // Basic Info
    displayName?: string;
    bio?: string;
    tagline?: string;
    profileImageUrl?: string;

    // Categories
    primaryCategory?: string;
    categories?: string[];

    // Pricing Rates (in INR)
    reelRate?: number;
    storyRate?: number;
    postRate?: number;
    youtubeRate?: number;
    shortRate?: number;
    liveRate?: number;
    customRates?: Record<string, number>;

    // Social Stats
    totalFollowers?: number;
    avgEngagementRate?: number;
    socialStats?: Record<string, {
        followers?: number;
        engagementRate?: number;
        username?: string;
    }>;

    // Portfolio
    portfolioUrls?: string[];

    // Contact
    contactEmail?: string;
    city?: string;
    country?: string;

    // Visibility
    isPublic?: boolean;

    // Timestamps
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateMediaKitRequest {
    displayName?: string;
    bio?: string;
    tagline?: string;
    profileImageUrl?: string;
    primaryCategory?: string;
    categories?: string[];
    reelRate?: number;
    storyRate?: number;
    postRate?: number;
    youtubeRate?: number;
    shortRate?: number;
    liveRate?: number;
    customRates?: Record<string, number>;
    portfolioUrls?: string[];
    contactEmail?: string;
    city?: string;
    country?: string;
    isPublic?: boolean;
}

export interface UpdatePricingRequest {
    reelRate?: number;
    storyRate?: number;
    postRate?: number;
    youtubeRate?: number;
    shortRate?: number;
    liveRate?: number;
    customRates?: Record<string, number>;
}

export const mediaKitService = {
    /**
     * Get current user's media kit
     */
    async getMyMediaKit(): Promise<MediaKit | null> {
        try {
            return await apiClient.get<MediaKit>('/creators/media-kit');
        } catch (error: any) {
            if (error?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Create or update media kit
     */
    async saveMediaKit(data: UpdateMediaKitRequest): Promise<MediaKit> {
        return await apiClient.put<MediaKit>('/creators/media-kit', data);
    },

    /**
     * Update pricing rates only
     */
    async updatePricing(data: UpdatePricingRequest): Promise<MediaKit> {
        return await apiClient.patch<MediaKit>('/creators/media-kit/pricing', data);
    },

    /**
     * Refresh social stats from connected accounts
     */
    async refreshSocialStats(): Promise<MediaKit> {
        return await apiClient.post<MediaKit>('/creators/media-kit/refresh-stats');
    },

    /**
     * Toggle media kit visibility
     */
    async setVisibility(isPublic: boolean): Promise<MediaKit> {
        return await apiClient.patch<MediaKit>(`/creators/media-kit/visibility?isPublic=${isPublic}`);
    },

    /**
     * Get public media kit by creator ID
     */
    async getPublicMediaKit(creatorId: string): Promise<MediaKit | null> {
        try {
            return await apiClient.get<MediaKit>(`/creators/${creatorId}/media-kit`);
        } catch (error: any) {
            if (error?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Delete media kit
     */
    async deleteMediaKit(): Promise<void> {
        await apiClient.delete('/creators/media-kit');
    },
};

/**
 * Profile service
 */

import { apiClient } from '../client';
import {
  UserProfile,
  CreatorProfile,
  BrandProfile,
  UpdateProfileRequest,
  PortfolioItem,
  AddPortfolioItemRequest,
} from '../types';

export const profileService = {
  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    // Backend exposes /profile for creator profiles; /creators/profile is not available in this Spring Boot app.
    return await apiClient.get<UserProfile>('/profile');
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    // Backend profile save replaces AsyncStorage-only edits with a real PUT to the authenticated user profile.
    return await apiClient.put<UserProfile>('/profile', data);
  },

  /**
   * Upload avatar
   */
  async uploadAvatar(file: { uri: string; type: string; name: string }): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    // Avatar upload now goes through the backend so Supabase Storage receives the real creator image.
    return await apiClient.postFormData<{ avatarUrl: string }>('/profile/avatar', formData);
  },

  /**
   * Get portfolio items
   */
  async getPortfolio(): Promise<PortfolioItem[]> {
    return await apiClient.get<PortfolioItem[]>('/profile/portfolio');
  },

  /**
   * Add portfolio item
   */
  async addPortfolioItem(data: AddPortfolioItemRequest): Promise<PortfolioItem> {
    const formData = new FormData();
    
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('file', {
      uri: data.file.uri,
      type: data.file.type,
      name: data.file.name,
    } as any);

    return await apiClient.postFormData<PortfolioItem>('/profile/portfolio', formData);
  },
};

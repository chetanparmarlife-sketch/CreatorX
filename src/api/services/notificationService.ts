/**
 * Notification service
 */

import { apiClient } from '../client';
import { Notification, UnreadCountResponse, PaginatedResponse } from '../types';
import { transformPage } from '@/src/utils/pagination';

export const notificationService = {
  /**
   * Get notifications
   */
  async getNotifications(page = 0, size = 20): Promise<PaginatedResponse<Notification>> {
    const response = await apiClient.get<any>(
      `/notifications?page=${page}&size=${size}`
    );
    // Spring sends { content, totalElements, totalPages }; the app list reads { items, total, pages }.
    return transformPage<Notification>(response);
  },

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<void> {
    await apiClient.put(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllRead(): Promise<void> {
    await apiClient.put(`/notifications/read-all`);
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return await apiClient.get<UnreadCountResponse>('/notifications/unread-count');
  },
};

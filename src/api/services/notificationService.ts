/**
 * Notification service
 */

import { apiClient } from '../client';
import { Notification, UnreadCountResponse, PaginatedResponse } from '../types';

export const notificationService = {
  /**
   * Get notifications
   */
  async getNotifications(page = 0, size = 20): Promise<PaginatedResponse<Notification>> {
    return await apiClient.get<PaginatedResponse<Notification>>(
      `/notifications?page=${page}&size=${size}`
    );
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

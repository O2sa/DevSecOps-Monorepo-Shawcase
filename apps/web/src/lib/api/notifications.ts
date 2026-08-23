import { config } from '../config';
import { apiClient } from './client';
import { Notification } from '../../types/notification';

export const notificationsApi = {
  async getNotifications(): Promise<Notification[]> {
    return apiClient<Notification[]>(`${config.notificationServiceUrl}/api/notifications`, {
      method: 'GET',
    });
  },

  async getUnreadNotifications(): Promise<Notification[]> {
    return apiClient<Notification[]>(`${config.notificationServiceUrl}/api/notifications/unread`, {
      method: 'GET',
    });
  },

  async markAsRead(id: number): Promise<Notification> {
    return apiClient<Notification>(`${config.notificationServiceUrl}/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },
};

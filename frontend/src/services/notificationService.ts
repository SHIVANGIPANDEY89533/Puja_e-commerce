import api from './api';

export interface Notification {
  _id: string;
  user: string;
  type: 'Info' | 'Success' | 'Warning' | 'Error';
  title: string;
  message: string;
  relatedId?: string;
  resourceType?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getMyNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  clearAllNotifications: async (): Promise<{ message: string }> => {
    const response = await api.delete('/notifications/clear-all');
    return response.data;
  }
};

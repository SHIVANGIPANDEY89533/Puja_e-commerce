import api from './api';

export interface Notification {
  _id: string;
  message: string;
  relatedTicket?: string;
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

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  }
};

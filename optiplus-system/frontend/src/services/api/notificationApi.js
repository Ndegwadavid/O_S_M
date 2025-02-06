// frontend/src/services/api/notificationApi.js
import { apiClient } from './apiClient';

export const notificationApi = {
  // Get unread notifications count
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/notifications/unread/count');
      return response.data.count;
    } catch (error) {
      throw new Error('Failed to fetch unread notifications count');
    }
  },

  // Get all notifications
  getNotifications: async (limit = 50, offset = 0) => {
    try {
      const response = await apiClient.get(`/notifications?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch notifications');
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to mark notification as read');
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await apiClient.post('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      throw new Error('Failed to mark all notifications as read');
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to delete notification');
    }
  },

  // Clear all read notifications
  clearAllNotifications: async () => {
    try {
      const response = await apiClient.delete('/notifications/clear-all');
      return response.data;
    } catch (error) {
      throw new Error('Failed to clear notifications');
    }
  }
};
// frontend/src/services/api/salesApi.js
import { apiClient } from './apiClient';

export const salesApi = {
  // Create new sales order
  createSalesOrder: async (orderData) => {
    try {
      const response = await apiClient.post('/sales', orderData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create sales order');
    }
  },

  // Get order by reference number
  getOrderByReference: async (referenceNumber) => {
    try {
      const response = await apiClient.get(`/sales/reference/${referenceNumber}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch order details');
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await apiClient.patch(`/sales/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error('Failed to update order status');
    }
  },

  // Get pending collections
  getPendingCollections: async () => {
    try {
      const response = await apiClient.get('/sales/pending-collections');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch pending collections');
    }
  },

  // Get pending jobs
  getPendingJobs: async () => {
    try {
      const response = await apiClient.get('/sales/pending-jobs');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch pending jobs');
    }
  },

  // Get sales statistics
  getSalesStatistics: async (period = 'monthly') => {
    try {
      const response = await apiClient.get(`/sales/statistics?period=${period}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch sales statistics');
    }
  }
};
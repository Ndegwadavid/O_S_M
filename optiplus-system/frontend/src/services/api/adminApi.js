// frontend/src/services/api/adminApi.js
import { apiClient } from './apiClient';

export const adminApi = {
  // Get dashboard statistics
  getDashboardStats: async (timeRange = 'month') => {
    try {
      const response = await apiClient.get(`/admin/summary/stats?timeRange=${timeRange}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch dashboard statistics');
    }
  },

  // Get registration trends
  getRegistrationTrends: async () => {
    try {
      const response = await apiClient.get('/admin/trends/registration');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch registration trends');
    }
  },

  // Get sales summary
  getSalesSummary: async () => {
    try {
      const response = await apiClient.get('/admin/summary/sales');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch sales summary');
    }
  },

  // Get status summary
  getStatusSummary: async () => {
    try {
      const response = await apiClient.get('/admin/summary/status');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch status summary');
    }
  },

  // Get daily activity
  getDailyActivity: async () => {
    try {
      const response = await apiClient.get('/admin/activity/daily');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch daily activity');
    }
  },

  // Get monthly reports
  getMonthlyReport: async (month, year) => {
    try {
      const response = await apiClient.get(`/admin/reports/monthly?month=${month}&year=${year}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch monthly report');
    }
  },

  // Get client demographics
  getClientDemographics: async () => {
    try {
      const response = await apiClient.get('/admin/analytics/demographics');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch client demographics');
    }
  },

  // Get product analytics
  getProductAnalytics: async () => {
    try {
      const response = await apiClient.get('/admin/analytics/products');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch product analytics');
    }
  }
};
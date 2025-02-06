// frontend/src/services/api/clientApi.js
import { apiClient } from './apiClient';

export const clientApi = {
  // Get next available client ID
  getNextClientId: async () => {
    try {
      const response = await apiClient.get('/clients/next-id');
      return response.data;
    } catch (error) {
      throw new Error('Failed to get next client ID');
    }
  },

  // Register new client
  registerClient: async (clientData) => {
    try {
      const response = await apiClient.post('/clients', clientData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to register client');
    }
  },

  // Search clients
  searchClients: async (query) => {
    try {
      const response = await apiClient.get(`/clients/search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to search clients');
    }
  },

  // Get client by ID
  getClientById: async (id) => {
    try {
      const response = await apiClient.get(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch client details');
    }
  },

  // Get client history
  getClientHistory: async (id) => {
    try {
      const response = await apiClient.get(`/clients/${id}/history`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch client history');
    }
  }
};
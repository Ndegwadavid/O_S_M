// frontend/src/services/api/prescriptionApi.js
import { apiClient } from './apiClient';

export const prescriptionApi = {
  // Create new prescription
  createPrescription: async (prescriptionData) => {
    try {
      const response = await apiClient.post('/prescriptions', prescriptionData);
      return response.data;
    } catch (error) {
      throw new Error('Failed to save prescription');
    }
  },

  // Get prescription by ID
  getPrescriptionById: async (id) => {
    try {
      const response = await apiClient.get(`/prescriptions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch prescription');
    }
  },

  // Get prescriptions by client ID
  getClientPrescriptions: async (clientId) => {
    try {
      const response = await apiClient.get(`/prescriptions/client/${clientId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch client prescriptions');
    }
  },

  // Get latest prescription for client
  getLatestPrescription: async (clientId) => {
    try {
      const response = await apiClient.get(`/prescriptions/client/${clientId}/latest`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch latest prescription');
    }
  }
};
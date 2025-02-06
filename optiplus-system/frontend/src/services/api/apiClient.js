// frontend/src/services/api/apiClient.js
import axios from 'axios';

// Create base axios instance
export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add authentication headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 400:
          error.message = 'Bad Request';
          break;
        case 401:
          error.message = 'Unauthorized';
          break;
        case 404:
          error.message = 'Not Found';
          break;
        case 500:
          error.message = 'Internal Server Error';
          break;
        default:
          error.message = 'Something went wrong';
      }
    } else if (error.request) {
      // Request was made but no response received
      error.message = 'No response from server';
    } else {
      // Error in request configuration
      error.message = 'Error in request configuration';
    }

    return Promise.reject(error);
  }
);
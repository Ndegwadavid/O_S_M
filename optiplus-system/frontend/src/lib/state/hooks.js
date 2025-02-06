// frontend/src/lib/state/hooks.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from './store';

// Custom hooks for common query patterns
export const useCustomQuery = (key, queryFn, options = {}) => {
  return useQuery({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn,
    ...options
  });
};

// UI State hooks
export const useUIState = () => {
  const { sidebarOpen, setSidebarOpen, theme, setTheme } = useStore();
  return { sidebarOpen, setSidebarOpen, theme, setTheme };
};

// Work Context hooks
export const useWorkContext = () => {
  const { 
    currentClient, 
    setCurrentClient, 
    currentPrescription, 
    setCurrentPrescription 
  } = useStore();
  
  return { 
    currentClient, 
    setCurrentClient, 
    currentPrescription, 
    setCurrentPrescription 
  };
};
// frontend/src/lib/state/store.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // User Preferences
      theme: 'light',
      setTheme: (theme) => set({ theme }),

      // Current Work Context
      currentClient: null,
      setCurrentClient: (client) => set({ currentClient: client }),

      currentPrescription: null,
      setCurrentPrescription: (prescription) => 
        set({ currentPrescription: prescription }),

      // Clear all state
      reset: () => 
        set({
          currentClient: null,
          currentPrescription: null,
          sidebarOpen: true,
          theme: 'light'
        })
    }),
    {
      name: 'optiplus-store',
      getStorage: () => localStorage,
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen
      })
    }
  )
);
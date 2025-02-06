// frontend/src/context/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import io from 'socket.io-client';
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../services/api';  // Import from index file

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial unread count
  const { data: initialUnreadCount } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: notificationApi.getUnreadCount,
    initialData: 0
  });

  useEffect(() => {
    // Initialize Socket.IO connection
    const socketInstance = io('http://localhost:3000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity
    });

    socketInstance.on('connect', () => {
      console.log('Connected to notification service');
    });

    // Handle different types of notifications
    socketInstance.on('newClient', (data) => {
      toast.info(`New client registered: ${data.firstName} ${data.lastName}`);
      setUnreadCount(prev => prev + 1);
    });

    socketInstance.on('newPrescription', (data) => {
      toast.info(`New prescription added for client: ${data.clientId}`);
      setUnreadCount(prev => prev + 1);
    });

    socketInstance.on('newSale', (data) => {
      toast.success(`New sale order created: ${data.referenceNumber}`);
      setUnreadCount(prev => prev + 1);
    });

    socketInstance.on('saleStatusUpdate', (data) => {
      toast.info(`Order ${data.referenceNumber} status updated to: ${data.status}`);
      setUnreadCount(prev => prev + 1);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from notification service');
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Update unread count when initial data is loaded
  useEffect(() => {
    if (initialUnreadCount) {
      setUnreadCount(initialUnreadCount);
    }
  }, [initialUnreadCount]);

  // Show notification
  const showNotification = (message, type = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      default:
        toast.info(message);
    }
  };

  // Mark notifications as read
  const markAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  // Context value
  const value = {
    unreadCount,
    showNotification,
    markAsRead,
    socket
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
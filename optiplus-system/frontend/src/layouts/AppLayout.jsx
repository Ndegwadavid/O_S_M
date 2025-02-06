// frontend/src/layouts/AppLayout.jsx
import React from 'react';
import { Bell, Menu, User, Settings } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const AppLayout = ({ children }) => {
  const { unreadCount } = useNotifications();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center">
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">OptiPlus</h1>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <Settings className="h-6 w-6" />
              </button>

              {/* User menu */}
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <User className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} OptiPlus. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
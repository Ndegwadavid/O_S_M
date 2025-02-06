// frontend/src/components/Navigation.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  ClipboardList, 
  ShoppingCart, 
  BarChart2, 
  AlertCircle,
  Clock
} from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Client Registration',
      path: '/clients/register',
      icon: Users
    },
    {
      name: 'Prescriptions',
      path: '/prescriptions',
      icon: ClipboardList
    },
    {
      name: 'Sales Orders',
      path: '/sales',
      icon: ShoppingCart
    },
    {
      name: 'Pending Collections',
      path: '/pending-collections',
      icon: Clock,
      badge: true
    },
    {
      name: 'Pending Jobs',
      path: '/pending-jobs',
      icon: AlertCircle,
      badge: true
    },
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: BarChart2
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex -mb-px space-x-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  flex items-center px-1 py-4 border-b-2 text-sm font-medium
                  ${isActive(item.path)
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <Icon className="h-5 w-5 mr-2" />
                {item.name}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
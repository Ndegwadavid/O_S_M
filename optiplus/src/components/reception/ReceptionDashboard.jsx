// src/components/reception/ReceptionDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaClipboardList, FaMoneyBillWave } from 'react-icons/fa';

const ReceptionDashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Register New Client',
      description: 'Add a new client to the system',
      icon: FaUserPlus,
      path: '/reception/register',
      color: 'bg-blue-500'
    },
    {
      title: 'Pending Clients',
      description: 'View clients waiting for examination and sales',
      icon: FaClipboardList,
      path: '/reception/pending',
      color: 'bg-yellow-500'
    },
    {
      title: 'Sales History',
      description: 'View completed sales and transactions',
      icon: FaMoneyBillWave,
      path: '/reception/sales',
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reception Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="relative p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className={`${item.color} p-3 rounded-lg`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-medium text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {item.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReceptionDashboard;
// src/components/examination/ExaminationDashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserFriends, 
  FaClipboardCheck, 
  FaClock,
  FaHistory 
} from 'react-icons/fa';

const ExaminationDashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Waiting Patients',
      description: 'View patients waiting for examination',
      icon: FaUserFriends,
      path: '/examination/waiting',
      color: 'bg-yellow-500'
    },
    {
      title: "Today's Examinations",
      description: 'View completed examinations for today',
      icon: FaClipboardCheck,
      path: '/examination/today',
      color: 'bg-green-500'
    },
    {
      title: 'Patient History',
      description: 'Access patient examination records',
      icon: FaHistory,
      path: '/examination/history',
      color: 'bg-blue-500'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Examination Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className={`${item.color} p-3 rounded-lg`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaUserFriends className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm text-gray-600">Waiting Patients: 0</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaClipboardCheck className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm text-gray-600">Completed Today: 0</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaClock className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm text-gray-600">Average Wait Time: 0 min</span>
          </div>
        </div>
      </div>

      {/* Recent Examinations */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Examinations
          </h3>
        </div>
        <div className="p-4">
          <p className="text-gray-500 text-center py-4">No recent examinations</p>
        </div>
      </div>
    </div>
  );
};

export default ExaminationDashboard;
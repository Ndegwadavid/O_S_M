import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, 
  ClipboardCheckIcon, 
  ClockIcon 
} from '@heroicons/react/outline';

const ExaminationDashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Waiting Patients',
      description: 'View patients waiting for examination',
      icon: UserGroupIcon,
      path: '/examination/waiting',
      color: 'bg-yellow-500'
    },
    {
      title: 'Today\'s Examinations',
      description: 'View completed examinations for today',
      icon: ClipboardCheckIcon,
      path: '/examination/today',
      color: 'bg-green-500'
    },
    {
      title: 'Previous Records',
      description: 'Access patient examination history',
      icon: ClockIcon,
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
    </div>
  );
};

export default ExaminationDashboard;
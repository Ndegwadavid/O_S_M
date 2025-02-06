import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, BeakerIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const DepartmentSelection = () => {
  const navigate = useNavigate();

  const departments = [
    {
      name: 'Reception',
      description: 'Register clients and process sales',
      icon: UserIcon,
      path: '/login/reception',
      color: 'bg-blue-500'
    },
    {
      name: 'Examination',
      description: 'Process eye examinations',
      icon: BeakerIcon,
      path: '/login/examination',
      color: 'bg-green-500'
    },
    {
      name: 'Admin',
      description: 'View reports and manage system',
      icon: ChartBarIcon,
      path: '/login/admin',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-indigo-600">
          OptiPlus
        </h1>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Select Department
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {departments.map((dept) => (
              <button
                key={dept.name}
                onClick={() => navigate(dept.path)}
                className="w-full flex items-center justify-between px-4 py-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <div className="flex items-center">
                  <div className={`${dept.color} p-2 rounded-lg`}>
                    <dept.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 text-left">
                    <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                    <p className="text-sm text-gray-500">{dept.description}</p>
                  </div>
                </div>
                <svg className="ml-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSelection;
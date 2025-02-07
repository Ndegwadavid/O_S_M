// src/components/DepartmentSelection.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserAlt, 
  FaMicroscope, 
  FaChartBar 
} from 'react-icons/fa';

const DepartmentSelection = () => {
  const navigate = useNavigate();

  const departments = [
    {
      id: 'reception',
      name: 'Reception',
      description: 'Register new clients and process sales',
      icon: FaUserAlt,
      path: '/login/reception',
      color: 'bg-blue-500'
    },
    {
      id: 'examination',
      name: 'Examination',
      description: 'Conduct eye examinations',
      icon: FaMicroscope,
      path: '/login/examination',
      color: 'bg-green-500'
    },
    {
      id: 'admin',
      name: 'Admin',
      description: 'Monitor operations and view analytics',
      icon: FaChartBar,
      path: '/login/admin',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-600">OptiPlus</h1>
          <p className="mt-2 text-lg text-gray-600">Optical Shop Management System</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => navigate(dept.path)}
              className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className={`${dept.color} p-3 rounded-full`}>
                  <dept.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {dept.name}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {dept.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentSelection;
// src/components/reception/PendingClients.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaClock, FaCheckCircle, FaUser } from 'react-icons/fa';

const PendingClients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState({
    waiting: [],
    examined: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/clients/pending');
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
    // Refresh every 30 seconds
    const interval = setInterval(fetchClients, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSalesClick = (clientId) => {
    navigate(`/reception/sales/${clientId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Waiting for Examination */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaClock className="h-5 w-5 text-yellow-500 mr-2" />
          Waiting for Examination
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.waiting.map((client) => (
            <div key={client.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{`${client.first_name} ${client.last_name}`}</p>
                  <p className="text-sm text-gray-500">{client.reg_number}</p>
                  <p className="text-sm text-gray-500">{client.phone}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  Waiting
                </span>
              </div>
            </div>
          ))}
          {clients.waiting.length === 0 && (
            <div className="col-span-full text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No clients waiting for examination</p>
            </div>
          )}
        </div>
      </div>

      {/* Ready for Sales */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <FaCheckCircle className="h-5 w-5 text-green-500 mr-2" />
          Ready for Sales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.examined.map((client) => (
            <div 
              key={client.id} 
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleSalesClick(client.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{`${client.first_name} ${client.last_name}`}</p>
                  <p className="text-sm text-gray-500">{client.reg_number}</p>
                  <p className="text-sm text-gray-500">{client.phone}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                  Examined
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSalesClick(client.id);
                }}
                className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Process Sale
              </button>
            </div>
          ))}
          {clients.examined.length === 0 && (
            <div className="col-span-full text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No clients ready for sales</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaUser className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm text-gray-600">
              Total Waiting: {clients.waiting.length}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaCheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm text-gray-600">
              Ready for Sales: {clients.examined.length}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <FaClock className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm text-gray-600">
              Average Wait Time: ~20 min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingClients;
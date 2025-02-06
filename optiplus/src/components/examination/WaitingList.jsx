import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const WaitingList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWaitingClients = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/examination/waiting');
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching waiting clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWaitingClients();
    const interval = setInterval(fetchWaitingClients, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Waiting Patients</h2>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
          {clients.length} Waiting
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client) => (
          <div 
            key={client.id}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/examination/prescription/${client.id}`)}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {client.first_name} {client.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{client.reg_number}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                  Waiting
                </span>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Phone: {client.phone}</p>
                {client.previous_rx && (
                  <p className="mt-2">
                    <span className="font-medium">Previous RX:</span>
                    <br />
                    {client.previous_rx}
                  </p>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/examination/prescription/${client.id}`);
                }}
                className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Start Examination
              </button>
            </div>
          </div>
        ))}

        {clients.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No patients waiting for examination</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingList;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CalendarIcon, UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/outline';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalClients: 0,
    pendingJobs: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [clientsRes, metricsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/clients/analytics'),
        axios.get('http://localhost:5000/api/clients/metrics')
      ]);

      setAnalyticsData(clientsRes.data);
      setMetrics(metricsRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
          <UserGroupIcon className="h-8 w-8 text-blue-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Total Clients</p>
            <p className="text-2xl font-bold">{metrics.totalClients}</p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
          <CalendarIcon className="h-8 w-8 text-yellow-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Pending Jobs</p>
            <p className="text-2xl font-bold">{metrics.pendingJobs}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
          <CurrencyDollarIcon className="h-8 w-8 text-green-500 mr-3" />
          <div>
            <p className="text-sm text-gray-500">Monthly Revenue</p>
            <p className="text-2xl font-bold">${metrics.monthlyRevenue}</p>
          </div>
        </div>
      </div>

      {/* Client Registration Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Client Registrations</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                label={{ 
                  value: 'Month', 
                  position: 'insideBottom', 
                  offset: -10 
                }}
              />
              <YAxis
                label={{ 
                  value: 'Clients', 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="newClients" 
                name="New Clients" 
                fill="#3B82F6" 
              />
              <Bar 
                dataKey="completedOrders" 
                name="Completed Orders" 
                fill="#10B981" 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
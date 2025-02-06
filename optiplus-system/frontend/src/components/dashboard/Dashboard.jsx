// frontend/src/components/dashboard/Dashboard.jsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, TrendingUp, Users, ShoppingBag, AlertCircle } from 'lucide-react';
import { adminApi, salesApi } from '../../services/api';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          <Icon className="h-6 w-6 text-blue-500" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('month');

  // Fetch dashboard statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboardStats', timeRange],
    queryFn: () => adminApi.getDashboardStats(timeRange)
  });

  // Fetch registration trends
  const { data: registrationTrends } = useQuery({
    queryKey: ['registrationTrends'],
    queryFn: adminApi.getRegistrationTrends
  });

  // Fetch sales trends
  const { data: salesTrends } = useQuery({
    queryKey: ['salesTrends', timeRange],
    queryFn: () => salesApi.getSalesStatistics(timeRange)
  });

  // Fetch pending orders
  const { data: pendingOrders } = useQuery({
    queryKey: ['pendingOrders'],
    queryFn: salesApi.getPendingCollections
  });

  if (isLoadingStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="New Clients"
          value={stats?.newClients || 0}
          icon={Users}
          trend={stats?.clientsTrend}
        />
        <StatCard
          title="Total Sales"
          value={`KSH ${stats?.totalSales?.toLocaleString() || 0}`}
          icon={ShoppingBag}
          trend={stats?.salesTrend}
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders?.length || 0}
          icon={AlertCircle}
        />
        <StatCard
          title="Revenue Growth"
          value={`${stats?.revenueGrowth || 0}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Client Registration Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationTrends?.trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  name="New Registrations"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrends?.data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#3b82f6" name="Sales Amount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {pendingOrders?.slice(0, 5).map((order) => (
              <div key={order.id} className="py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{order.referenceNumber}</p>
                    <p className="text-sm text-gray-600">
                      {order.firstName} {order.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">KSH {order.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(order.deliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
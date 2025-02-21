// AdminDashboard.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Line, Bar, Doughnut, Pie } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from "chart.js";
import { 
  UserPlusIcon, 
  MapPinIcon, 
  CalendarIcon, 
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
);

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  phoneNumber: string;
  emailAddress: string;
  dateOfBirth: string;
  areaOfResidence: string;
  previousRx: string;
  servedBy: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [timeFrame, setTimeFrame] = useState<"week" | "month" | "year">("month");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchClients() {
      try {
        const response = await fetch("/api/clients");
        if (response.ok) {
          const data = await response.json();
          setClients(data);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (status === "authenticated") {
      fetchClients();
    }
  }, [status]);

  // Filtered clients based on search term
  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      `${client.firstName} ${client.lastName} ${client.registrationNumber} ${client.emailAddress} ${client.phoneNumber}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  // Client growth data calculation
  const getClientGrowthData = () => {
    const monthlyData = clients.reduce((acc, client) => {
      const date = new Date(client.created_at);
      const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedMonths = Object.keys(monthlyData).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    let cumulative = 0;
    const cumulativeData = sortedMonths.map(month => {
      cumulative += monthlyData[month];
      return cumulative;
    });

    return {
      labels: sortedMonths,
      datasets: [{
        label: 'Total Clients',
        data: cumulativeData,
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderColor: 'rgb(99, 102, 241)',
        tension: 0.4
      }]
    };
  };

  // Age distribution calculation
  const getAgeDistributionData = () => {
    const ageGroups = {
      'Under 18': 0,
      '18-30': 0,
      '31-45': 0,
      '46-60': 0,
      'Over 60': 0
    };

    clients.forEach(client => {
      const age = new Date().getFullYear() - new Date(client.dateOfBirth).getFullYear();
      if (age < 18) ageGroups['Under 18']++;
      else if (age <= 30) ageGroups['18-30']++;
      else if (age <= 45) ageGroups['31-45']++;
      else if (age <= 60) ageGroups['46-60']++;
      else ageGroups['Over 60']++;
    });

    return {
      labels: Object.keys(ageGroups),
      datasets: [{
        data: Object.values(ageGroups),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ]
      }]
    };
  };

  // Residential area distribution
  const getResidentialDistributionData = () => {
    const areaData = clients.reduce((acc, client) => {
      acc[client.areaOfResidence] = (acc[client.areaOfResidence] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      labels: Object.keys(areaData),
      datasets: [{
        data: Object.values(areaData),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(147, 51, 234, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(248, 113, 113, 0.8)',
        ]
      }]
    };
  };

  // Handle client deletion
  const handleDeleteClients = async () => {
    if (!selectedClients.length || !confirm('Are you sure you want to delete the selected clients?')) {
      return;
    }

    try {
      const response = await fetch("/api/clients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedClients }),
      });

      if (response.ok) {
        setClients(prevClients => 
          prevClients.filter(client => !selectedClients.includes(client.id))
        );
        setSelectedClients([]);
      }
    } catch (error) {
      console.error("Error deleting clients:", error);
    }
  };

  // Handle CSV export
  const handleExportCSV = () => {
    const headers = [
      "Registration Number",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Date of Birth",
      "Area of Residence",
      "Previous Rx",
      "Registration Date"
    ].join(",");

    const csvData = filteredClients.map(client => [
      client.registrationNumber,
      client.firstName,
      client.lastName,
      client.emailAddress || "N/A",
      client.phoneNumber,
      client.dateOfBirth,
      client.areaOfResidence,
      client.previousRx || "N/A",
      new Date(client.created_at).toLocaleDateString()
    ].join(",")).join("\n");

    const csv = `${headers}\n${csvData}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optiplus_clients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (status === "loading" || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (status === "unauthenticated") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800">Access Denied</h2>
            <p className="mt-2 text-gray-600">Please log in to access the admin dashboard.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeFrame("week")}
              className={`px-3 py-1 rounded-md ${
                timeFrame === "week" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeFrame("month")}
              className={`px-3 py-1 rounded-md ${
                timeFrame === "month" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeFrame("year")}
              className={`px-3 py-1 rounded-md ${
                timeFrame === "year" 
                  ? "bg-indigo-600 text-white" 
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <UserPlusIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Clients</p>
                <p className="text-2xl font-semibold">{clients.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPinIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Geograaphical distribution</p>
                <p className="text-2xl font-semibold">
                  {new Set(clients.map(c => c.areaOfResidence)).size}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Previous Rx</p>
                <p className="text-2xl font-semibold">
                  {clients.filter(c => c.previousRx).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <BuildingOfficeIcon className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Branch</p>
                <p className="text-2xl font-semibold">Moi Avenue</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Growth */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Client Growth</h2>
            <div className="h-[300px]">
              <Line 
                data={getClientGrowthData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.05)'
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>

          {/* Age Distribution */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Age Distribution</h2>
            <div className="h-[300px]">
              <Pie 
                data={getAgeDistributionData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </Card>

          {/* Residential Distribution */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Residential Areas</h2>
            <div className="h-[300px]">
              <Doughnut 
                data={getResidentialDistributionData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  },
                  cutout: '70%'
                }}
              />
            </div>
          </Card>

          {/* Recent Registrations */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Recent Registrations</h2>
            <div className="space-y-4">
              {clients
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map(client => (
                  <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-indigo-100 rounded-full">
                        <span className="text-indigo-600 font-medium">
                          {client.firstName[0]}{client.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{client.firstName} {client.lastName}</p>
                        <p className="text-sm text-gray-500">{client.registrationNumber}</p>
                      </div>
                    </div>
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* Client Management Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Client Management</h2>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              {selectedClients.length > 0 && (
                <button
                  onClick={handleDeleteClients}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedClients.length})
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clients by name, email, phone, or registration number..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Clients Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                      onChange={(e) => setSelectedClients(e.target.checked ? filteredClients.map(c => c.id) : [])}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration No
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Area
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(client.id)}
                        onChange={() => {
                          setSelectedClients(prev =>
                            prev.includes(client.id)
                              ? prev.filter(id => id !== client.id)
                              : [...prev, client.id]
                          );
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {client.firstName} {client.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{client.registrationNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{client.emailAddress || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{client.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{client.areaOfResidence}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(client.dateOfBirth).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(client.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                      No clients found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
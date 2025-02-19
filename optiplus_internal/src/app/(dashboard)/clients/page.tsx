"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  phoneNumber: string;
  dateOfBirth: string;
  areaOfResidence: string;
  servedBy: string;
  created_at: string;
}

export default function ClientsPage() {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchClients() {
      const response = await fetch("/api/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        console.error("Failed to fetch clients:", await response.text());
      }
    }
    fetchClients();
  }, []);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Please log in to access this page.</div>;

  const filteredClients = clients.filter(client =>
    client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 p-6">
        <h1 className="text-4xl font-extrabold text-purple-800 mb-8 text-center drop-shadow-md">Clients Overview - OptiPlus</h1>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clients by name, reg number, or phone..."
            className="w-full max-w-md p-4 rounded-xl border-none focus:outline-none focus:ring-4 focus:ring-purple-300 backdrop-blur-sm bg-white/80 shadow-lg"
          />
        </div>

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredClients.map(client => (
            <Link
              key={client.id}
              href={`/clients/${client.id}?client=${client.firstName.toLowerCase()}_${client.lastName.toLowerCase()}`}
              className="bg-white/70 backdrop-blur-lg rounded-xl shadow-glass p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
            >
              <h3 className="text-xl font-bold text-gray-900">{client.firstName} {client.lastName}</h3>
              <p className="text-sm text-gray-600">Reg No: {client.registrationNumber}</p>
              <p className="text-sm text-gray-600">Phone: {client.phoneNumber}</p>
              <p className="text-sm text-gray-500">DOB: {new Date(client.dateOfBirth).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">Area: {client.areaOfResidence}</p>
              <p className="text-sm text-gray-500">Served By: {client.servedBy}</p>
            </Link>
          ))}
          {filteredClients.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">No clients found.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
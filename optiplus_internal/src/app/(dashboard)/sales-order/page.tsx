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
  created_at: string;
}

interface Examination {
  prescription: {
    rightSphere?: string;
    rightCylinder?: string;
    rightAxis?: string;
    rightAdd?: string;
    rightVA?: string;
    rightIPD?: string;
    leftSphere?: string;
    leftCylinder?: string;
    leftAxis?: string;
    leftAdd?: string;
    leftVA?: string;
    leftIPD?: string;
  };
  clinicalHistory?: string;
}

export default function SalesOrderPage() {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [examinations, setExaminations] = useState<Record<number, Examination>>({});

  useEffect(() => {
    async function fetchClients() {
      const response = await fetch("/api/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data);

        // Fetch examinations for each client
        const exams: Record<number, Examination> = {};
        for (const client of data) {
          const examResponse = await fetch(`/api/examinations?clientId=${client.id}`);
          if (examResponse.ok) {
            const examData = await examResponse.json();
            if (examData.length > 0) {
              exams[client.id] = examData[0]; // Assuming latest exam
            }
          }
        }
        setExaminations(exams);
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Sales Order - OptiPlus</h1>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, registration number, or phone..."
            className="w-full md:w-1/2 lg:w-1/3 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-sm bg-white/70"
          />
        </div>

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredClients.map(client => {
            const exam = examinations[client.id];
            return (
              <Link
                key={client.id}
                href={`/sales-order/client?client=${client.firstName.toLowerCase()}_${client.lastName.toLowerCase()}`}
                className="bg-white/80 backdrop-blur-lg rounded-lg shadow-glass p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-800">{client.firstName} {client.lastName}</h3>
                <p className="text-sm text-gray-600">Reg No: {client.registrationNumber}</p>
                <p className="text-sm text-gray-600">Phone: {client.phoneNumber}</p>
                <p className="text-sm text-gray-500">Registered: {new Date(client.created_at).toLocaleDateString()}</p>
                {exam?.prescription && (
                  <p className="text-xs text-indigo-600 mt-2">Latest Prescription: R SPH {exam.prescription.rightSphere || "N/A"}, L SPH {exam.prescription.leftSphere || "N/A"}</p>
                )}
              </Link>
            );
          })}
          {filteredClients.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">No clients found.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
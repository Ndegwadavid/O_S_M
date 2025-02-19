"use client"; // Mark this as a Client Component

import { useState } from "react";
import { useSession } from "next-auth/react";
import RegistrationForm from "@/components/client/RegistrationForm";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ClientList from "@/components/client/ClientList";

export default function ReceptionPage() {
  const { data: session, status } = useSession();
  const [successMessage, setSuccessMessage] = useState("");

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Please log in to access this page.</div>;

  const handleClientRegistered = (registrationNumber: string) => {
    setSuccessMessage(`Client registered successfully. Registration Number: ${registrationNumber}. Proceed to examination.`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Reception - OptiPlus</h1>
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 rounded-lg text-green-700 shadow-md backdrop-blur-sm">
            <p className="font-medium">{successMessage}</p>
          </div>
        )}
        <div className="bg-white/80 backdrop-blur-lg rounded-lg shadow-glass p-6">
          <RegistrationForm onSuccess={handleClientRegistered} />
        </div>
        <div className="mt-6 bg-white/80 backdrop-blur-lg rounded-lg shadow-glass p-6">
          <ClientList />
        </div>
      </div>
    </DashboardLayout>
  );
}
"use client";
import { useEffect, useState } from "react";

export default function ClientList() {
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    async function fetchClients() {
      const response = await fetch("/api/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    }
    fetchClients();
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Recently Registered Clients</h2>
      <div className="bg-white p-4 rounded-lg shadow-md backdrop-blur-sm bg-white/70">
        {clients.length > 0 ? (
          <ul className="space-y-4">
            {clients.map((client) => (
              <li key={client.id} className="p-3 border-b border-gray-200">
                {client.firstName} {client.lastName} - {client.registrationNumber}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No clients registered yet.</p>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  registrationNumber: string;
  phoneNumber: string;
  created_at: string;
}

interface Prescription {
  rightSphere?: string; // Optional fields
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
}

export default function ExaminationPage() {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [prescription, setPrescription] = useState<Prescription>({
    rightSphere: "", rightCylinder: "", rightAxis: "", rightAdd: "", rightVA: "", rightIPD: "",
    leftSphere: "", leftCylinder: "", leftAxis: "", leftAdd: "", leftVA: "", leftIPD: "",
  });
  const [clinicalHistory, setClinicalHistory] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setPrescription({
      rightSphere: "", rightCylinder: "", rightAxis: "", rightAdd: "", rightVA: "", rightIPD: "",
      leftSphere: "", leftCylinder: "", leftAxis: "", leftAdd: "", leftVA: "", leftIPD: "",
    });
    setClinicalHistory("");
    setSuccessMessage("");
  };

  const handlePrescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPrescription(prev => ({ ...prev, [name]: value || undefined })); // Allow empty strings to be undefined
  };

  const handleClinicalHistoryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setClinicalHistory(e.target.value);
  };

  const handleSave = async () => {
    if (!selectedClient) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/examinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          prescription: Object.fromEntries(
            Object.entries(prescription).filter(([_, value]) => value !== undefined && value !== "")
          ), // Filter out empty/undefined values
          clinicalHistory: clinicalHistory || null, // Allow empty clinical history
          registrationNumber: selectedClient.registrationNumber,
        }),
      });

      if (!response.ok) throw new Error("Failed to save examination");

      setSuccessMessage("Patient records saved successfully!");
      setTimeout(() => setSuccessMessage(""), 5000); // Auto-hide after 5 seconds
      setSelectedClient(null); // Clear selection after saving
    } catch (error) {
      setSuccessMessage("Error saving patient records. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedClient(null);
    setSuccessMessage("");
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 relative">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Examination - OptiPlus</h1>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, registration number, or phone..."
            className="w-full md:w-1/2 lg:w-1/3 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm bg-white/70"
          />
        </div>

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {filteredClients.map(client => (
            <div
              key={client.id}
              onClick={() => handleClientSelect(client)}
              className="bg-white/80 backdrop-blur-lg rounded-lg shadow-glass p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-800">{client.firstName} {client.lastName}</h3>
              <p className="text-sm text-gray-600">Reg No: {client.registrationNumber}</p>
              <p className="text-sm text-gray-600">Phone: {client.phoneNumber}</p>
              <p className="text-sm text-gray-500">Registered: {new Date(client.created_at).toLocaleDateString()}</p>
            </div>
          ))}
          {filteredClients.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">No clients found.</p>
          )}
        </div>

        {/* Overlay for Selected Client */}
        {selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/80 backdrop-blur-lg rounded-lg shadow-glass p-6 w-full max-w-2xl mx-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Examine: {selectedClient.firstName} {selectedClient.lastName}</h2>

              {/* Prescription Table */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">New Glass Prescription</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border-b border-gray-300 p-2 text-left">Eye</th>
                      <th className="border-b border-gray-300 p-2 text-left">SPH</th>
                      <th className="border-b border-gray-300 p-2 text-left">CYL</th>
                      <th className="border-b border-gray-300 p-2 text-left">AXIS</th>
                      <th className="border-b border-gray-300 p-2 text-left">ADD</th>
                      <th className="border-b border-gray-300 p-2 text-left">V/A</th>
                      <th className="border-b border-gray-300 p-2 text-left">IPD</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-b border-gray-300 p-2">Right (R)</td>
                      <td className="border-b border-gray-300 p-2"><input type="text" name="rightSphere" value={prescription.rightSphere || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="border-b border-gray-300 p-2"><input type="text" name="rightCylinder" value={prescription.rightCylinder || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="border-b border-gray-300 p-2"><input type="text" name="rightAxis" value={prescription.rightAxis || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="border-b border-gray-300 p-2"><input type="text" name="rightAdd" value={prescription.rightAdd || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="border-b border-gray-300 p-2"><input type="text" name="rightVA" value={prescription.rightVA || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="border-b border-gray-300 p-2"><input type="text" name="rightIPD" value={prescription.rightIPD || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                    </tr>
                    <tr>
                      <td className="border-b border-gray-300 p-2">Left (L)</td>
                      <td className="border-b border-gray-300 p-2"><input type="text" name="leftSphere" value={prescription.leftSphere || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="border-b border-gray-300 p-2"><input type="text" name="leftCylinder" value={prescription.leftCylinder || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="border-b border-gray-300 p-2"><input type="text" name="leftAxis" value={prescription.leftAxis || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="border-b border-gray-300 p-2"><input type="text" name="leftAdd" value={prescription.leftAdd || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="border-b border-gray-300 p-2"><input type="text" name="leftVA" value={prescription.leftVA || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="border-b border-gray-300 p-2"><input type="text" name="leftIPD" value={prescription.leftIPD || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Clinical History */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinical History</label>
                <textarea
                  value={clinicalHistory}
                  onChange={handleClinicalHistoryChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm bg-white/70"
                  rows={4}
                  placeholder="Enter clinical history (optional)..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Record"}
                </button>
              </div>

              {successMessage && (
                <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 rounded-lg text-green-700 shadow-md animate-pulse">
                  <p className="font-medium">{successMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
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
  hasExam?: boolean; // Added to track examination status
}

interface Prescription {
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
}

export default function ExaminationPage() {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [prescription, setPrescription] = useState<Prescription>({});
  const [clinicalHistory, setClinicalHistory] = useState("");
  const [examinedBy, setExaminedBy] = useState(""); // Ensure this is included
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchClients() {
      const clientsResponse = await fetch("/api/clients");
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setClients(clientsData);

        const exams: Record<number, any> = {};
        for (const client of clientsData) {
          const examResponse = await fetch(`/api/examinations?clientId=${client.id}`);
          if (examResponse.ok) {
            const examData = await examResponse.json();
            if (examData.length > 0) {
              exams[client.id] = examData[0];
            }
          }
        }
        setClients(clientsData.map((client: Client) => ({
          ...client,
          hasExam: !!exams[client.id]
        })));
      } else {
        console.error("Failed to fetch clients:", await clientsResponse.text());
      }
    }
    fetchClients();
  }, []);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Please log in to access this page.</div>;

  const filteredClients = clients.filter(client => {
    const hasExam = client.hasExam;
    const matchesSearch = 
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "pending") return matchesSearch && !hasExam;
    if (filter === "completed") return matchesSearch && hasExam;
    return false;
  });

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setPrescription({});
    setClinicalHistory("");
    setExaminedBy(session?.user?.name || ""); // Default to logged-in user
    setSuccessMessage("");
  };

  const handlePrescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPrescription(prev => ({ ...prev, [name]: value || undefined }));
  };

  const handleClinicalHistoryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setClinicalHistory(e.target.value || "");
  };

  const handleExaminedByChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExaminedBy(e.target.value || "");
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
          prescription,
          clinicalHistory,
          registrationNumber: selectedClient.registrationNumber,
          examinedBy, // Included in payload
        }),
      });

      if (!response.ok) throw new Error("Failed to save examination");

      setSuccessMessage("Examination record saved successfully!");
      setSelectedClient(null);
      const clientsResponse = await fetch("/api/clients");
      if (clientsResponse.ok) {
        const updatedClients = await clientsResponse.json();
        setClients(updatedClients.map((client: Client) => ({
          ...client,
          hasExam: client.id === selectedClient.id ? true : clients.find(c => c.id === client.id)?.hasExam
        })));
      }
    } catch (error) {
      setSuccessMessage("Error saving examination record. Please try again.");
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Examination - OptiPlus</h1>

        {/* Filter Options */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg ${filter === "all" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"} hover:bg-indigo-500`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg ${filter === "pending" ? "bg-yellow-600 text-white" : "bg-gray-200 text-gray-700"} hover:bg-yellow-500`}
          >
            Pending Examination
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg ${filter === "completed" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"} hover:bg-green-500`}
          >
            Completed Examination
          </button>
        </div>

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
          {filteredClients.map(client => {
            const isCompleted = client.hasExam;

            return (
              <div
                key={client.id}
                onClick={() => handleClientSelect(client)}
                className={`bg-white/80 backdrop-blur-lg rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                  isCompleted ? "border-2 border-green-500 shadow-lg" : "border border-gray-300"
                } hover:shadow-md`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{client.firstName} {client.lastName}</h3>
                    <p className="text-sm text-gray-600">Reg No: {client.registrationNumber}</p>
                    <p className="text-sm text-gray-600">Phone: {client.phoneNumber}</p>
                    <p className="text-sm text-gray-500">Registered: {new Date(client.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isCompleted ? "bg-green-200 text-green-800" : "bg-yellow-200 text-yellow-800"
                  }`}>
                    {isCompleted ? "Completed" : "Pending"}
                  </span>
                </div>
                {isCompleted && (
                  <div className="mt-2 flex items-center text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Completed
                  </div>
                )}
              </div>
            );
          })}
          {filteredClients.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">No clients found.</p>
          )}
        </div>

        {/* Examination Form */}
        {selectedClient && (
          <div className="mt-8 bg-white/80 backdrop-blur-lg rounded-lg shadow-glass p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Examine: {selectedClient.firstName} {selectedClient.lastName}</h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">New Glass Prescription</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-indigo-100">
                      <th className="p-3 text-left text-sm font-semibold text-gray-800">Eye</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-800">SPH</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-800">CYL</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-800">AXIS</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-800">ADD</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-800">V/A</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-800">IPD</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 text-gray-700">Right (R)</td>
                      <td className="p-3"><input type="text" name="rightSphere" value={prescription.rightSphere || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="p-3"><input type="text" name="rightCylinder" value={prescription.rightCylinder || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="p-3"><input type="text" name="rightAxis" value={prescription.rightAxis || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="p-3"><input type="text" name="rightAdd" value={prescription.rightAdd || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="p-3"><input type="text" name="rightVA" value={prescription.rightVA || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="p-3"><input type="text" name="rightIPD" value={prescription.rightIPD || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 text-gray-700">Left (L)</td>
                      <td className="p-3"><input type="text" name="leftSphere" value={prescription.leftSphere || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="p-3"><input type="text" name="leftCylinder" value={prescription.leftCylinder || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="p-3"><input type="text" name="leftAxis" value={prescription.leftAxis || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="p-3"><input type="text" name="leftAdd" value={prescription.leftAdd || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="p-3"><input type="text" name="leftVA" value={prescription.leftVA || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                      <td className="p-3"><input type="text" name="leftIPD" value={prescription.leftIPD || ""} onChange={handlePrescriptionChange} className="w-full p-1 border border-gray-300 rounded" placeholder="Optional" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

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

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Examined By</label>
              <input
                type="text"
                value={examinedBy}
                onChange={handleExaminedByChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm bg-white/70"
                placeholder="Enter examiner's name"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Record"}
            </button>
            <button
              onClick={handleClose}
              className="ml-4 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>

            {successMessage && (
              <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 rounded-lg text-green-700 shadow-md">
                <p className="font-medium">{successMessage}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
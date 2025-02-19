"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
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

interface Examination {
  prescription?: {
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
  status?: "Pending Examination" | "Completed Examination";
  created_at?: string;
}

interface Sale {
  framesBrand?: string;
  framesModel?: string;
  framesColor?: string;
  framesQuantity?: number;
  framesAmount?: number;
  lensesBrand?: string;
  lensesModel?: string;
  lensesColor?: string;
  lensesQuantity?: number;
  lensesAmount?: number;
  totalAmount?: number;
  advancePaid?: number;
  balance?: number;
  fittingInstructions?: string;
  orderBookedBy?: string;
  deliveryDate?: string;
  referenceNumber?: string;
  collectionStatus?: "Pending Collection" | "Collected";
  created_at?: string;
}

export default function ClientDetailsPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const clientParam = searchParams.get("client");
  const [client, setClient] = useState<Client | null>(null);
  const [examination, setExamination] = useState<Examination | null>(null);
  const [sale, setSale] = useState<Sale | null>(null);
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchClient() {
      if (clientParam) {
        const [firstName, lastName] = clientParam.split("_");
        const response = await fetch(`/api/clients?firstName=${firstName}&lastName=${lastName}`);
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            setClient(data[0]);

            // Fetch examination
            const examResponse = await fetch(`/api/examinations?clientId=${data[0].id}`);
            if (examResponse.ok) {
              const examData = await examResponse.json();
              setExamination(examData.length > 0 ? examData[0] : null);
            }

            // Fetch sale
            const saleResponse = await fetch(`/api/sales-orders?clientId=${data[0].id}`);
            if (saleResponse.ok) {
              const saleData = await saleResponse.json();
              setSale(saleData.length > 0 ? saleData[0] : null);
            }
          }
        }
      }
    }
    fetchClient();
  }, [clientParam]);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Please log in to access this page.</div>;
  if (!client) return <div>Client not found.</div>;

  const handleUpdateCollectionStatus = async (newStatus: "Pending Collection" | "Collected") => {
    if (!sale) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/sales-orders/${client.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionStatus: newStatus }),
      });

      if (response.ok) {
        setSale(prev => prev ? { ...prev, collectionStatus: newStatus } : null);
        setSuccessMessage(`Collection status updated to ${newStatus}.`);
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setSuccessMessage("Error updating collection status.");
      }
    } catch (error) {
      setSuccessMessage("Error updating collection status. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBalance = async () => {
    if (newBalance === null || !sale) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/sales-orders/${client.id}/balance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: newBalance }),
      });

      if (response.ok) {
        setSale(prev => prev ? { ...prev, balance: newBalance } : null);
        setNewBalance(null);
        setSuccessMessage("Balance updated successfully.");
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setSuccessMessage("Error updating balance.");
      }
    } catch (error) {
      setSuccessMessage("Error updating balance. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Visualize History
  const history = [
    { type: "Registration", date: client.created_at, details: `Registered by ${client.servedBy}` },
    ...(examination?.created_at ? [{ type: "Examination", date: examination.created_at, details: examination.status || "Completed" }] : []),
    ...(sale?.created_at ? [{ type: "Sale", date: sale.created_at, details: `Ref: ${sale.referenceNumber}, Status: ${sale.collectionStatus}` }] : []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 p-6">
        <h1 className="text-4xl font-extrabold text-purple-800 mb-8">Client Details - {client.firstName} {client.lastName}</h1>

        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-glass p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="text-lg text-gray-700"><strong>Registration No:</strong> {client.registrationNumber}</p>
            <p className="text-lg text-gray-700"><strong>Phone:</strong> {client.phoneNumber}</p>
            <p className="text-lg text-gray-700"><strong>DOB:</strong> {new Date(client.dateOfBirth).toLocaleDateString()}</p>
            <p className="text-lg text-gray-700"><strong>Area:</strong> {client.areaOfResidence}</p>
            <p className="text-lg text-gray-700"><strong>Served By:</strong> {client.servedBy}</p>
          </div>

          {examination?.prescription && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Prescription</h2>
              <p className="text-lg text-indigo-600">Right: SPH {examination.prescription.rightSphere || "N/A"}, CYL {examination.prescription.rightCylinder || "N/A"}</p>
              <p className="text-lg text-indigo-600">Left: SPH {examination.prescription.leftSphere || "N/A"}, CYL {examination.prescription.leftCylinder || "N/A"}</p>
            </div>
          )}

          {sale && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sales Order</h2>
              <p className="text-lg text-green-600">Frames: {sale.framesBrand || "N/A"} ({sale.framesModel || "N/A"})</p>
              <p className="text-lg text-green-600">Lenses: {sale.lensesBrand || "N/A"} ({sale.lensesModel || "N/A"})</p>
              <p className="text-lg text-gray-700">Total: KSh {sale.totalAmount || 0}, Advance: KSh {sale.advancePaid || 0}, Balance: KSh {sale.balance || 0}</p>
              <p className="text-lg text-gray-700">Delivery: {sale.deliveryDate ? new Date(sale.deliveryDate).toLocaleDateString() : "Not set"}</p>
              <p className="text-lg text-gray-700">Reference: {sale.referenceNumber || "N/A"}</p>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Collection Status</label>
                <select
                  value={sale.collectionStatus || "Pending Collection"}
                  onChange={(e) => handleUpdateCollectionStatus(e.target.value as "Pending Collection" | "Collected")}
                  className="w-full p-4 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50"
                >
                  <option value="Pending Collection">Pending Collection</option>
                  <option value="Collected">Collected</option>
                </select>
              </div>

              {sale.balance && sale.balance > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-red-700">Update Balance (KSh)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newBalance !== null ? newBalance : sale.balance}
                      onChange={(e) => setNewBalance(parseFloat(e.target.value) || 0)}
                      className="w-full p-4 border border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/50"
                      placeholder="New balance"
                    />
                    <button
                      onClick={handleSaveBalance}
                      disabled={isSaving}
                      className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Visualize History */}
          <div className="mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">History</h2>
            <ul className="list-disc pl-5 text-lg text-gray-600">
              {history.map((item, index) => (
                <li key={index} className="mb-2">
                  {item.type} on {new Date(item.date).toLocaleDateString()}: {item.details}
                </li>
              ))}
            </ul>
          </div>

          {successMessage && (
            <div className="mt-6 p-4 bg-green-100 border-l-4 border-green-500 rounded-xl text-green-700 shadow-md animate-pulse">
              <p className="font-medium">{successMessage}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
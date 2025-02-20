"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useParams } from "next/navigation";
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
  const params = useParams();
  const searchParams = useSearchParams();
  const clientId = params?.client as string | undefined; // Ensure params is safely accessed
  const clientParam = searchParams.get("client");
  const [client, setClient] = useState<Client | null>(null);
  const [examination, setExamination] = useState<Examination | null>(null);
  const [sale, setSale] = useState<Sale | null>(null);
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [newDeliveryDate, setNewDeliveryDate] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Params from useParams:", params); // Debug: Log params object
    console.log("Client ID:", clientId); // Debug: Log clientId
    console.log("Client Param from query:", clientParam); // Debug: Log query param

    async function fetchClient() {
      if (!clientId) {
        setError("No client ID provided in URL. Expected format: /clients/[clientId]");
        return;
      }

      try {
        console.log(`Fetching client with ID: ${clientId}`); // Debug log
        const clientResponse = await fetch(`/api/clients?id=${clientId}`);
        if (!clientResponse.ok) {
          const errorText = await clientResponse.text();
          throw new Error(`Failed to fetch client: ${clientResponse.status} - ${errorText}`);
        }
        const clientData = await clientResponse.json();
        console.log("Client data response:", clientData); // Debug log
        if (clientData.length === 0) {
          setError(`Client with ID ${clientId} not found in database`);
          return;
        }
        setClient(clientData[0]);

        const examResponse = await fetch(`/api/examinations?clientId=${clientId}`);
        if (examResponse.ok) {
          const examData = await examResponse.json();
          console.log("Examination data:", examData); // Debug log
          setExamination(examData.length > 0 ? examData[0] : null);
        } else {
          console.warn("No examination data found for client:", clientId);
        }

        const saleResponse = await fetch(`/api/sales-orders?clientId=${clientId}`);
        if (saleResponse.ok) {
          const saleData = await saleResponse.json();
          console.log("Sales data:", saleData); // Debug log
          if (saleData.length > 0) {
            setSale(saleData[0]);
            setNewDeliveryDate(saleData[0].deliveryDate || new Date().toISOString().split("T")[0]);
          } else {
            setSale(null);
            setNewDeliveryDate(new Date().toISOString().split("T")[0]);
          }
        } else {
          console.warn("No sales data found for client:", clientId);
        }
      } catch (err) {
        console.error("Error fetching client data:", err);
        setError(`Error loading client data: ${(err as Error).message}`);
      }
    }
    fetchClient();
  }, [clientId]);

  if (status === "loading") return <div className="p-6 text-center">Loading...</div>;
  if (status === "unauthenticated") return <div className="p-6 text-center">Please log in to access this page.</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!client) return <div className="p-6 text-center">Loading client data...</div>;

  const handleUpdateCollectionStatus = async (newStatus: "Pending Collection" | "Collected") => {
    if (!sale) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/sales-orders/${clientId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionStatus: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update collection status");

      setSale(prev => prev ? { ...prev, collectionStatus: newStatus } : null);
      setSuccessMessage(`Collection status updated to ${newStatus}.`);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error updating collection status:", error);
      setSuccessMessage("Error updating collection status. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBalance = async () => {
    if (newBalance === null || !sale) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/sales-orders/${clientId}/balance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: newBalance }),
      });

      if (!response.ok) throw new Error("Failed to update balance");

      setSale(prev => prev ? { ...prev, balance: newBalance } : null);
      setNewBalance(null);
      setSuccessMessage("Balance updated successfully.");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error updating balance:", error);
      setSuccessMessage("Error updating balance. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDeliveryDate = async () => {
    if (!sale || !newDeliveryDate) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/sales-orders/${clientId}/balance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryDate: newDeliveryDate }),
      });

      if (!response.ok) throw new Error("Failed to update delivery date");

      setSale(prev => prev ? { ...prev, deliveryDate: newDeliveryDate } : null);
      setSuccessMessage("Delivery date updated successfully.");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error updating delivery date:", error);
      setSuccessMessage("Error updating delivery date. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const history = [
    { type: "Registration", date: client.created_at || "", details: `Registered by ${client.servedBy || "Unknown"}` },
    ...(examination?.created_at ? [{ type: "Examination", date: examination.created_at, details: examination.status || "Completed" }] : []),
    ...(sale?.created_at ? [{ type: "Sale", date: sale.created_at, details: `Ref: ${sale.referenceNumber || "Not assigned"}, Status: ${sale.collectionStatus || "Pending"}` }] : []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 p-6">
        <h1 className="text-4xl font-extrabold text-purple-800 mb-8">{client.firstName} {client.lastName} - Client Details</h1>

        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-glass p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <p className="text-lg text-gray-700"><strong>Registration No:</strong> {client.registrationNumber || "Not assigned"}</p>
            <p className="text-lg text-gray-700"><strong>Phone:</strong> {client.phoneNumber || "Not provided"}</p>
            <p className="text-lg text-gray-700"><strong>DOB:</strong> {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : "Not specified"}</p>
            <p className="text-lg text-gray-700"><strong>Area:</strong> {client.areaOfResidence || "Not specified"}</p>
            <p className="text-lg text-gray-700"><strong>Served By:</strong> {client.servedBy || "Unknown"}</p>
          </div>

          {examination?.prescription && (
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Prescription Details</h2>
              <p className="text-lg text-indigo-600">Right Eye: SPH {examination.prescription.rightSphere || "Not specified"}, CYL {examination.prescription.rightCylinder || "Not specified"}</p>
              <p className="text-lg text-indigo-600">Left Eye: SPH {examination.prescription.leftSphere || "Not specified"}, CYL {examination.prescription.leftCylinder || "Not specified"}</p>
            </div>
          )}

          {sale ? (
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sales Order Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <p className="text-lg text-green-600">Frames: {sale.framesBrand || "Not specified"} ({sale.framesModel || "Not specified"})</p>
                <p className="text-lg text-green-600">Lenses: {sale.lensesBrand || "Not specified"} ({sale.lensesModel || "Not specified"})</p>
                <p className="text-lg text-gray-700">Total Amount (KSh): {sale.totalAmount || 0} - Cost of frames and lenses combined</p>
                <p className="text-lg text-gray-700">Advance Paid (KSh): {sale.advancePaid || 0} - Amount paid upfront</p>
                <p className="text-lg text-gray-700">Balance (KSh): {sale.balance || 0} - Remaining amount to be paid</p>
                <p className="text-lg text-gray-700">Reference Number: {sale.referenceNumber || "Not assigned"}</p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date - Expected delivery date for order</label>
                  <input
                    type="date"
                    value={newDeliveryDate}
                    onChange={(e) => setNewDeliveryDate(e.target.value)}
                    className="w-full p-4 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 shadow-md"
                  />
                  <button
                    onClick={handleSaveDeliveryDate}
                    disabled={isSaving}
                    className="mt-2 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Delivery Date"}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Collection Status</label>
                  <select
                    value={sale.collectionStatus || "Pending Collection"}
                    onChange={(e) => handleUpdateCollectionStatus(e.target.value as "Pending Collection" | "Collected")}
                    className="w-full p-4 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 shadow-md"
                  >
                    <option value="Pending Collection">Pending Collection</option>
                    <option value="Collected">Collected</option>
                  </select>
                </div>

                {sale.balance && sale.balance > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-2">Update Balance (KSh) - Remaining amount to be paid</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={newBalance !== null ? newBalance : sale.balance}
                        onChange={(e) => setNewBalance(parseFloat(e.target.value) || 0)}
                        className="w-full p-4 border border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white/50 shadow-md"
                        placeholder="New balance"
                      />
                      <button
                        onClick={handleSaveBalance}
                        disabled={isSaving}
                        className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : "Save Balance"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 text-gray-600">No sales order recorded yet for this client.</div>
          )}

          <div className="mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Client History</h2>
            {history.length > 0 ? (
              <ul className="list-disc pl-5 text-lg text-gray-600">
                {history.map((item, index) => (
                  <li key={index} className="mb-2">
                    {item.type} on {item.date ? new Date(item.date).toLocaleDateString() : "Date not available"}: {item.details}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg text-gray-600">No history available for this client.</p>
            )}
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
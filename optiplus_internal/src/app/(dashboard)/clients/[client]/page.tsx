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
  emailAddress: string | null;
  areaOfResidence: string;
  previousRx: string | null;
  servedBy: string;
  created_at: string;
}

interface Examination {
  id: number;
  client_id: number;
  registration_number: string;
  right_sphere?: string | null;
  right_cylinder?: string | null;
  right_axis?: string | null;
  right_add?: string | null;
  right_va?: string | null;
  right_ipd?: string | null;
  left_sphere?: string | null;
  left_cylinder?: string | null;
  left_axis?: string | null;
  left_add?: string | null;
  left_va?: string | null;
  left_ipd?: string | null;
  clinical_history?: string | null;
  examined_by?: string | null;
  status: "Pending Examination" | "Completed Examination";
  created_at: string;
}

interface Sale {
  id: number;
  client_id: number;
  registration_number: string;
  frames_brand?: string;
  frames_model?: string;
  frames_color?: string;
  frames_quantity?: number;
  frames_amount?: number;
  lenses_brand?: string;
  lenses_model?: string;
  lenses_color?: string;
  lenses_quantity?: number;
  lenses_amount?: number;
  total_amount?: number;
  advance_paid?: number;
  balance?: number;
  fitting_instructions?: string;
  order_booked_by?: string;
  delivery_date?: string;
  reference_number?: string;
  collection_status?: "Pending Collection" | "Collected";
  created_at?: string;
}

export default function ClientDetailsPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const searchParams = useSearchParams();
  const clientId = params?.client as string | undefined;
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
    async function fetchClient() {
      if (!clientId) {
        setError("No client ID provided in URL. Expected format: /clients/[clientId]");
        return;
      }

      try {
        console.log(`Fetching client with ID: ${clientId}`);
        const clientResponse = await fetch(`/api/clients?id=${clientId}`);
        if (!clientResponse.ok) {
          const errorText = await clientResponse.text();
          throw new Error(`Failed to fetch client: ${clientResponse.status} - ${errorText}`);
        }
        const clientData = await clientResponse.json();
        console.log("Client data response:", clientData);
        if (clientData.length === 0) {
          setError(`Client with ID ${clientId} not found in database`);
          return;
        }
        setClient(clientData[0]);

        const examResponse = await fetch(`/api/examinations?clientId=${clientId}`);
        if (examResponse.ok) {
          const examData = await examResponse.json();
          console.log("Examination data:", examData);
          setExamination(examData.length > 0 ? examData[0] : null);
        } else {
          console.warn("No examination data found for client:", clientId);
        }

        const saleResponse = await fetch(`/api/sales-orders?clientId=${clientId}`);
        if (saleResponse.ok) {
          const saleData = await saleResponse.json();
          console.log("Sales data:", saleData);
          if (saleData.length > 0) {
            setSale(saleData[0]);
            setNewDeliveryDate(saleData[0].delivery_date || new Date().toISOString().split("T")[0]);
          } else {
            setSale(null);
            setNewDeliveryDate(new Date().toISOString().split("T")[0]);
          }
        } else {
          console.error("Failed to fetch sales data:", await saleResponse.text());
          setSale(null);
        }
      } catch (err) {
        console.error("Error fetching client data:", err);
        setError(`Error loading client data: ${(err as Error).message}`);
      }
    }
    fetchClient();
  }, [clientId]);

  const handleUpdateCollectionStatus = async (newStatus: "Pending Collection" | "Collected") => {
    if (!sale || !clientId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/sales-orders/${clientId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection_status: newStatus }), // Match database field
      });

      if (!response.ok) throw new Error("Failed to update collection status");

      setSale(prev => (prev ? { ...prev, collection_status: newStatus } : null));
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
    if (newBalance === null || !sale || !clientId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/sales-orders/${clientId}/balance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: newBalance }),
      });

      if (!response.ok) throw new Error("Failed to update balance");

      setSale(prev => (prev ? { ...prev, balance: newBalance } : null));
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
    if (!sale || !newDeliveryDate || !clientId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/sales-orders/${clientId}/balance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delivery_date: newDeliveryDate }),
      });

      if (!response.ok) throw new Error("Failed to update delivery date");

      setSale(prev => (prev ? { ...prev, delivery_date: newDeliveryDate } : null));
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
    { type: "Registration", date: client?.created_at || "", details: `Registered by ${client?.servedBy || "Unknown"}` },
    ...(examination?.created_at ? [{ type: "Examination", date: examination.created_at, details: `Examined by ${examination.examined_by || "Unknown"}` }] : []),
    ...(sale?.created_at ? [{ type: "Sale", date: sale.created_at, details: `Ref: ${sale.reference_number || "Not assigned"}, Status: ${sale.collection_status || "Pending"}` }] : []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (status === "loading") return <div className="p-6 text-center">Loading...</div>;
  if (status === "unauthenticated") return <div className="p-6 text-center">Please log in to access this page.</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;
  if (!client) return <div className="p-6 text-center">Loading client data...</div>;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-purple-100 p-6">
        <h1 className="text-4xl font-extrabold text-purple-800 mb-8">{client.firstName} {client.lastName} - Client Details</h1>

        <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-glass p-8">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <p className="text-lg text-gray-700"><strong>Registration No:</strong> {client.registrationNumber || "Not assigned"}</p>
              <p className="text-lg text-gray-700"><strong>Phone:</strong> {client.phoneNumber || "Not provided"}</p>
              <p className="text-lg text-gray-700"><strong>DOB:</strong> {client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : "Not specified"}</p>
              <p className="text-lg text-gray-700"><strong>Email:</strong> {client.emailAddress || "Not provided"}</p>
              <p className="text-lg text-gray-700"><strong>Area:</strong> {client.areaOfResidence || "Not specified"}</p>
              <p className="text-lg text-gray-700"><strong>Previous Rx:</strong> {client.previousRx || "Not specified"}</p>
              <p className="text-lg text-gray-700"><strong>Served By:</strong> {client.servedBy || "Unknown"}</p>
            </div>
          </div>

          {/* Examination Details */}
          {examination && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Examination Details</h2>
              <p className="text-lg text-gray-700 mb-2"><strong>Examined By:</strong> {examination.examined_by || "Unknown"}</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-purple-100">
                      <th className="p-3 text-left text-sm font-semibold text-gray-800">Eye</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-800">SPH</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-800">CYL</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-800">Axis</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-800">Add</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-800">V/A</th>
                      <th className="p-3 text-left text-sm font-semibold text-gray-800">IPD</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3 text-gray-700">Right</td>
                      <td className="p-3 text-gray-700">{examination.right_sphere || "N/A"}</td>
                      <td className="p-3 text-gray-700">{examination.right_cylinder || "N/A"}</td>
                      <td className="p-3 text-gray-700">{examination.right_axis || "N/A"}</td>
                      <td className="p-3 text-gray-700">{examination.right_add || "N/A"}</td>
                      <td className="p-3 text-gray-700">{examination.right_va || "N/A"}</td>
                      <td className="p-3 text-gray-700">{examination.right_ipd || "N/A"}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 text-gray-700">Left</td>
                      <td className="p-3 text-gray-700">{examination.left_sphere || "N/A"}</td>
                      <td className="p-3 text-gray-700">{examination.left_cylinder || "N/A"}</td>
                      <td className="p-3 text-gray-700">{examination.left_axis || "N/A"}</td>
                      <td className="p-3 text-gray-700">{examination.left_add || "N/A"}</td>
                      <td className="p-3 text-gray-700">{examination.left_va || "N/A"}</td>
                      <td className="p-3 text-gray-700">{examination.left_ipd || "N/A"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {examination.clinical_history && (
                <p className="mt-2 text-lg text-gray-700"><strong>Clinical History:</strong> {examination.clinical_history}</p>
              )}
            </div>
          )}

          {/* Sales Order Details */}
          {sale ? (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Sales Order Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <p className="text-lg text-green-600">
                  <strong>Frames:</strong> {sale.frames_brand || "Not specified"} ({sale.frames_model || "Not specified"})
                </p>
                <p className="text-lg text-green-600"><strong>Frame Color:</strong> {sale.frames_color || "Not specified"}</p>
                <p className="text-lg text-green-600"><strong>Frame Quantity:</strong> {sale.frames_quantity || "Not specified"}</p>
                <p className="text-lg text-green-600"><strong>Frame Amount (KSh):</strong> {sale.frames_amount || 0}</p>
                <p className="text-lg text-green-600">
                  <strong>Lenses:</strong> {sale.lenses_brand || "Not specified"} ({sale.lenses_model || "Not specified"})
                </p>
                <p className="text-lg text-green-600"><strong>Lens Color:</strong> {sale.lenses_color || "Not specified"}</p>
                <p className="text-lg text-green-600"><strong>Lens Quantity:</strong> {sale.lenses_quantity || "Not specified"}</p>
                <p className="text-lg text-green-600"><strong>Lens Amount (KSh):</strong> {sale.lenses_amount || 0}</p>
                <p className="text-lg text-gray-700">
                  <strong>Total Amount (KSh):</strong> {sale.total_amount || 0} - Cost of frames and lenses combined
                </p>
                <p className="text-lg text-gray-700">
                  <strong>Advance Paid (KSh):</strong> {sale.advance_paid || 0} - Amount paid upfront
                </p>
                <p className="text-lg text-gray-700">
                  <strong>Balance (KSh):</strong> {sale.balance || 0} - Remaining amount to be paid
                </p>
                <p className="text-lg text-gray-700"><strong>Fitting Instructions:</strong> {sale.fitting_instructions || "Not specified"}</p>
                <p className="text-lg text-gray-700"><strong>Order Booked By:</strong> {sale.order_booked_by || "Unknown"}</p>
                <p className="text-lg text-gray-700">
                  <strong>Delivery Date:</strong> {sale.delivery_date ? new Date(sale.delivery_date).toLocaleDateString() : "Not set"}
                </p>
                <p className="text-lg text-gray-700"><strong>Reference Number:</strong> {sale.reference_number || "Not assigned"}</p>

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
                  {sale.collection_status === "Collected" ? (
                    <span className="inline-block px-4 py-2 bg-green-200 text-green-800 rounded-full text-lg font-medium">
                      Collected
                    </span>
                  ) : (
                    <select
                      value={sale.collection_status || "Pending Collection"}
                      onChange={(e) => handleUpdateCollectionStatus(e.target.value as "Pending Collection" | "Collected")}
                      className="w-full p-4 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/50 shadow-md"
                    >
                      <option value="Pending Collection">Pending Collection</option>
                      <option value="Collected">Collected</option>
                    </select>
                  )}
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

          {/* Client History */}
          <div className="mt-8">
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
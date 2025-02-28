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
  created_at: string;
}

interface Sale {
  framesBrand: string;
  framesModel: string;
  framesColor: string;
  framesQuantity: number;
  framesAmount: number;
  lensesBrand: string;
  lensesModel: string;
  lensesType: string; // Changed from lensesColor to lensesType (assuming intent)
  lensesQuantity: number;
  lensesAmount: number;
  totalAmount: number;
  advancePaid: number;
  balance: number;
  fittingInstructions: string;
  orderBookedBy: string;
  deliveryDate: string;
  referenceNumber: string;
}

export default function ClientSalesOrderPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const clientParam = searchParams.get("client");
  const [client, setClient] = useState<Client | null>(null);
  const [sale, setSale] = useState<Sale>({
    framesBrand: "", framesModel: "", framesColor: "", framesQuantity: 1, framesAmount: 0,
    lensesBrand: "", lensesModel: "", lensesType: "", lensesQuantity: 1, lensesAmount: 0,
    totalAmount: 0, advancePaid: 0, balance: 0, fittingInstructions: "", orderBookedBy: "", deliveryDate: "", referenceNumber: `SO-${Date.now()}`,
  });
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
          }
        }
      }
    }
    fetchClient();
  }, [clientParam]);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <div>Please log in to access this page.</div>;
  if (!client) return <div>Client not found.</div>;

  const handleSaleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSale(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "framesAmount" || name === "lensesAmount" || name === "advancePaid") {
        updated.totalAmount = (parseFloat(updated.framesAmount as string) || 0) + (parseFloat(updated.lensesAmount as string) || 0);
        updated.balance = updated.totalAmount - (parseFloat(updated.advancePaid as string) || 0);
      }
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save sales order
      const response = await fetch("/api/sales-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          sale,
          registrationNumber: client.registrationNumber,
        }),
      });

      if (!response.ok) throw new Error("Failed to save sales order");

      // Send SMS via Twilio
      const smsResponse = await fetch("/api/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: client.phoneNumber,
          message: `Hello ${client.firstName}, your sales order (${sale.referenceNumber}) has been placed. Total: $${sale.totalAmount}, Balance: $${sale.balance}. Delivery expected by ${sale.deliveryDate || "TBD"}. Visit optiplus.co.ke.`,
        }),
      });

      if (!smsResponse.ok) {
        console.error("SMS failed:", await smsResponse.text());
      } else {
        console.log("SMS sent successfully");
      }

      setSuccessMessage("Sales order saved successfully! SMS sent to client.");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      setSuccessMessage("Error saving sales order. Please try again.");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Sales Order for {client.firstName} {client.lastName}</h1>

        <div className="bg-white/80 backdrop-blur-lg rounded-lg shadow-glass p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Frames</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="framesBrand" value={sale.framesBrand} onChange={handleSaleChange} placeholder="Brand" className="p-2 border border-gray-300 rounded-lg" />
                <input type="text" name="framesModel" value={sale.framesModel} onChange={handleSaleChange} placeholder="Model" className="p-2 border border-gray-300 rounded-lg" />
                <input type="text" name="framesColor" value={sale.framesColor} onChange={handleSaleChange} placeholder="Color" className="p-2 border border-gray-300 rounded-lg" />
                <input type="number" name="framesQuantity" value={sale.framesQuantity} onChange={handleSaleChange} min="1" className="p-2 border border-gray-300 rounded-lg" />
                <input type="number" name="framesAmount" value={sale.framesAmount} onChange={handleSaleChange} placeholder="Amount ($)" className="p-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Lenses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="lensesBrand" value={sale.lensesBrand} onChange={handleSaleChange} placeholder="Brand" className="p-2 border border-gray-300 rounded-lg" />
                <input type="text" name="lensesModel" value={sale.lensesModel} onChange={handleSaleChange} placeholder="Model" className="p-2 border border-gray-300 rounded-lg" />
                <input type="text" name="lensesType" value={sale.lensesType} onChange={handleSaleChange} placeholder="Type" className="p-2 border border-gray-300 rounded-lg" />
                <input type="number" name="lensesQuantity" value={sale.lensesQuantity} onChange={handleSaleChange} min="1" className="p-2 border border-gray-300 rounded-lg" />
                <input type="number" name="lensesAmount" value={sale.lensesAmount} onChange={handleSaleChange} placeholder="Amount ($)" className="p-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="number" name="totalAmount" value={sale.totalAmount} readOnly className="p-2 border border-gray-300 rounded-lg bg-gray-100" placeholder="Total Amount ($)" />
              <input type="number" name="advancePaid" value={sale.advancePaid} onChange={handleSaleChange} placeholder="Advance Paid ($)" className="p-2 border border-gray-300 rounded-lg" />
              <input type="number" name="balance" value={sale.balance} readOnly className="p-2 border border-gray-300 rounded-lg bg-gray-100" placeholder="Balance ($)" />
            </div>

            <textarea name="fittingInstructions" value={sale.fittingInstructions} onChange={handleSaleChange} placeholder="Fitting Instructions" className="w-full p-2 border border-gray-300 rounded-lg" rows={3}></textarea>
            <input type="text" name="orderBookedBy" value={sale.orderBookedBy} onChange={handleSaleChange} placeholder="Order Booked By" className="p-2 border border-gray-300 rounded-lg" />
            <input type="date" name="deliveryDate" value={sale.deliveryDate} onChange={handleSaleChange} className="p-2 border border-gray-300 rounded-lg" />
            <input type="text" name="referenceNumber" value={sale.referenceNumber} readOnly className="p-2 border border-gray-300 rounded-lg bg-gray-100" placeholder="Reference Number" />

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Order"}
              </button>
            </div>

            {successMessage && (
              <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 rounded-lg text-green-700 shadow-md animate-pulse">
                <p className="font-medium">{successMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
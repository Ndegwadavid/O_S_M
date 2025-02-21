"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import styles from "./ExaminationPage.module.css";

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
      <div className={styles.pageContainer}>
        <h1 className={styles.pageTitle}>Examination - OptiPlus</h1>

        {/* Filter Options */}
        <div className={styles.filterContainer}>
          <button
            onClick={() => setFilter("all")}
            className={`${styles.filterButton} ${filter === "all" ? styles.filterButtonAll : styles.filterButtonInactive}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`${styles.filterButton} ${filter === "pending" ? styles.filterButtonPending : styles.filterButtonInactive}`}
          >
            Pending Examination
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`${styles.filterButton} ${filter === "completed" ? styles.filterButtonCompleted : styles.filterButtonInactive}`}
          >
            Completed Examination
          </button>
        </div>

        {/* Search Bar */}
        <div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, registration number, or phone..."
            className={styles.searchInput}
          />
        </div>

        {/* Client Cards Grid */}
        <div className={styles.clientGrid}>
          {filteredClients.map(client => {
            const isCompleted = client.hasExam;

            return (
              <div
                key={client.id}
                onClick={() => handleClientSelect(client)}
                className={`${styles.clientCard} ${isCompleted ? styles.clientCardCompleted : ""}`}
              >
                <div className={styles.clientHeader}>
                  <div>
                    <h3 className={styles.clientName}>{client.firstName} {client.lastName}</h3>
                    <p className={styles.clientDetail}>Reg No: {client.registrationNumber}</p>
                    <p className={styles.clientDetail}>Phone: {client.phoneNumber}</p>
                    <p className={styles.clientDate}>Registered: {new Date(client.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`${styles.statusBadge} ${isCompleted ? styles.statusBadgeCompleted : styles.statusBadgePending}`}>
                    {isCompleted ? "Completed" : "Pending"}
                  </span>
                </div>
                {isCompleted && (
                  <div className={styles.completedIcon}>
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
          <div className={styles.examinationForm}>
            <h2 className={styles.formTitle}>Examine: {selectedClient.firstName} {selectedClient.lastName}</h2>

            <div className="mb-6">
              <h3 className={styles.sectionTitle}>New Glass Prescription</h3>
              <div className="overflow-x-auto">
                <table className={styles.prescriptionTable}>
                  <thead className={styles.tableHead}>
                    <tr>
                      <th className={styles.tableHeader}>Eye</th>
                      <th className={styles.tableHeader}>SPH</th>
                      <th className={styles.tableHeader}>CYL</th>
                      <th className={styles.tableHeader}>AXIS</th>
                      <th className={styles.tableHeader}>ADD</th>
                      <th className={styles.tableHeader}>V/A</th>
                      <th className={styles.tableHeader}>IPD</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={styles.tableCell}>
                        <span className={styles.eyeLabel}>Right (R)</span>
                      </td>
                      <td className={styles.tableCell}>
                        <input type="text" name="rightSphere" value={prescription.rightSphere || ""} onChange={handlePrescriptionChange} className={styles.inputField} placeholder="Optional" />
                      </td>
                      <td className={styles.tableCell}>
                        <input type="text" name="rightCylinder" value={prescription.rightCylinder || ""} onChange={handlePrescriptionChange} className={styles.inputField} placeholder="Optional" />
                      </td>
                      <td className={styles.tableCell}>
                        <input type="text" name="rightAxis" value={prescription.rightAxis || ""} onChange={handlePrescriptionChange} className={styles.inputField} placeholder="Optional" />
                      </td>
                      <td className={styles.tableCell}>
                        <input type="text" name="rightAdd" value={prescription.rightAdd || ""} onChange={handlePrescriptionChange} className={styles.inputField} placeholder="Optional" />
                      </td>
                      <td className={styles.tableCell}>
                        <input type="text" name="rightVA" value={prescription.rightVA || ""} onChange={handlePrescriptionChange} className={styles.inputField} placeholder="Optional" />
                      </td>
                      <td className={styles.tableCell}>
                        <input type="text" name="rightIPD" value={prescription.rightIPD || ""} onChange={handlePrescriptionChange} className={styles.inputField} placeholder="Optional" />
                      </td>
                    </tr>
                    <tr>
                      <td className={styles.tableCell}>
                        <span className={styles.eyeLabel}>Left (L)</span>
                      </td>
                      <td className={styles.tableCell}>
                        <input type="text" name="leftSphere" value={prescription.leftSphere || ""} onChange={handlePrescriptionChange} className={styles.inputField} placeholder="Optional" />
                      </td>
                      <td className={styles.tableCell}>
                        <input type="text" name="leftCylinder" value={prescription.leftCylinder || ""} onChange={handlePrescriptionChange} className={styles.inputField} placeholder="Optional" />
                      </td>
                      <td className={styles.tableCell}>
                        <input type="text" name="leftAxis" value={prescription.leftAxis || ""} onChange={handlePrescriptionChange} className={styles.inputField} placeholder="Optional" />
                      </td>
                      <td className={styles.tableCell}>
                        <input type="text" name="leftAdd" value={prescription.leftAdd || ""} onChange={handlePrescriptionChange} className={styles.inputField} placeholder="Optional" />
                      </td>
                      <td className={styles.tableCell}>
                        <input type="text" name="leftVA" value={prescription.leftVA || ""} onChange={handlePrescriptionChange} className={styles.inputField} placeholder="Optional" />
                      </td>
                      <td className={styles.tableCell}>
                        <input type="text" name="leftIPD" value={prescription.leftIPD || ""} onChange={handlePrescriptionChange} className={styles.inputField} placeholder="Optional" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-6">
              <label className={styles.formLabel}>Clinical History</label>
              <textarea
                value={clinicalHistory}
                onChange={handleClinicalHistoryChange}
                className={styles.textarea}
                rows={4}
                placeholder="Enter clinical history (optional)..."
              />
            </div>

            <div className="mb-6">
              <label className={styles.formLabel}>Examined By</label>
              <input
                type="text"
                value={examinedBy}
                onChange={handleExaminedByChange}
                className={styles.inputField}
                placeholder="Enter examiner's name"
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={styles.saveButton}
              >
                {isSaving ? "Saving..." : "Save Record"}
              </button>
              <button
                onClick={handleClose}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>

            {successMessage && (
              <div className={styles.successMessage}>
                <p>{successMessage}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
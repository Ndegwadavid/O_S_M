"use client";
import { useState } from "react";
import styles from "./RegistrationForm.module.css";

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phoneNumber: "",
    emailAddress: "",
    areaOfResidence: "",
    previousRx: "",
    servedBy: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to register client");
      }

      const data = await response.json();
      setSuccess(true);
      setRegistrationNumber(data.registrationNumber);
      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        phoneNumber: "",
        emailAddress: "",
        areaOfResidence: "",
        previousRx: "",
        servedBy: "",
      });
    } catch (error) {
      setError("An error occurred while registering the client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.formHeader}>
        <h2>Client Registration</h2>
      </div>
      
      <div className={styles.formContent}>
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        
        {success && (
          <div className={styles.successMessage}>
            <p className="font-medium">Client registered successfully!</p>
            <p>Registration Number: <span className={styles.registrationNumber}>{registrationNumber}</span></p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={styles.inputGroup}>
              <label className={`${styles.inputLabel} ${styles.required}`}>
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={`${styles.inputLabel} ${styles.required}`}>
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={`${styles.inputLabel} ${styles.required}`}>
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={`${styles.inputLabel} ${styles.required}`}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                Email Address
              </label>
              <input
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={`${styles.inputLabel} ${styles.required}`}>
                Area of Residence
              </label>
              <input
                type="text"
                name="areaOfResidence"
                value={formData.areaOfResidence}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                Previous Rx
              </label>
              <textarea
                name="previousRx"
                value={formData.previousRx}
                onChange={handleChange}
                rows={3}
                className={`${styles.input} ${styles.textarea}`}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={`${styles.inputLabel} ${styles.required}`}>
                Served By
              </label>
              <input
                type="text"
                name="servedBy"
                value={formData.servedBy}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
          </div>
          
          <div className={styles.buttonContainer}>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? (
                <>
                  <span className={styles.loadingSpinner}></span>
                  Registering...
                </>
              ) : (
                "Register Client"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
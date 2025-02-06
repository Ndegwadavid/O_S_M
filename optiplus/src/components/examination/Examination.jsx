import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ExaminationDashboard from './ExaminationDashboard';
import PrescriptionForm from './PrescriptionForm';
import WaitingList from './WaitingList';

const Examination = () => {
  return (
    <Routes>
      <Route path="/" element={<ExaminationDashboard />} />
      <Route path="/waiting" element={<WaitingList />} />
      <Route path="/prescription/:clientId" element={<PrescriptionForm />} />
    </Routes>
  );
};

export default Examination;
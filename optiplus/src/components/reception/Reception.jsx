import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ClientRegistration from './ClientRegistration';
import PendingClients from './PendingClients';
import SalesForm from './SalesForm';
import ReceptionDashboard from './ReceptionDashboard';

const Reception = () => {
  return (
    <Routes>
      <Route path="/" element={<ReceptionDashboard />} />
      <Route path="/register" element={<ClientRegistration />} />
      <Route path="/pending" element={<PendingClients />} />
      <Route path="/sales/:clientId" element={<SalesForm />} />
    </Routes>
  );
};

export default Reception;
// src/components/admin/Admin.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import ClientList from './ClientList';  // Fixed import name
import Analytics from './Analytics';
//import Reports from './Reports';

const Admin = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/clients" element={<ClientList />} />
      <Route path="/analytics" element={<Analytics />} />
    </Routes>
  );
};

export default Admin;
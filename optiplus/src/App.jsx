// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DepartmentSelection from './components/DepartmentSelection';
import Login from './components/auth/Login';
import Reception from './components/reception/Reception';
import Examination from './components/examination/Examination';
import Admin from './components/admin/Admin';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DepartmentSelection />} />
        <Route path="/login/:department" element={<Login />} />
        
        <Route path="/reception/*" element={
          <ProtectedRoute>
            <Reception />
          </ProtectedRoute>
        } />
        
        <Route path="/examination/*" element={
          <ProtectedRoute>
            <Examination />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
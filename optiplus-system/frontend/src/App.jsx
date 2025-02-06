// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './lib/state/QueryProvider';
import { NotificationProvider } from './context/NotificationContext';
import AppLayout from './layouts/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import ClientRegistration from './components/clients/ClientRegistration';
import PrescriptionForm from './components/prescriptions/PrescriptionForm';
import SalesOrder from './components/sales/SalesOrder';
import { Toaster } from 'sonner';
import './styles/main.css';

const App = () => {
  return (
    <QueryProvider>
      <NotificationProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients/register" element={<ClientRegistration />} />
              <Route path="/prescriptions" element={<PrescriptionForm />} />
              <Route path="/sales" element={<SalesOrder />} />
            </Routes>
          </AppLayout>
        </Router>
        <Toaster position="top-right" />
      </NotificationProvider>
    </QueryProvider>
  );
};

export default App;
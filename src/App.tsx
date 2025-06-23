import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/layout';
import { queryClient } from '@/utils/queryClient';
import { useWallet } from '@/hooks';

// Pages
import LandingPage from '@/pages/LandingPage';
import Dashboard from '@/pages/Dashboard';
import CreateWallet from '@/pages/CreateWallet';
import PendingTransactions from '@/pages/PendingTransactions';
import CreateTransaction from '@/pages/CreateTransaction';
import ManageSigners from '@/pages/ManageSigners';

// Protected routes component for authenticated users
const ProtectedRoutes: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CreateWallet />} />
        <Route path="/pending" element={<PendingTransactions />} />
        <Route path="/create-transaction" element={<CreateTransaction />} />
        <Route path="/signers" element={<ManageSigners />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

// Main App component with conditional routing
const AppContent: React.FC = () => {
  const { isConnected } = useWallet();

  if (isConnected) {
    return <ProtectedRoutes />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;

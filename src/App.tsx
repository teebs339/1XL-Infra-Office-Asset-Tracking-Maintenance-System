import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Allocations from './pages/Allocations';
import Maintenance from './pages/Maintenance';
import Repairs from './pages/Repairs';
import Consumables from './pages/Consumables';
import Procurement from './pages/Procurement';
import Vendors from './pages/Vendors';
import Depreciation from './pages/Depreciation';
import AuditLogs from './pages/AuditLogs';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Documents from './pages/Documents';
import Locations from './pages/Locations';
import Users from './pages/Users';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/" element={<ProtectedRoute><DataProvider><Layout /></DataProvider></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="assets" element={<Assets />} />
              <Route path="allocations" element={<Allocations />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="repairs" element={<Repairs />} />
              <Route path="consumables" element={<Consumables />} />
              <Route path="procurement" element={<Procurement />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="depreciation" element={<Depreciation />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="reports" element={<Reports />} />
              <Route path="documents" element={<Documents />} />
              <Route path="locations" element={<Locations />} />
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

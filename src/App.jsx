import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProgramsManagement from './pages/ProgramsManagement.jsx';
import TeamManagement from './pages/TeamManagement.jsx';
import TestimonialsManagement from './pages/TestimonialsManagement.jsx';
import NewsManagement from './pages/NewsManagement.jsx';
import DonationQueriesManagement from './pages/DonationQueriesManagement.jsx';
import EnquiriesManagement from './pages/EnquiriesManagement.jsx';
import DonationsManagement from './pages/DonationsManagement.jsx';
import RegistrationsManagement from './pages/RegistrationsManagement.jsx';
import Settings from './pages/Settings.jsx';
import Login from './pages/Login.jsx';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  const hasToken = Boolean(localStorage.getItem('admin_token'));

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#1a0804', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid rgba(130,25,5,0.3)', borderTopColor: '#821905', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif', fontSize: '14px' }}>Connecting to server...</p>
      </div>
    );
  }

  if (!admin && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (!admin && hasToken) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes inside Layout */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/programs" element={
            <ProtectedRoute>
              <ProgramsManagement />
            </ProtectedRoute>
          } />

          <Route path="/team" element={
            <ProtectedRoute>
              <TeamManagement />
            </ProtectedRoute>
          } />

          <Route path="/testimonials" element={
            <ProtectedRoute>
              <TestimonialsManagement />
            </ProtectedRoute>
          } />

          <Route path="/news" element={
            <ProtectedRoute>
              <NewsManagement />
            </ProtectedRoute>
          } />

          <Route path="/queries" element={
            <ProtectedRoute>
              <DonationQueriesManagement />
            </ProtectedRoute>
          } />

          <Route path="/enquiries" element={
            <ProtectedRoute>
              <EnquiriesManagement />
            </ProtectedRoute>
          } />

          <Route path="/donations" element={
            <ProtectedRoute>
              <DonationsManagement />
            </ProtectedRoute>
          } />

          <Route path="/registrations" element={
            <ProtectedRoute>
              <RegistrationsManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

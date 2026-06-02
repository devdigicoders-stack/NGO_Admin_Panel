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
import Settings from './pages/Settings.jsx';
import Login from './pages/Login.jsx';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!admin) {
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

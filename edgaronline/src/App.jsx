import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@context/AuthContext';

// Layout components
import Header from '@components/layout/Header';
import Footer from '@components/layout/Footer';

// Pages (we'll create these next)
import Login from '@pages/Login';
import Register from '@pages/Register';
import Dashboard from '@pages/Dashboard';
import FilingWizard from '@pages/FilingWizard';
import DraftsList from '@pages/DraftsList';
import SubmissionHistory from '@pages/SubmissionHistory';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="usa-section" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="sec-spinner" style={{ margin: '0 auto' }}></div>
        <p style={{ marginTop: '1rem' }}>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Main App layout
const AppLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <main id="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/filing/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <FilingWizard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/filing/new/:formType"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <FilingWizard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/filing/edit/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <FilingWizard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/drafts"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DraftsList />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/submissions"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SubmissionHistory />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;



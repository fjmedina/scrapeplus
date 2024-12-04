import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthForm } from './components/auth/AuthForm';
import { useAuthStore } from './store/authStore';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { WebsiteAnalysis } from './pages/WebsiteAnalysis';
import { SocialMedia } from './pages/SocialMedia';
import { News } from './pages/News';
import { Reports } from './pages/Reports';
import { Subscription } from './pages/Subscription';
import { Integrations } from './pages/Integrations';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/signin" />;
}

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <Routes>
        <Route 
          path="/signin" 
          element={user ? <Navigate to="/" /> : <AuthForm type="signin" />} 
        />
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/" /> : <AuthForm type="signup" />} 
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/website-analysis"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <WebsiteAnalysis />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/social-media"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <SocialMedia />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/news"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <News />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Subscription />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/integrations"
          element={
            <PrivateRoute>
              <DashboardLayout>
                <Integrations />
              </DashboardLayout>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
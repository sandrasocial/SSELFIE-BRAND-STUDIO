import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

// Core Layout Components
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page Components
import LandingPage from './pages/LandingPage';
import AuthCallback from './pages/auth/AuthCallback';
import Dashboard from './pages/Dashboard';
import ChatWorkspace from './pages/ChatWorkspace';
import ModelTraining from './pages/ModelTraining';
import AgentActivity from './pages/AgentActivity';
import AdminPanel from './pages/AdminPanel';
import EditorialShowcase from './components/EditorialShowcase';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Styles
import './styles/globals.css';

// React Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="app">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/editorial" element={<EditorialShowcase />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                
                {/* Protected Routes */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/chat" element={
                  <ProtectedRoute>
                    <Layout>
                      <ChatWorkspace />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/training" element={
                  <ProtectedRoute>
                    <Layout>
                      <ModelTraining />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/activity" element={
                  <ProtectedRoute>
                    <Layout>
                      <AgentActivity />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <Layout>
                      <AdminPanel />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Redirect unknown routes to dashboard */}
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Routes>
              
              {/* Global Components */}
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1a1a1b',
                    color: '#ffffff',
                    border: '1px solid #333',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
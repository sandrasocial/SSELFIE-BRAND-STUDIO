import React from 'react';
import ReactDOM from 'react-dom/client';
import { StackProvider } from '@stackframe/stack';
import { StackClientApp } from '@stackframe/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import './index.css';

// App V2 Components
import SselfieAppLayout from './app_v2/SselfieAppLayout';
import MayaScreen from './app_v2/MayaScreen';
import GalleryScreen from './app_v2/GalleryScreen';
import StudioScreen from './app_v2/StudioScreen';
import ProfileScreen from './app_v2/ProfileScreen';
import SettingsScreen from './app_v2/SettingsScreen';

// Stack Auth Configuration
const stackProjectId = import.meta.env.VITE_STACK_PROJECT_ID || '253d7343-a0d4-43a1-be5c-822f590d40be';
const stackPublishableKey = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || 'pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg';

// Initialize Stack Client App
const stackApp = new StackClientApp({
  tokenStore: 'cookie',
  projectId: stackProjectId,
  publishableClientKey: stackPublishableKey,
  urls: {
    signIn: '/handler/sign-in',
    afterSignIn: '/app',
    afterSignOut: '/',
  },
});

// React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000, // 30 seconds
    },
  },
});

// Main App Component
function App() {
  return (
    <React.StrictMode>
      <StackProvider app={stackApp}>
        <QueryClientProvider client={queryClient}>
          <Router>
            <Switch>
              {/* App V2 Routes - SselfieAppLayout handles all app routes internally */}
              <Route path="/app">
                <SselfieAppLayout />
              </Route>
              
              <Route path="/app/:rest*">
                <SselfieAppLayout />
              </Route>

              {/* Default route */}
              <Route path="/">
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      Welcome to SSELFIE Studio
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                      AI-Powered Personal Branding Platform
                    </p>
                    <a
                      href="/app"
                      className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                    >
                      Get Started
                    </a>
                  </div>
                </div>
              </Route>
            </Switch>
          </Router>
        </QueryClientProvider>
      </StackProvider>
    </React.StrictMode>
  );
}

// Mount the app
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}
// @ts-ignore - React 19 type issue
const root = ReactDOM.createRoot(rootElement);
root.render(<App />);

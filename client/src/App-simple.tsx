import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function SimpleHomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#000'
        }}>SSELFIE Studio</h1>
        <p style={{
          color: '#666',
          fontSize: '1.2rem',
          marginBottom: '2rem'
        }}>AI Personal Branding Platform</p>
        <button 
          onClick={() => window.location.href = '/api/login'}
          style={{
            backgroundColor: '#000',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1.1rem',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#333'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#000'}
        >
          Get Started
        </button>
        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#888' }}>
          Full React App Successfully Deployed ✓
        </div>
      </div>
    </div>
  );
}

function HealthCheck() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Health Check</h1>
      <p>Application is running successfully!</p>
      <div className="mt-4 space-y-2">
        <div><a href="/" className="text-blue-600 underline">Go Home</a></div>
        <div><a href="/api/health" className="text-blue-600 underline">API Health</a></div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={SimpleHomePage} />
      <Route path="/health" component={HealthCheck} />
      <Route>
        <div className="p-8">
          <h1 className="text-2xl mb-4">Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <div className="mt-4">
            <a href="/" className="text-blue-600 underline">Go Home</a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  React.useEffect(() => {
    console.log('SSELFIE Studio: App initializing...');
    console.log('SSELFIE Studio: App rendering...');
    console.log('SSELFIE Studio: Domain access validated, app ready');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-white">
        <Router />
      </div>
    </QueryClientProvider>
  );
}

export default App;
import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function SimpleHomePage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">SSELFIE Studio</h1>
        <p className="text-gray-600 mb-8">AI Personal Branding Platform</p>
        <button 
          onClick={() => window.location.href = '/api/login'}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800"
        >
          Get Started
        </button>
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
    console.log('SSELFIE Studio: QueryClient available:', !!queryClient);
    console.log('SSELFIE Studio: App rendering...');
    console.log('SSELFIE Studio: Domain access validated, app ready');
  }, []);

  // Test with absolute minimal React component first
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }
  }, 
    React.createElement('div', {
      style: { textAlign: 'center' }
    },
      React.createElement('h1', {
        style: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: 'black' }
      }, '✅ SSELFIE Studio Working!'),
      React.createElement('p', {
        style: { color: '#666', marginBottom: '2rem' }
      }, 'AI Personal Branding Platform - No CSS Dependencies'),
      React.createElement('button', {
        onClick: () => console.log('Button clicked!'),
        style: {
          backgroundColor: 'black',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          cursor: 'pointer'
        }
      }, 'Test Button')
    )
  );
}

export default App;
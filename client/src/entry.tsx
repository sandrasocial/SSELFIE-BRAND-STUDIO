/// <reference types="react-dom" />

// ⚠️ CRITICAL: Import react-global FIRST before anything else
// This exports React to the global scope so radix-ui and other libraries can use it
import './react-global';

import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Lazy load App to prevent radix-ui from being imported before React is ready
const App = React.lazy(() => import('./App'));

// Simple loading fallback
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontFamily: '-apple-system, sans-serif',
    backgroundColor: '#000'
  }}>
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ color: '#fff', marginBottom: '16px' }}>SSELFIE Studio</h1>
      <div style={{ color: '#999' }}>Loading...</div>
    </div>
  </div>
);

// Initialize the app
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element');
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
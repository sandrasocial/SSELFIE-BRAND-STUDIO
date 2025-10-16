/// <reference types="react-dom" />

// ⚠️ CRITICAL: Initialize React globally IMMEDIATELY
// This must happen before ANY other code runs, including imports
// This ensures radix-ui and other libraries can access React.forwardRef

import React from 'react';
import ReactDOM from 'react-dom/client';

// Export React and ReactDOM to global scope IMMEDIATELY
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
(window as any).ReactVersion = React.version;
(window as any).ReactCreateElement = React.createElement;
(window as any).ReactForwardRef = React.forwardRef;
(window as any).ReactMemo = React.memo;
(window as any).ReactLazy = React.lazy;
(window as any).ReactSuspense = React.Suspense;

// Mark React as initialized
(window as any).__REACT_INITIALIZED__ = true;

console.log('✓ React initialized globally');

// NOW we can safely import other modules
import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Simple loading fallback
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontFamily: '-apple-system, sans-serif',
    backgroundColor: '#fff'
  }}>
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ color: '#1f2937', marginBottom: '16px' }}>SSELFIE Studio</h1>
      <div style={{ color: '#1f2937' }}>Loading...</div>
    </div>
  </div>
);

// Initialize the app
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element');
}

const root = createRoot(rootElement);

// Lazy load App to ensure React is exported globally first
// Use dynamic import to defer loading until after React is initialized
const App = React.lazy(() => import('./App'));

root.render(
  <React.StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
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
import { createRoot } from 'react-dom/client';
import './index.css';

// Initialize the app
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element');
}

const root = createRoot(rootElement);

// ✅ CRITICAL FIX: Import App directly (not lazy)
// NO Suspense boundary here - RootWrapper handles all Suspense
// This prevents duplicate loading screens
import App from './App';
import RootWrapper from './components/layout/RootWrapper';

console.log('🚀 Rendering app...');

root.render(
  <React.StrictMode>
    <RootWrapper>
      <App />
    </RootWrapper>
  </React.StrictMode>
);
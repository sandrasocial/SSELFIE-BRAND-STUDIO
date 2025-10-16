/**
 * ⚠️ CRITICAL: This file MUST be imported first, before any other modules
 * It exports React and ReactDOM to the global window object
 * This ensures that libraries like radix-ui, lucide-react, and react-icons
 * can access React.forwardRef and other React APIs
 */

// Import React and ReactDOM
import React from 'react';
import ReactDOM from 'react-dom/client';

// Export React and ReactDOM to global scope IMMEDIATELY
// This must happen before any other modules are loaded
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;

// Also export common React utilities that libraries might need
(window as any).ReactVersion = React.version;

// Export React utilities that radix-ui and other libraries might need
(window as any).ReactCreateElement = React.createElement;
(window as any).ReactForwardRef = React.forwardRef;
(window as any).ReactMemo = React.memo;
(window as any).ReactLazy = React.lazy;
(window as any).ReactSuspense = React.Suspense;

// Verify React is available
if (typeof (window as any).React === 'undefined') {
  console.error('CRITICAL: React is not available globally!');
  throw new Error('React initialization failed');
}

if (typeof (window as any).React.forwardRef !== 'function') {
  console.error('CRITICAL: React.forwardRef is not available!');
  throw new Error('React.forwardRef is not available');
}

console.log('✓ React and ReactDOM exported to global scope');
console.log('✓ React version:', React.version);
console.log('✓ React.forwardRef available:', typeof React.forwardRef === 'function');


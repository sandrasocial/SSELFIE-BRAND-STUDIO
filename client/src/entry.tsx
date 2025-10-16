/// <reference types="react-dom" />

import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ⚠️ CRITICAL: Export React and ReactDOM to global scope
// This is required for libraries like radix-ui, lucide-react, and react-icons
// that may be loaded before React is fully initialized
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;

// Initialize the app
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element');
}

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
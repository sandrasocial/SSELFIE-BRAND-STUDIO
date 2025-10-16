/// <reference types="react-dom" />

// ⚠️ CRITICAL: Import react-global FIRST before anything else
// This exports React to the global scope so radix-ui and other libraries can use it
import './react-global';

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

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
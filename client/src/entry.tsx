/// <reference types="react-dom" />

import * as React from 'react';
import { createRoot, type Container } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize React globally for third-party libraries
if (typeof window !== 'undefined') {
  window.React = React;
  window.__REACT_INITIALIZED__ = true;
  console.log('✅ React initialized globally in entry.tsx');
}

async function initializeApp() {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('Failed to find root element');
    }

    // Create the root with proper typing
    const root = createRoot(rootElement as Element);

    // Clear loading message
    rootElement.innerHTML = '';

    // Render the app
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Application initialization failed:', error);
    // Show error in loading placeholder
    const container = document.getElementById('root');
    if (container) {
      container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: -apple-system, sans-serif;">
          <div style="text-align: center;">
            <h1 style="color: #1f2937; margin-bottom: 16px;">SSELFIE Studio</h1>
            <div style="color: #1f2937;">Please refresh the page</div>
          </div>
        </div>
      `;
    }
  }
}

// Initialize with a slight delay to ensure all resources are loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(initializeApp, 100));
} else {
  setTimeout(initializeApp, 100);
}
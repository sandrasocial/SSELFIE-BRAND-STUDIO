/// <reference types="react-dom" />

import './lib/react-init';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

async function initializeApp() {
  try {
    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Failed to find root element');
    }

    // Ensure React is available
    if (!window.React) {
      throw new Error('React not initialized');
    }

    const root = createRoot(container as Element);
    
    // Clear loading message
    container.innerHTML = '';
    
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
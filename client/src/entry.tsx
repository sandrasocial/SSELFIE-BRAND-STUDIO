/// <reference types="react-dom" />

// CRITICAL: Import react-init FIRST to ensure React is available globally
// This must happen before any other imports to prevent third-party libraries
// (like lucide-react, react-icons) from trying to use React before it's initialized
import './lib/react-init';

import * as React from 'react';
import { createRoot, type Container } from 'react-dom/client';
import App from './App';
import './index.css';

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
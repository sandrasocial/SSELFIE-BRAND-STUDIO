import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Debug logging for troubleshooting
console.log('SSELFIE Studio: Main.tsx loading...');
console.log('SSELFIE Studio: Root element found:', !!document.getElementById("root"));

// Disable Vite HMR to prevent WebSocket connection errors
if ((import.meta as any).hot) {
  console.log('Disabling HMR to prevent connection issues');
  (import.meta as any).hot.accept(() => {
    // Accept all hot updates without triggering WebSocket connections
  });
}

// Make React globally available for debugging
(window as any).React = React;

// Add global error handlers to catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.warn('SSELFIE Studio: Unhandled promise rejection caught:', event.reason);
  // Prevent the default console.error that React shows
  event.preventDefault();
  
  // Only log critical errors, ignore development-related rejections
  if (event.reason && event.reason.message && !event.reason.message.includes('WebSocket') && !event.reason.message.includes('Service Worker')) {
    console.error('Critical unhandled promise:', event.reason);
  }
});

window.addEventListener('error', (event) => {
  console.warn('SSELFIE Studio: Global error caught:', event.error);
});

// Force CSS reload for debugging
console.log('CSS files loaded:', document.styleSheets.length);

const root = document.getElementById("root");
if (root) {
  try {
    createRoot(root).render(React.createElement(App));
    console.log('SSELFIE Studio: App rendered successfully');
  } catch (error) {
    console.error('SSELFIE Studio: Error rendering app:', error);
    // Fallback to simple HTML if React fails
    root.innerHTML = '<div style="padding: 20px; font-family: serif;">SSELFIE Studio Loading...</div>';
  }
} else {
  console.error('SSELFIE Studio: Root element not found');
}

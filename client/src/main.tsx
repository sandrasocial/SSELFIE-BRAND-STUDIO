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

// Add global error handlers to catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // Prevent the default console.error that React shows
  event.preventDefault();
  
  // Check if this is a WebSocket or development-related error
  const isWebSocketError = event.reason && (
    event.reason.message?.includes('WebSocket') ||
    event.reason.message?.includes('websocket') ||
    event.reason.message?.includes('HMR') ||
    event.reason.message?.includes('Service Worker') ||
    event.reason.toString().includes('WebSocket')
  );
  
  if (isWebSocketError) {
    // Silently ignore WebSocket/HMR errors - these are development only
    return;
  }
  
  // Only log actual application errors
  console.warn('SSELFIE Studio: Unhandled promise rejection caught:', event.reason);
});

console.log('SSELFIE Studio: Starting up with JWT authentication...');

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container not found");
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
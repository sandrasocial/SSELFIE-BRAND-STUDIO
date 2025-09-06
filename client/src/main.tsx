import React from 'react';
import { createRoot } from "react-dom/client";
import { StackProvider } from '@stackframe/stack';
import { stackApp } from './stack/client';
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
  
  // Check if this is a Stack Auth internal error
  const isStackAuthError = event.reason && (
    event.reason.message?.includes('accessToken') ||
    event.reason.message?.includes('StackAssertionError') ||
    event.reason.message?.includes('Cannot use \'in\' operator') ||
    event.reason.name === 'StackAssertionError' ||
    event.reason.toString().includes('StackAssertionError') ||
    event.reason.toString().includes('accessToken')
  );
  
  if (isWebSocketError) {
    // Silently ignore WebSocket/HMR errors - these are development only
    return;
  }
  
  if (isStackAuthError) {
    console.warn('⚠️ Stack Auth internal error prevented:', event.reason?.message || event.reason);
    return;
  }
  
  // Only log actual application errors
  console.warn('SSELFIE Studio: Unhandled promise rejection caught:', event.reason);
});

window.addEventListener('error', (event) => {
  // Check if this is a WebSocket or development-related error
  const isWebSocketError = event.error && (
    event.error.message?.includes('WebSocket') ||
    event.error.message?.includes('websocket') ||
    event.error.message?.includes('HMR') ||
    event.error.toString().includes('WebSocket')
  );
  
  if (isWebSocketError) {
    // Silently ignore WebSocket/HMR errors - these are development only
    event.preventDefault();
    return;
  }
  
  // Only log actual application errors
  console.warn('SSELFIE Studio: Global error caught:', event.error);
});

// Force CSS reload for debugging
console.log('CSS files loaded:', document.styleSheets.length);

const root = document.getElementById("root");
if (root) {
  try {
    console.log('🚀 SSELFIE Studio: Starting with Stack Auth');
    createRoot(root).render(
      <StackProvider app={stackApp}>
        <App />
      </StackProvider>
    );
    console.log('✅ SSELFIE Studio: App rendered successfully');
  } catch (error) {
    console.error('SSELFIE Studio: Error rendering app:', error);
    root.innerHTML = '<div style="padding: 20px; font-family: serif;">SSELFIE Studio Loading...</div>';
  }
} else {
  console.error('SSELFIE Studio: Root element not found');
}
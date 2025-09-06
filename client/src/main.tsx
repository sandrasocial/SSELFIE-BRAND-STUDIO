import React from 'react';
import { createRoot } from "react-dom/client";
import { StackProvider, StackTheme } from "@stackframe/stack";
import App from "./App";
import "./index.css";

// Polyfill process for Stack Auth browser compatibility
if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = { env: {} };
}

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
    // Get Stack Auth configuration with proper validation
    const stackProjectId = import.meta.env.VITE_STACK_PROJECT_ID;
    const stackPublishableKey = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;
    
    console.log('🔍 Stack Auth Config Check:', {
      hasProjectId: !!stackProjectId,
      hasPublishableKey: !!stackPublishableKey
    });

    // Only use Stack Auth if properly configured, otherwise render app directly
    if (stackProjectId && stackPublishableKey) {
      console.log('✅ Stack Auth: Using Stack Auth provider');
      createRoot(root).render(
        React.createElement(StackProvider, {
          projectId: stackProjectId,
          publishableClientKey: stackPublishableKey,
          theme: StackTheme.withDefaults({
            primaryColor: "#d4af37", // SSELFIE Studio gold
            textColor: "#1a1a1a",    // Editorial black
          })
        }, React.createElement(App))
      );
    } else {
      console.log('⚠️ Stack Auth: Configuration missing, rendering app directly');
      createRoot(root).render(React.createElement(App));
    }
    
    console.log('SSELFIE Studio: App rendered successfully');
  } catch (error) {
    console.error('SSELFIE Studio: Error rendering app:', error);
    // Fallback: render app without Stack Auth provider
    try {
      createRoot(root).render(React.createElement(App));
      console.log('SSELFIE Studio: Fallback render successful');
    } catch (fallbackError) {
      console.error('SSELFIE Studio: Fallback render failed:', fallbackError);
      root.innerHTML = '<div style="padding: 20px; font-family: serif;">SSELFIE Studio Loading...</div>';
    }
  }
} else {
  console.error('SSELFIE Studio: Root element not found');
}

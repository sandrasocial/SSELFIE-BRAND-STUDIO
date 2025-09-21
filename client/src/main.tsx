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

// React sanity check for debugging
if (import.meta.env.DEV) {
  console.log("React sanity:", { 
    version: React.version, 
    hasUse: typeof (React as any).use === "function" 
  });
}

console.log('SSELFIE Studio: Starting up with Stack Auth authentication...');

// Global listener for static modal video save events
window.addEventListener('video:preview:save', async (e: Event) => {
  const detail = (e as CustomEvent).detail || {};
  const canonical = detail.originalSrc || detail.src;
  if (!canonical) return;
  try {
    const res = await fetch('/api/videos/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl: canonical, source: 'static-modal' })
    });
    if (!res.ok) {
      console.warn('[Video Save] Failed to persist video:', res.status, await res.text());
    } else {
      console.log('[Video Save] Persisted video successfully');
    }
  } catch (err) {
    console.warn('[Video Save] Error persisting video', err);
  }
});

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container not found");
}

const root = createRoot(container);

root.render(
  // REMOVED: React.StrictMode was causing duplicate API calls in development
  // StrictMode intentionally double-renders components, causing Maya to respond twice
  <App />
);
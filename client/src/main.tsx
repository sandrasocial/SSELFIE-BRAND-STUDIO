import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./index.css";

// 💡 IMPORT ALL PROVIDERS HERE
import { QueryClientProvider } from '@tanstack/react-query';
import { StackProvider, StackTheme } from '@stackframe/react'; // This is the ReactStackProvider
import { Toaster } from './components/ui/toaster.js';
import { TooltipProvider } from './components/ui/tooltip.js';

// Import queryClient and stackClientApp
import { queryClient } from "./lib/queryClient.js";
import { stackClientApp } from "../../stack/client.js";

// Debug logging for troubleshooting
console.log('SSELFIE Studio: Main.tsx loading...');
console.log('SSELFIE Studio: Root element found:', !!document.getElementById("root"));

// Disable Vite HMR to prevent WebSocket connection errors
if (import.meta.hot) {
  console.log('Disabling HMR to prevent connection issues');
  import.meta.hot.accept(() => {
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
if (!container) throw new Error("Failed to find the root element");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    {/* 1. StackProvider MUST wrap everything that uses auth hooks */}
    <StackProvider app={stackClientApp}>
      <StackTheme>
        {/* 2. QueryClientProvider wraps the entire application logic */}
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {/* 3. App component only renders the router */}
            <App />
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </StackTheme>
    </StackProvider>
  </React.StrictMode>
);
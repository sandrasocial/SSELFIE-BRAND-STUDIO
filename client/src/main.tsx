import React from 'react';
import { createRoot } from "react-dom/client";
import RootWrapper from "./components/RootWrapper";
import App from "./App";
import "./index.css";

// Lazy load UI providers
const LazyTooltipProvider = React.lazy(() => import('./components/ui/tooltip').then(mod => ({ default: mod.TooltipProvider })));
const LazyToaster = React.lazy(() => import('./components/ui/toaster').then(mod => ({ default: mod.Toaster })));

// Simple test component
function TestApp() {
  console.log('✅ TestApp component is rendering!');
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>SSELFIE Studio - Basic Test</h1>
      <p>If you see this, the basic React setup is working!</p>
      <p>React version: {React.version}</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <p>Console check: Open browser dev tools to see the log message.</p>
    </div>
  );
}

// Lazy load Stack Auth components to ensure React is fully initialized
const StackAuthWrapper = React.lazy(() => import('./components/StackAuthWrapper'));

// Simple loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Loading SSELFIE Studio...</p>
      </div>
    </div>
  );
}

try {
  console.log('🚀 SSELFIE Studio: Starting app initialization...');
  const container = document.getElementById("root");
  if (!container) {
    console.error('❌ Root element not found!');
    throw new Error("Failed to find the root element");
  }

  console.log('✅ Root element found, creating React root...');
  const root = createRoot(container as Element);
  console.log('✅ React root created, rendering app with lazy-loaded Stack Auth...');

  root.render(
    <RootWrapper>
      <App />
    </RootWrapper>
  );
  console.log('✅ App with lazy-loaded Stack Auth rendered successfully!');

} catch (error) {
  console.error('❌ SSELFIE Studio: Fatal error during app initialization:', error);
  
  // Fallback error display
  const container = document.getElementById("root");
  if (container) {
    container.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: -apple-system, sans-serif;">
        <h1 style="color: #dc2626;">SSELFIE Studio - Loading Error</h1>
        <p style="color: #666;">There was an error loading the application.</p>
        <details style="margin-top: 20px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
          <summary style="cursor: pointer; font-weight: bold;">Technical Details</summary>
          <pre style="background: #f5f55; padding: 10px; overflow-x: auto; margin-top: 10px;">${error}</pre>
        </details>
        <p style="margin-top: 20px;">
          <a href="/" style="color: #2563eb; text-decoration: none;">← Try Again</a>
        </p>
      </div>
    `;
  }
}
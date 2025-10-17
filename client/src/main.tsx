import * as React from 'react';
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

  // Set up global error handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
    // Don't prevent default - let the browser handle it
  });

  // Set up global error handler for runtime errors
  window.addEventListener('error', (event) => {
    console.error('❌ Global error:', event.error);
    // Don't prevent default - let the browser handle it
  });

} catch (error) {
  console.error('❌ SSELFIE Studio: Fatal error during app initialization:', error);

  // Fallback error display
  const container = document.getElementById("root");
  if (container) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : '';

    container.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: -apple-system, sans-serif; background: #f9fafb; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
        <div style="max-width: 600px; width: 100%; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
          <h1 style="color: #dc2626; margin: 0 0 10px 0; font-size: 24px;">SSELFIE Studio - Loading Error</h1>
          <p style="color: #666; margin: 0 0 20px 0;">There was an error loading the application. Please try refreshing the page.</p>

          <details style="margin: 20px 0; text-align: left; background: #f3f4f6; padding: 12px; border-radius: 4px; border-left: 4px solid #dc2626;">
            <summary style="cursor: pointer; font-weight: bold; color: #374151;">Technical Details</summary>
            <pre style="background: #fff; padding: 12px; overflow-x: auto; margin-top: 10px; border-radius: 4px; font-size: 12px; color: #dc2626; border: 1px solid #fee2e2;">Error: ${errorMessage}

${errorStack || 'No stack trace available'}</pre>
          </details>

          <div style="margin-top: 20px; display: flex; gap: 10px;">
            <button onclick="window.location.reload()" style="flex: 1; padding: 10px 20px; background: #000; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
              Refresh Page
            </button>
            <button onclick="window.location.href = '/'" style="flex: 1; padding: 10px 20px; background: #e5e7eb; color: #374151; border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">
              Go Home
            </button>
          </div>

          <p style="margin-top: 20px; font-size: 12px; color: #999;">
            If this problem persists, please contact support or try clearing your browser cache.
          </p>
        </div>
      </div>
    `;
  }
}
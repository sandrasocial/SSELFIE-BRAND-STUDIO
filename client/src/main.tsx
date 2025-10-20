import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// IMPORTANT: Initialize Stack fetch proxy and client BEFORE importing any @stackframe/react modules
import { stackClientApp } from "../../stack/client";

// 💡 IMPORT ALL PROVIDERS HERE (safe after proxy setup)
import { StackProvider, StackTheme } from '@stackframe/react';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';

// Import query client initializer
import { initQueryClient } from "./lib/queryClient";

(async () => {
  try {
    await initQueryClient();
  } catch (e) {
    console.error('[Bootstrap] QueryClient init failed:', e);
  }

  const container = document.getElementById('root');
  if (!container) return;

  // HMR-safe: reuse existing root if present
  const w = window as any;
  const existingRoot = w.__APP_ROOT__ as any | undefined;
  const root = existingRoot ?? createRoot(container);
  w.__APP_ROOT__ = root;

  root.render(
    <React.StrictMode>
      <StackProvider app={stackClientApp}>
        <StackTheme>
          <TooltipProvider>
            <App />
            <Toaster />
          </TooltipProvider>
        </StackTheme>
      </StackProvider>
    </React.StrictMode>
  );
})();

import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 💡 IMPORT ALL PROVIDERS HERE
import { QueryClientProvider } from '@tanstack/react-query';
import { StackProvider, StackTheme } from '@stackframe/react';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';

// Import queryClient and stackClientApp
import { queryClient } from "./lib/queryClient";
// Re-enable Stack Auth import
import { stackClientApp } from "../../stack/client";













const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <StackProvider app={stackClientApp}>
        <StackTheme>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <App />
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        </StackTheme>
      </StackProvider>
    </React.StrictMode>
  );
}
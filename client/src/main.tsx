import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 💡 IMPORT ALL PROVIDERS HERE

import { StackProvider, StackTheme } from '@stackframe/react';
import { Toaster } from './components/ui/toaster';
import { TooltipProvider } from './components/ui/tooltip';

// Import queryClient and stackClientApp

// Re-enable Stack Auth import
import { stackClientApp } from "../../stack/client";













const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
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
}
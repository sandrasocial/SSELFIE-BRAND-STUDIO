import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Force React global for forwardRef compatibility - CRITICAL FIX
if (typeof window !== 'undefined') {
  (window as any).React = React;
  (window as any).forwardRef = React.forwardRef;
  // Also inject createElement for complete compatibility
  (window as any).createElement = React.createElement;
  // Make sure globals are available before any component renders
  Object.defineProperty(window, 'forwardRef', {
    value: React.forwardRef,
    writable: false,
    configurable: false
  });
  console.log('SSELFIE: React globals injected', { 
    React: typeof window.React, 
    forwardRef: typeof window.forwardRef,
    createElement: typeof window.createElement 
  });
}

// Debug logging for troubleshooting
console.log('SSELFIE Studio: Main.tsx loading...');
console.log('SSELFIE Studio: Root element found:', !!document.getElementById("root"));

// Force cache bust for forwardRef fix - August 12, 2025
console.log('SSELFIE Studio: ForwardRef fixes loaded', { version: '2.0.0', timestamp: Date.now() });

createRoot(document.getElementById("root")!).render(<App />);

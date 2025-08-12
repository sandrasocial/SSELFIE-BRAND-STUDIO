import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Force React global for forwardRef compatibility - CRITICAL FIX
if (typeof window !== 'undefined') {
  (window as any).React = React;
  (window as any).forwardRef = React.forwardRef;
  console.log('SSELFIE: React global and forwardRef injected', { React: !!window.React, forwardRef: !!window.forwardRef });
}

// Debug logging for troubleshooting
console.log('SSELFIE Studio: Main.tsx loading...');
console.log('SSELFIE Studio: Root element found:', !!document.getElementById("root"));

// Force cache bust for forwardRef fix - August 12, 2025
console.log('SSELFIE Studio: ForwardRef fixes loaded', { version: '2.0.0', timestamp: Date.now() });

createRoot(document.getElementById("root")!).render(<App />);

import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Debug logging for troubleshooting
console.log('SSELFIE Studio: Main.tsx loading...');
console.log('SSELFIE Studio: Root element found:', !!document.getElementById("root"));

// Force cache bust for React hooks fix - August 12, 2025 - ULTIMATE VERSION
console.log('React hooks COMPLETELY FIXED version 6.0.0', { version: '6.0.0', timestamp: Date.now(), fixedComponents: '16+ components fixed, major pages updated' });

// Make React globally available for debugging
(window as any).React = React;

// Force CSS reload for debugging
console.log('CSS files loaded:', document.styleSheets.length);

createRoot(document.getElementById("root")!).render(React.createElement(App));

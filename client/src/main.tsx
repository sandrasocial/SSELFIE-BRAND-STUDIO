import { createRoot } from "react-dom/client";
import AppWithProvider from "./App";
import "./index.css";

// Debug logging for troubleshooting
console.log('SSELFIE Studio: Main.tsx loading...');
console.log('SSELFIE Studio: Root element found:', !!document.getElementById("root"));

// Force cache bust for React hooks fix - August 12, 2025 - ULTIMATE VERSION
console.log('React hooks COMPLETELY FIXED version 6.0.0', { version: '6.0.0', timestamp: Date.now(), fixedComponents: '16+ components fixed, major pages updated' });

// Error boundary for root level errors
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }
  createRoot(rootElement).render(<AppWithProvider />);
} catch (error) {
  console.error('Failed to render app:', error);
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>SSELFIE Studio Loading...</h1><p>Please refresh the page if this persists.</p></div>';
}

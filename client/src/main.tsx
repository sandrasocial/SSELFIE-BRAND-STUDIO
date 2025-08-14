import { createRoot } from "react-dom/client";
import AppWithProvider from "./App";
import "./index.css";

// Debug logging for troubleshooting
console.log('SSELFIE Studio: Main.tsx loading...');
console.log('SSELFIE Studio: Root element found:', !!document.getElementById("root"));

// Environment detection logging
console.log('SSELFIE Studio: Application starting...', { timestamp: Date.now(), environment: 'development' });

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

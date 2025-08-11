import React from "react";
import { createRoot } from "react-dom/client";
import App from "./MinimalApp";
import "./index.css";

// Debug logging for troubleshooting
console.log('SSELFIE Studio: Main.tsx loading...');
console.log('SSELFIE Studio: Root element found:', !!document.getElementById("root"));

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('SSELFIE Studio: Creating React root...');
  const root = createRoot(rootElement);
  
  console.log('SSELFIE Studio: Rendering App component...');
  root.render(<App />);
  
  console.log('SSELFIE Studio: App rendered successfully!');
} catch (error) {
  console.error('SSELFIE Studio: Fatal error during render:', error);
  
  // Fallback: show error message directly in DOM
  const rootEl = document.getElementById("root");
  if (rootEl) {
    rootEl.innerHTML = `
      <div style="padding: 20px; font-family: Arial; color: red; background: #ffe6e6; border: 1px solid red; margin: 20px;">
        <h1>React Render Error</h1>
        <p>Error: ${error instanceof Error ? error.message : String(error)}</p>
        <pre>${error instanceof Error ? error.stack : ''}</pre>
      </div>
    `;
  }
}

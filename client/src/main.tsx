import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('SSELFIE Studio: Starting React app...');

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('SSELFIE Studio: Root element found, creating React root...');
  const root = createRoot(rootElement);
  
  console.log('SSELFIE Studio: Rendering App component...');
  root.render(<App />);
  
  console.log('SSELFIE Studio: App rendered successfully');
} catch (error) {
  console.error('SSELFIE Studio: Error starting app:', error);
  
  // Show error message on page
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; background: #f8f9fa; border-left: 4px solid #dc3545; margin: 20px;">
      <h2 style="color: #dc3545; margin-top: 0;">App Loading Error</h2>
      <p><strong>Error:</strong> ${error.message}</p>
      <p><strong>Please:</strong> Refresh the page or contact support</p>
    </div>
  `;
  document.body.appendChild(errorDiv);
}

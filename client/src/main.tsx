import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('SSELFIE Studio: Starting React app...');
console.log('Root element:', document.getElementById("root"));

try {
  const root = document.getElementById("root");
  if (!root) {
    console.error('SSELFIE Studio: Root element not found!');
    throw new Error('Root element not found');
  }
  
  console.log('SSELFIE Studio: Creating React root...');
  const reactRoot = createRoot(root);
  
  console.log('SSELFIE Studio: Rendering App component...');
  reactRoot.render(<App />);
  
  console.log('SSELFIE Studio: React app mounted successfully!');
} catch (error) {
  console.error('SSELFIE Studio: Failed to mount React app:', error);
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: red; font-family: system-ui;">
      <h1>SSELFIE Studio Error</h1>
      <p>Failed to load the application. Please refresh the page.</p>
      <p>Error: ${error.message}</p>
    </div>`;
  }
}

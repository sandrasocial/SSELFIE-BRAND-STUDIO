import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log('SSELFIE Studio: Starting React app...');

// Test render a simple component first to debug
function TestComponent() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>SSELFIE Studio Test Page</h1>
      <p>React is working! Server time: {new Date().toISOString()}</p>
      <p>Environment: {import.meta.env.NODE_ENV}</p>
      <div style={{ marginTop: '20px' }}>
        <a href="/test" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Navigation Test</a>
      </div>
    </div>
  );
}

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('SSELFIE Studio: Root element found, creating React root...');
  const root = createRoot(rootElement);
  
  console.log('SSELFIE Studio: Rendering test component first...');
  // Render test component first to ensure React works
  root.render(<TestComponent />);
  
  // After 3 seconds, load the full app
  setTimeout(() => {
    console.log('SSELFIE Studio: Loading full app...');
    root.render(<App />);
  }, 3000);
  
  console.log('SSELFIE Studio: Test component rendered successfully');
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

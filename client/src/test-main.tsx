import React from 'react';
import { createRoot } from "react-dom/client";

console.log('Simple test app loading...');

function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>SSELFIE Studio - Test App</h1>
      <p>If you see this, the basic React setup is working!</p>
      <p>React version: {React.version}</p>
    </div>
  );
}

const container = document.getElementById("root") as Element;
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
} else {
  console.error('Root element not found!');
}
import React from "react";
import { createRoot } from "react-dom/client";
import TestComponent from "./TestComponent";

// Debug logging for troubleshooting
console.log('SSELFIE Studio: Main.tsx loading...');

const rootElement = document.getElementById("root");
console.log('SSELFIE Studio: Root element found:', !!rootElement);

if (rootElement) {
  try {
    console.log('SSELFIE Studio: Creating React root...');
    createRoot(rootElement).render(<TestComponent />);
    console.log('SSELFIE Studio: React app rendered successfully!');
  } catch (error) {
    console.error('SSELFIE Studio: Render error:', error);
  }
} else {
  console.error('SSELFIE Studio: Root element not found!');
}

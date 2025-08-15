import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Debug logging for troubleshooting
console.log('SSELFIE Studio: Main.tsx loading...');

const rootElement = document.getElementById("root");
console.log('SSELFIE Studio: Root element found:', !!rootElement);

if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error('SSELFIE Studio: Root element not found!');
}

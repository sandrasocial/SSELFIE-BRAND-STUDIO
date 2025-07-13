import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add comprehensive error boundary and logging
console.log("main.tsx executing");

try {
  const rootElement = document.getElementById("root");
  console.log("Root element found:", rootElement);
  
  if (rootElement) {
    console.log("Creating React root...");
    const root = createRoot(rootElement);
    console.log("React root created, rendering App...");
    root.render(<App />);
    console.log("App rendered successfully!");
  } else {
    console.error("Root element not found");
    document.body.innerHTML = '<div style="color: red; padding: 20px; font-size: 20px;">EMERGENCY: Root element not found!</div>';
  }
} catch (error) {
  console.error("Failed to mount React app:", error);
  document.body.innerHTML = '<div style="color: red; padding: 20px; font-size: 20px;">EMERGENCY: React app failed to mount: ' + error + '</div>';
}

import { createRoot } from "react-dom/client";
import App from "./App-minimal";
import "./index.css";

// Emergency React mounting with maximum logging
console.log("main.tsx executing - step 1");

// First replace the loading screen to show we're executing
const rootElement = document.getElementById("root");
if (rootElement) {
  rootElement.innerHTML = '<div style="background: purple; color: white; padding: 50px; text-align: center; font-size: 20px;">🟣 Step 2: main.tsx executing, importing React...</div>';
}

console.log("Step 2: About to import React");

try {
  console.log("Step 3: Creating React root");
  const root = createRoot(rootElement!);
  console.log("Step 4: React root created, rendering App");
  
  root.render(<App />);
  console.log("Step 5: App rendered successfully!");
  
} catch (error) {
  console.error("Step ERROR: Failed to mount React app:", error);
  if (rootElement) {
    rootElement.innerHTML = `<div style="background: red; color: white; padding: 50px; text-align: center; font-size: 20px;">❌ ERROR: ${error.message || error}</div>`;
  }
}

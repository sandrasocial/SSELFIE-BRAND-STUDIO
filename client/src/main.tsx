import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("SSELFIE: main.tsx loaded - rendering React app");
const rootElement = document.getElementById("root");
console.log("SSELFIE: Root element found:", !!rootElement);

if (rootElement) {
  createRoot(rootElement).render(<App />);
  console.log("SSELFIE: React app rendered successfully");
} else {
  console.error("SSELFIE: Root element not found");
}

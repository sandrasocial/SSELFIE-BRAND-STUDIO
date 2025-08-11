import { createRoot } from "react-dom/client";
import App from "./App-minimal";
// import "./index.css"; // Temporarily disabled

// Debug logging for troubleshooting
console.log('SSELFIE Studio: Main.tsx loading...');
console.log('SSELFIE Studio: Root element found:', !!document.getElementById("root"));

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error('SSELFIE Studio: Root element not found');
}

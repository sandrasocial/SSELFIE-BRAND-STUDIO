import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Debug logging for troubleshooting
console.log('SSELFIE Studio: Main.tsx loading...');
console.log('SSELFIE Studio: Root element found:', !!document.getElementById("root"));

// Force cache bust for React hooks fix - August 12, 2025 - ULTIMATE VERSION
console.log('SSELFIE Studio: React hooks COMPLETELY FIXED', { version: '4.0.0', timestamp: Date.now() });

createRoot(document.getElementById("root")!).render(<App />);

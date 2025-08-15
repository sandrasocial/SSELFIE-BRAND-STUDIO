import { createRoot } from "react-dom/client";
import App from "./App-simple";
import "./index.css";

// Debug logging for troubleshooting
console.log('SSELFIE Studio: Main.tsx loading...');
console.log('SSELFIE Studio: Root element found:', !!document.getElementById("root"));

createRoot(document.getElementById("root")!).render(<App />);

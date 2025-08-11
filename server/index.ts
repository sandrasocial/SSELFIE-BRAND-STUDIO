import express from 'express';
import { createServer } from "http";
import { registerRoutes } from "./routes";
import path from "path";
import fs from "fs";

const app = express();
const server = createServer(app);
const port = Number(process.env.PORT) || 5000;

async function startServer() {
  console.log('🚀 Starting SSELFIE Studio with all your features...');
  
  // Setup all your comprehensive routes with your 4 months of work
  await registerRoutes(app);
  console.log('✅ All your routes and services loaded successfully!');

  // Serve React app (temporary static serving until Vite config is fixed)
  const clientPath = path.join(__dirname, '../client');
  app.use(express.static(path.join(clientPath, 'public')));
  
  // Serve index.html for all non-API routes
  app.get('*', (req, res) => {
    const htmlPath = path.join(clientPath, 'index.html');
    if (fs.existsSync(htmlPath)) {
      res.sendFile(htmlPath);
    } else {
      res.status(404).send('Client not found');
    }
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 SSELFIE Studio LIVE on port ${port}`);
    console.log(`🌐 Your complete application: http://localhost:${port}`);
    console.log(`📦 All your routes and services are now active!`);
    console.log(`🎯 Including: Maya, Victoria, Training, Payments, Admin tools, and ALL your features!`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
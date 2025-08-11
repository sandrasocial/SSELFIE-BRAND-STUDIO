import express from 'express';
import { registerRoutes } from './routes';
import { setupVite } from './vite';

const app = express();

// CRITICAL: Register all application routes BEFORE Vite
const httpServer = await registerRoutes(app);

const port = process.env.PORT || 5000;

// Setup Vite development server for frontend AFTER all API routes are registered
setupVite(app, httpServer).then(() => {
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`🚀 SSELFIE Studio Server running on port ${port}`);
    console.log(`📱 Frontend: http://localhost:${port}`);
    console.log(`🔗 API: http://localhost:${port}/api`);
  });
}).catch(err => {
  console.error('Failed to setup Vite:', err);
  process.exit(1);
});
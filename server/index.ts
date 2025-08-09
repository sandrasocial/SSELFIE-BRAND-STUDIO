import express from 'express';

const app = express();

// REMOVED: All Sentry, Prometheus, and complex monitoring systems that were causing crashes

// Import and register all routes
import { registerRoutes } from './routes';

// CRITICAL FIX: Register all application routes BEFORE Vite
// This ensures API routes are processed before Vite wildcard catches them
const httpServer = await registerRoutes(app);

// EMERGENCY FIX: Add explicit API route protection before Vite middleware
app.use('/api/*', (req, res, next) => {
  // If we get here, the API route wasn't handled by registerRoutes
  // This means the route doesn't exist
  res.status(404).json({ error: 'API endpoint not found' });
});

// REMOVED: Complex error handlers that were causing restart loops

// Setup server and Vite
import { setupVite } from './vite';

const port = process.env.PORT || 5000;

// Use the server returned from registerRoutes
const server = httpServer;

// CLEAN SERVER START: No complex monitoring systems
server.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
  console.log('✅ Admin agents: /api/consulting-agents/admin/consulting-chat');
});

// Setup Vite development server for frontend AFTER server is running  
setupVite(app, server).catch(err => {
  console.error('Vite setup failed, but server continues running for admin agents:', err);
  // Don't exit - keep server running for admin agents
});
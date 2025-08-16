import express from 'express';
import { createServer } from 'http';
import { setupVite } from './server/vite';
import { registerRoutes } from './server/routes';
import path from 'path';

const app = express();
const server = createServer(app);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Basic CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

async function startDevServer() {
  try {
    // Register API routes first
    console.log('🔧 Registering API routes...');
    await registerRoutes(app);
    
    // Setup Vite in development mode
    console.log('🚀 Setting up Vite development server...');
    await setupVite(app, server);
    
    const port = process.env.PORT || 5173;
    server.listen(port, '0.0.0.0', () => {
      console.log(`✅ Development server running on http://localhost:${port}`);
      console.log('📋 Backend API and frontend are both served through Vite');
    });
  } catch (error) {
    console.error('❌ Failed to start development server:', error);
    
    // Fallback to basic server
    const port = process.env.PORT || 5173;
    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Basic server running on port ${port} (with limitations)`);
    });
  }
}

startDevServer();
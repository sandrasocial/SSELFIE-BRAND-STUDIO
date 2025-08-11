import express from 'express';
import { registerRoutes } from './routes';

const app = express();

async function startServer() {
  try {
    console.log('🚀 Starting SSELFIE Studio server...');
    
    // Register all routes and get the server instance
    const server = await registerRoutes(app);
    
    const port = Number(process.env.PORT) || 5000;
    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 SSELFIE Studio server running on port ${port}`);
      console.log(`🌐 Access your app: http://localhost:${port}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
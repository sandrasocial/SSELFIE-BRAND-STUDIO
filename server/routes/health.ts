import type { Express } from "express";

export function setupHealthRoutes(app: Express) {
  // Essential health checks for deployment
  app.get('/health', (req, res) => {
    try {
      res.status(200).json({ 
        status: 'ok', 
        timestamp: Date.now(),
        server: 'stable-typescript'
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ status: 'error', error: 'Health check failed' });
    }
  });

  app.get('/api/health', (req, res) => {
    try {
      res.status(200).json({ 
        status: 'ok', 
        timestamp: Date.now(),
        api: 'operational'
      });
    } catch (error) {
      console.error('API Health check error:', error);
      res.status(500).json({ status: 'error', error: 'API health check failed' });
    }
  });

  console.log('✅ Health routes registered');
}
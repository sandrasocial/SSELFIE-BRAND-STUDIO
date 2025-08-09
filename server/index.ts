import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import { logger, metrics, Sentry } from './config/monitoring';
import * as prometheus from 'prom-client';

const app = express();

// Sentry request handler must be the first middleware
// app.use(Sentry.Handlers.requestHandler()); // Temporarily disabled

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration / 1000);
    
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });
  next();
});

// Import and register all routes
import { registerRoutes } from './routes';

// CRITICAL FIX: Register all application routes BEFORE Vite
// This ensures API routes are processed before Vite wildcard catches them
const httpServer = await registerRoutes(app);

// Sentry error handler must be before any other error middleware
// app.use(Sentry.Handlers.errorHandler()); // Temporarily disabled

// Global error handler
app.use(errorHandler);

// Setup server and Vite
import { setupVite } from './vite';

// Disable HMR to fix websocket connection loop in development
if (process.env.NODE_ENV === 'development') {
  process.env.VITE_HMR = 'false';
}

const port = process.env.PORT || 5000;

// Use the server returned from registerRoutes
const server = httpServer;

// Setup Vite development server for frontend AFTER all API routes are registered
setupVite(app, server).then(() => {
  server.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
    metrics.activeUsers.set(0); // Initialize active users metric
  });
}).catch(err => {
  console.error('Failed to setup Vite:', err);
  process.exit(1);
});
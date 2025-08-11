import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import { logger, metrics } from './config/monitoring';
import * as prometheus from 'prom-client';

const app = express();

// Sentry request handler must be the first middleware
// app.use(Sentry.Handlers.requestHandler()); // Disabled until Sentry is properly configured

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

// Import error prevention middleware
import { errorPreventionMiddleware } from '../middleware/error-prevention.js';

// Apply error prevention middleware
app.use(errorPreventionMiddleware);

// REMOVED: Conflicting session from auth.service.ts - using Replit auth system in routes.ts

// Simplified startup for immediate functionality
const port = process.env.PORT || 5000;

app.get('/api/health', (req: any, res: any) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start basic server first
const server = app.listen(port, '0.0.0.0', () => {
  logger.info(`Basic server running on port ${port}`);
  console.log(`Server accessible at http://localhost:${port}`);
});
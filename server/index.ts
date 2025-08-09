import express from 'express';
import { errorHandler } from './middleware/errorHandler';
import { logger, metrics, Sentry } from './config/monitoring';
import * as prometheus from 'prom-client';

const app = express();

// Sentry request handler must be the first middleware
app.use(Sentry.Handlers.requestHandler());

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

// Your existing routes go here
// ...

// Sentry error handler must be before any other error middleware
app.use(Sentry.Handlers.errorHandler());

// Global error handler
app.use(errorHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
  metrics.activeUsers.set(0); // Initialize active users metric
});
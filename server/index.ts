
import "./env-setup.js";
import express from 'express';
import { registerRoutes } from './routes';
import { securityHeaders, inputValidation } from './middleware/security';
import { rateLimits } from './middleware/rate-limiter';
import { cacheMiddleware, staticDataCache } from './utils/cache';
import { Logger } from './utils/logger';

const app = express();
const logger = new Logger('Server');

// Trust proxy for rate limiting
app.set('trust proxy', true);

// Security middleware
app.use(securityHeaders);
app.use(inputValidation);

// Rate limiting
app.use(rateLimits.general);

// Health and root endpoints with caching
app.get('/health', cacheMiddleware(staticDataCache, 30), (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'SSELFIE Studio',
    timestamp: new Date().toISOString(),
  });
});
app.get('/api/health', cacheMiddleware(staticDataCache, 30), (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});
app.get('/', (req, res) => {
  res.status(200).send('SSELFIE Studio API');
});

// Register all routes (async for test compatibility)
async function setupApp() {
  await registerRoutes(app);
}

// Only auto-run if not in test
if (process.env.NODE_ENV !== 'test') {
  setupApp();
}

export { app, setupApp };
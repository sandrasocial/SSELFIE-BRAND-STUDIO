
import "./env-setup.js";
import express from 'express';
import { registerRoutes } from './routes';

const app = express();
app.set('trust proxy', true);

// Health and root endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'SSELFIE Studio',
    timestamp: new Date().toISOString(),
  });
});
app.get('/api/health', (req, res) => {
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
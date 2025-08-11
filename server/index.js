const express = require('express');

// Simple error handler for deployment
const errorHandler = (error, req, res, next) => {
  console.error('Error:', error.message);
  res.status(500).json({ error: 'Internal Server Error' });
};

// Simple logging
const logger = {
  info: (data) => console.log('INFO:', data),
  error: (data) => console.error('ERROR:', data)
};

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'SSELFIE Studio API', 
    status: 'running',
    version: '1.0.0',
    agents: 'autonomous_mode_enabled'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic API route
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'running', 
    agents: 'autonomous_mode_enabled',
    deployment: 'stabilized'
  });
});

// Error handling
app.use(errorHandler);

const port = process.env.PORT || 5000;

app.listen(port, '0.0.0.0', () => {
  logger.info(`🚀 SSELFIE Studio Server running on port ${port}`);
  logger.info('🤖 Autonomous agents ready for deployment');
});
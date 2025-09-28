/**
 * Production Server Integration Example
 * Shows how to integrate all production readiness components
 */

import express from 'express';
import security from '../middleware/security.js';
import cache from '../middleware/cache.js';
import monitoring from '../server/monitoring.js';

const app = express();

// Basic middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Production readiness middleware stack
app.use(monitoring.middleware()); // Monitoring and error tracking
app.use(security.headers); // Security headers
app.use(security.logging()); // Security logging
app.use(cache.static); // Static asset caching

// API routes with enhanced security and caching
app.use('/api/public', 
  security.rateLimit.lenient, // More permissive rate limiting for public APIs
  cache.api, // Short-term API caching
  security.validation // Input validation and sanitization
);

app.use('/api/user',
  security.rateLimit.normal, // Standard rate limiting
  cache.user, // User-specific caching
  security.validation
);

app.use('/api/admin',
  security.rateLimit.strict, // Strict rate limiting for admin
  security.apiKey({ required: true }), // Require API key
  security.validation
);

// Health and monitoring endpoints
app.get('/health', async (req, res) => {
  try {
    const health = await import('../api/health.js');
    return health.default(req, res);
  } catch (error) {
    monitoring.errorTracker.captureException(error as Error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

app.get('/metrics', cache.stats());
app.get('/monitoring', (req, res) => {
  res.json(monitoring.health());
});

// Example API endpoints
app.get('/api/public/status', (req, res) => {
  res.json({ 
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/user/profile', (req, res) => {
  // This would normally fetch user data
  res.json({
    id: 'user123',
    name: 'John Doe',
    email: 'john@example.com',
    lastLogin: new Date().toISOString()
  });
});

app.post('/api/user/update', (req, res) => {
  // This would normally update user data
  monitoring.logger.info('User profile updated', { userId: 'user123' });
  res.json({ success: true, message: 'Profile updated' });
});

app.get('/api/admin/stats', (req, res) => {
  const performanceMetrics = monitoring.performanceMonitor.getMetrics();
  res.json({
    performance: performanceMetrics,
    cache: cache.stats(),
    security: {
      rateLimitActive: true,
      headersConfigured: true
    }
  });
});

// Error handling
app.use(monitoring.errorHandler());

// Start server (example)
const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    monitoring.logger.info(`🚀 Production server started on port ${PORT}`);
    
    // Log production readiness status
    console.log('🔒 Security: Enabled');
    console.log('⚡ Caching: Enabled');
    console.log('📊 Monitoring: Enabled');
    console.log('🛡️ Rate Limiting: Enabled');
    console.log('📝 Logging: Enabled');
    
    // Send startup alert
    monitoring.alertManager.sendAlert(
      'info',
      'Server Started',
      `Production server started successfully on port ${PORT}`,
      { port: PORT, timestamp: new Date().toISOString() }
    );
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  monitoring.logger.info('🛑 Received SIGTERM, shutting down gracefully');
  monitoring.alertManager.sendAlert(
    'info',
    'Server Shutdown',
    'Server is shutting down gracefully',
    { timestamp: new Date().toISOString() }
  );
  process.exit(0);
});

process.on('SIGINT', () => {
  monitoring.logger.info('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  monitoring.errorTracker.captureException(error);
  monitoring.alertManager.sendAlert(
    'critical',
    'Uncaught Exception',
    error.message,
    { stack: error.stack }
  );
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  monitoring.errorTracker.captureMessage(
    'Unhandled Promise Rejection',
    'error',
    { reason, promise }
  );
  monitoring.alertManager.sendAlert(
    'critical',
    'Unhandled Promise Rejection',
    String(reason)
  );
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
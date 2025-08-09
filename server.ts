import { env } from './config/environment.validator';
import { validateStartupRequirements } from './config/startup.validator';
import express from 'express';
import { setupSecurityMiddleware } from './middleware/security';
import { setupRoutes } from './routes';
import { setupErrorHandling } from './middleware/error-handling';

async function startServer() {
  try {
    // Validate all startup requirements
    await validateStartupRequirements();

    const app = express();
    
    // Setup middleware
    setupSecurityMiddleware(app);
    
    // Setup routes
    setupRoutes(app);
    
    // Setup error handling
    setupErrorHandling(app);

    // Start server
    const server = app.listen(env.PORT, () => {
      console.log(`✅ Server started successfully on port ${env.PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received. Starting graceful shutdown...');
      server.close(() => {
        console.log('✅ Server shutdown complete');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
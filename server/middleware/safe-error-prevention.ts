import { Request, Response, NextFunction } from 'express';

// Simple, reliable error prevention middleware that won't crash the app
export const safeErrorPreventionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Add basic request logging without dependencies
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    
    // Continue to next middleware
    next();
  } catch (error) {
    console.error('Error in safe error prevention middleware:', error);
    // Don't crash - just log and continue
    next();
  }
};

// Safe global error handler that won't cause crashes
export const safeGlobalErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  try {
    console.error('Global error caught:', {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // Send error response without crashing
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
      });
    }
  } catch (handlerError) {
    console.error('Error in error handler:', handlerError);
    // Last resort - try to send basic response
    if (!res.headersSent) {
      res.status(500).send('Internal server error');
    }
  }
};
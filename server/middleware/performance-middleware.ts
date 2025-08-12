// ZARA'S PERFORMANCE OPTIMIZATION MIDDLEWARE
// Implementing server-side performance improvements

import { Request, Response, NextFunction } from 'express';
import compression from 'compression';

// Response compression middleware  
export const compressionMiddleware = compression({
  filter: (req: Request, res: Response) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Good balance between compression ratio and speed
  threshold: 1024 // Only compress responses larger than 1KB
});

// Response caching middleware
export const cacheMiddleware = (duration: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Set cache headers for static assets
    if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
      res.setHeader('Cache-Control', `public, max-age=${duration}`);
    }
    next();
  };
};

// API response optimization middleware
export const apiOptimizationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  const startTime = Date.now();
  
  res.send = function(data: any) {
    const responseTime = Date.now() - startTime;
    
    // Add performance headers
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    res.setHeader('X-Powered-By', 'SSELFIE-Studio');
    
    // Log slow responses
    if (responseTime > 1000) {
      console.warn(`Slow API response: ${req.method} ${req.url} took ${responseTime}ms`);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Request size limiting middleware
export const requestSizeLimiter = (limit: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0', 10);
    const maxSize = parseInt(limit.replace(/[^\d]/g, '')) * (limit.includes('mb') ? 1024 * 1024 : 1024);
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        error: 'Request entity too large',
        maxSize: limit,
        receivedSize: `${Math.round(contentLength / 1024)}KB`
      });
    }
    
    next();
  };
};

// Memory usage monitoring
export const memoryMonitor = (req: Request, res: Response, next: NextFunction) => {
  const memUsage = process.memoryUsage();
  const memoryMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };
  
  // Log high memory usage
  if (memoryMB.heapUsed > 512) { // Alert if heap usage > 512MB
    console.warn(`High memory usage detected: ${memoryMB.heapUsed}MB heap used`);
  }
  
  // Add memory info to response headers in development
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('X-Memory-Usage', JSON.stringify(memoryMB));
  }
  
  next();
};
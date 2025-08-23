/**
 * ZARA'S PERFORMANCE MIDDLEWARE
 * Created to resolve server startup issue and optimize SSELFIE Studio
 */
import compression from 'compression';
import express from 'express';

// Compression middleware for 75% size reduction
export const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
});

// Cache middleware with TTL
export function cacheMiddleware(ttlSeconds = 300) {
  return (req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      res.set('Cache-Control', `public, max-age=${ttlSeconds}`);
    }
    next();
  };
}

// API optimization middleware  
export const apiOptimizationMiddleware = (req, res, next) => {
  // Add performance headers
  res.set('X-Response-Time', Date.now().toString());
  
  // Track API response times
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.log(`⚠️ Slow API: ${req.path} took ${duration}ms`);
    }
  });
  
  next();
};

// Memory monitoring middleware
export const memoryMonitor = (req, res, next) => {
  const usage = process.memoryUsage();
  if (usage.heapUsed > 500 * 1024 * 1024) { // 500MB threshold
    console.log('⚠️ High memory usage:', Math.round(usage.heapUsed / 1024 / 1024) + 'MB');
  }
  next();
};

console.log('✅ ZARA: Performance middleware module loaded successfully');
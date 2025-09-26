/**
 * Serverless Database Middleware for Vercel Functions
 * Ensures proper connection management and cleanup for Neon serverless driver
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cleanup } from '../../server/db.js';

export interface ServerlessContext {
  cleanup: () => Promise<void>;
  connectionStartTime: number;
}

/**
 * Middleware to wrap Vercel API handlers with proper serverless database management
 */
export function withServerlessDb<T = any>(
  handler: (req: VercelRequest, res: VercelResponse, ctx: ServerlessContext) => Promise<T>
) {
  return async (req: VercelRequest, res: VercelResponse): Promise<T> => {
    const connectionStartTime = Date.now();
    
    try {
      // Create context for the handler
      const ctx: ServerlessContext = {
        cleanup: cleanup,
        connectionStartTime
      };

      // Execute the handler
      const result = await handler(req, res, ctx);

      // Ensure cleanup before returning
      await cleanup();
      
      return result;
      
    } catch (error) {
      console.error('❌ Serverless handler error:', error);
      
      // Ensure cleanup on error
      try {
        await cleanup();
      } catch (cleanupError) {
        console.error('❌ Cleanup error:', cleanupError);
      }
      
      throw error;
    }
  };
}

/**
 * Simple wrapper for quick migration of existing handlers
 */
export function withNeonServerless(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<any>
) {
  return withServerlessDb(async (req, res, ctx) => {
    const result = await handler(req, res);
    
    // Log connection time for monitoring
    const connectionTime = Date.now() - ctx.connectionStartTime;
    if (connectionTime > 3000) {
      console.warn(`⚠️ Long-running connection: ${connectionTime}ms`);
    }
    
    return result;
  });
}

/**
 * Database health check middleware - adds health info to response headers
 */
export function withHealthHeaders(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<any>
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const startTime = Date.now();
    
    try {
      const result = await handler(req, res);
      
      // Add performance headers
      const duration = Date.now() - startTime;
      res.setHeader('X-Database-Duration', `${duration}ms`);
      res.setHeader('X-Database-Driver', 'neon-serverless');
      res.setHeader('X-Connection-Type', 'http');
      
      return result;
      
    } catch (error) {
      // Add error info to headers
      res.setHeader('X-Database-Error', 'true');
      res.setHeader('X-Database-Driver', 'neon-serverless');
      throw error;
    }
  };
}
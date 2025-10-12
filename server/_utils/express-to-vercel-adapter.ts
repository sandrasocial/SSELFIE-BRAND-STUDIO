/**
 * Express Router to Vercel Serverless Function Adapter
 * 
 * Converts Express Router instances to Vercel-compatible request handlers.
 * This allows us to use Express Router modules in serverless functions.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Router } from 'express';

/**
 * Converts an Express Router to a Vercel serverless function handler
 */
export function adaptExpressRouter(router: Router) {
  return async (req: VercelRequest, res: VercelResponse) => {
    // Import express dynamically to avoid ESM/CommonJS issues
    const express = (await import('express')).default;
    
    // Create a minimal Express app instance
    const app = express();
    
    // Add JSON body parser middleware
    app.use(express.json());
    
    // Mount the router
    app.use(router);
    
    // Convert Vercel request to Express-compatible format
    const expressReq = req as any;
    const expressRes = res as any;
    
    // Handle the request through Express
    return new Promise<void>((resolve, reject) => {
      // Override res.end to resolve promise
      const originalEnd = expressRes.end;
      expressRes.end = function(...args: any[]) {
        originalEnd.apply(this, args);
        resolve();
      };
      
      // Handle errors
      app(expressReq, expressRes, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };
}

/**
 * Check if a URL matches any route in an Express Router
 */
export function routerMatchesUrl(url: string, routePaths: string[]): boolean {
  return routePaths.some(path => {
    // Convert Express route path to regex
    const pattern = path
      .replace(/:[^/]+/g, '[^/]+') // Convert :param to regex
      .replace(/\*/g, '.*'); // Convert * to regex
    
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(url);
  });
}

/**
 * Get all route paths from an Express Router (helper for debugging)
 */
export function getRouterPaths(router: Router): string[] {
  const paths: string[] = [];
  
  // Extract paths from router stack
  if (router.stack) {
    router.stack.forEach((layer: any) => {
      if (layer.route) {
        // Regular route
        paths.push(layer.route.path);
      } else if (layer.name === 'router') {
        // Nested router
        const nestedPaths = getRouterPaths(layer.handle);
        paths.push(...nestedPaths);
      }
    });
  }
  
  return paths;
}

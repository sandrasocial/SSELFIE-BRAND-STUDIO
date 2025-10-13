/**
 * DEBUG ENDPOINT - Environment Variable Checker
 * DELETE THIS FILE AFTER DEBUGGING!
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow in development/testing
  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== 'sandra-admin-2025') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const envCheck = {
    timestamp: new Date().toISOString(),
    
    // Stack Auth variables
    stackAuth: {
      VITE_STACK_PROJECT_ID: !!process.env.VITE_STACK_PROJECT_ID,
      VITE_STACK_PROJECT_ID_value: process.env.VITE_STACK_PROJECT_ID || 'NOT_SET',
      
      STACK_AUTH_PROJECT_ID: !!process.env.STACK_AUTH_PROJECT_ID,
      STACK_AUTH_PROJECT_ID_value: process.env.STACK_AUTH_PROJECT_ID || 'NOT_SET',
      
      STACK_AUTH_SECRET_KEY: !!process.env.STACK_AUTH_SECRET_KEY,
      STACK_AUTH_SECRET_KEY_length: process.env.STACK_AUTH_SECRET_KEY?.length || 0,
      
      STACK_SECRET_SERVER_KEY: !!process.env.STACK_SECRET_SERVER_KEY,
      STACK_SECRET_SERVER_KEY_length: process.env.STACK_SECRET_SERVER_KEY?.length || 0,
      
      STACK_ADMIN_KEY: !!process.env.STACK_ADMIN_KEY,
      STACK_ADMIN_KEY_length: process.env.STACK_ADMIN_KEY?.length || 0,
      
      VITE_STACK_PUBLISHABLE_CLIENT_KEY: !!process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
      VITE_STACK_PUBLISHABLE_CLIENT_KEY_length: process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY?.length || 0,
    },
    
    // Database
    database: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_URL_starts_with: process.env.DATABASE_URL?.substring(0, 20) || 'NOT_SET',
      NEON_DB_URL: !!process.env.NEON_DB_URL,
    },
    
    // External services
    services: {
      REPLICATE_API_TOKEN: !!process.env.REPLICATE_API_TOKEN,
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      AWS_ACCESS_KEY_ID: !!process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: !!process.env.AWS_SECRET_ACCESS_KEY,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    },
    
    // Computed URLs (from our config)
    computed: {
      JWKS_URL: `https://api.stack-auth.com/api/v1/projects/${process.env.VITE_STACK_PROJECT_ID || process.env.STACK_AUTH_PROJECT_ID || 'NOT_SET'}/.well-known/jwks.json`,
      ISSUER: `https://api.stack-auth.com/api/v1/projects/${process.env.VITE_STACK_PROJECT_ID || process.env.STACK_AUTH_PROJECT_ID || 'NOT_SET'}`,
    },
    
    // Environment info
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_REGION: process.env.VERCEL_REGION,
    }
  };

  return res.status(200).json(envCheck);
}

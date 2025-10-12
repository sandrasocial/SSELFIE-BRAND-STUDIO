/**
 * Vercel Serverless Function - Catch-all API Router
 * 
 * This is the entry point for all API requests in the Vercel serverless environment.
 * It imports and executes the main Express-based handler from /server/[...route].ts
 */

import handler from '../server/[...route].js';

export default handler;

// Vercel serverless function configuration
export const config = {
  runtime: 'nodejs20.x',
  maxDuration: 40,
};

/**
 * Vercel Serverless Function - /api/user-model
 * Proxies to main handler
 */

import handler from '../server/[...route].js';

export default handler;

export const config = {
  runtime: 'nodejs',
  maxDuration: 40,
};

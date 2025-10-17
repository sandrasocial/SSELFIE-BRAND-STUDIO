/**
 * Vercel Serverless Function - /api/me
 * Proxies to main handler
 */

import handler from '../server/[...route].js';

export default handler;

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
  memory: 3008
};

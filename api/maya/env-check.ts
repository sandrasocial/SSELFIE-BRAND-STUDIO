/**
 * Vercel Serverless Function - /api/maya/env-check
 * Proxies to server implementation
 */

import handler from '../../server/api/maya/env-check.js';

export default handler;

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
};

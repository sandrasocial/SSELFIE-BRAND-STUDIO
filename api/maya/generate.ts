/**
 * Vercel Serverless Function - /api/maya/generate
 * Proxies to server implementation
 */

import handler from '../../server/api/maya/generate.js';

export default handler;

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

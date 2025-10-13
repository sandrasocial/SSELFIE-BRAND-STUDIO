/**
 * Vercel Serverless Function - /api/maya/status
 * Proxies to server implementation
 */

import handler from '../../server/api/maya/status.js';

export default handler;

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
};

/**
 * Vercel Serverless Function - /api/maya/models
 * Proxies to server implementation
 */

import handler from '../../server/api/maya/models.js';

export default handler;

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
};

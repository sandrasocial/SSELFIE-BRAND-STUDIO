/**
 * Vercel Serverless Function - /api/maya/heart-image
 * Proxies to server implementation
 */

import handler from '../../server/api/maya/heart-image.js';

export default handler;

export const config = {
  runtime: 'nodejs',
  maxDuration: 40,
};

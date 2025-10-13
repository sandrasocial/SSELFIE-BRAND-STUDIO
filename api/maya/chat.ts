/**
 * Vercel Serverless Function - /api/maya/chat
 * Proxies to server implementation
 */

import handler from '../../server/api/maya/chat.js';

export default handler;

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

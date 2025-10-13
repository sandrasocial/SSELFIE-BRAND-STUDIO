/**
 * Vercel Serverless Function - /api/maya/chat-history
 * Proxies to server implementation
 */

import handler from '../../server/api/maya/chat-history.js';

export default handler;

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
};

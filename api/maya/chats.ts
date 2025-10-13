/**
 * Vercel Serverless Function - /api/maya/chats
 * Proxies to server implementation
 */

import handler from '../../server/api/maya/chats.js';

export default handler;

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
};

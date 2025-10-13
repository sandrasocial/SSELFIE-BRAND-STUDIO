/**/**

 * Vercel Serverless Function - /api/maya/models * GET /api/maya/models - Pure Serverless

 * Proxies to server implementation */

 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

import handler from '../../server/api/maya/models.js';import { getUserFromRequest } from '../../_utils/auth-helpers.js';

import { sendMethodNotAllowed, sendUnauthorized, setNoCacheHeaders } from '../../_utils/response-helpers.js';

export default handler;

export const config = { runtime: 'nodejs', maxDuration: 10 };

export const config = {

  runtime: 'nodejs',export default async function handler(req: VercelRequest, res: VercelResponse) {

  maxDuration: 30,  if (req.method !== 'GET') {

};    return sendMethodNotAllowed(res, ['GET']);

  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return sendUnauthorized(res);

    setNoCacheHeaders(res);
    return res.status(200).json({
      models: ['flux-dev', 'flux-schnell'],
      default: 'flux-dev'
    });

  } catch (error) {
    console.error('[ERROR] /api/maya/models:', error);
    return res.status(500).json({ error: 'Failed to fetch models' });
  }
}

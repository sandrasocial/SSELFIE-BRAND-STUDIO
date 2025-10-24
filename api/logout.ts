/**
 * Vercel Serverless Function - /api/logout
 * Pattern 1: Direct handler call (no auth required)
 *
 * POST /api/logout
 * Clears authentication cookies and logs out the user
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../server/api/auth/logout.js';

export default async function logoutEndpoint(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 40,
};

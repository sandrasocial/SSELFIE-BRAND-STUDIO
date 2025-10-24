/**
 * Vercel Serverless Function - /api/me
 * Pattern 1: Entry point with withAuth middleware wrapper
 *
 * Returns the current authenticated user's profile
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../server/api/auth/me.js';

export default async function meHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
  memory: 3008
};

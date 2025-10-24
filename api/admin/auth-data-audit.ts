/**
 * Vercel Serverless Function - /api/admin/auth-data-audit
 * Admin auth data audit endpoint - delegates to server implementation
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../server/api/admin/auth-data-audit.js';

export default async function authDataAuditHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
  memory: 3008
};

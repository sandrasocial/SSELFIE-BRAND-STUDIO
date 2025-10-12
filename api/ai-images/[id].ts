/**
 * Vercel Serverless Function - /api/ai-images/[id]
 * Delete an AI-generated image
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import deleteHandler from '../../server/api/gallery/delete.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return deleteHandler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 25,
};

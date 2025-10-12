/**
 * Vercel Serverless Function - /api/images/favorites
 * Get user's favorite images
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import favoritesHandler from '../../server/api/gallery/favorites.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return favoritesHandler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 25,
};

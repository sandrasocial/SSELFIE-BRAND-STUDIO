/**
 * Vercel Serverless Function - /api/images/[id]/favorite
 * Toggle favorite status for an image
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import favoriteToggleHandler from '../../../server/api/gallery/favorite-toggle.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return favoriteToggleHandler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 25,
};

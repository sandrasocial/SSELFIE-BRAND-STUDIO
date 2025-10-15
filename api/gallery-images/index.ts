/**
 * Vercel Serverless Function - /api/gallery-images
 * Get user's gallery images
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import imagesHandler from '../../server/api/gallery/images.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return imagesHandler(req, res);
}

export const config = {
  runtime: 'nodejs',
  maxDuration: 30,
};
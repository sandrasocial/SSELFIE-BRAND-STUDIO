import type { VercelRequest, VercelResponse } from '@vercel/node';
export const config = { 
  runtime: 'nodejs',
  maxDuration: 25
} as const;

// ✅ MIGRATION FIX: Route directly to serverless endpoint (not deleted Express router)
import galleryImagesHandler from './api/gallery/images.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return galleryImagesHandler(req, res);
}



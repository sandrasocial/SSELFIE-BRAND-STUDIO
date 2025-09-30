import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { 
  runtime: 'nodejs',
  maxDuration: 25
} as const;

// Import the main sandra-images handler
import handler from '../sandra-images.js';

// This handles all /api/sandra-images/* routes as a catch-all
export default handler;
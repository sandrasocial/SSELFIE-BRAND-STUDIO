import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🧪 Test endpoint called:', req.url, req.method);
  
  return res.status(200).json({
    message: 'Test endpoint working!',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
}

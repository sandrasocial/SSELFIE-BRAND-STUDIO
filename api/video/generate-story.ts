import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Graceful fallback for unimplemented feature
  return res.status(200).json({ 
    message: 'Story generation feature is coming soon. Please try storyboard creation instead.',
    story: null,
    fallback: true,
    suggestion: 'Try using the storyboard feature for now'
  });
}

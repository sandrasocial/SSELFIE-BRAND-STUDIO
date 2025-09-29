import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { runtime: 'nodejs' } as const;
import { EmailService } from '../server/email-service.js';
import { withAuth } from './_middleware/auth.js';
import type { AuthenticatedRequest } from './_shared/auth-types.js';

// Send training start email
export async function POST(req: VercelRequest, res: VercelResponse) {
  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    const { email, firstName } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    try {
      const result = await EmailService.sendTrainingStartedEmail(email, firstName);
      
      if (result.success) {
        return res.status(200).json({ success: true, emailId: result.emailId });
      } else {
        return res.status(500).json({ error: 'Failed to send training email' });
      }
    } catch (error) {
      console.error('Failed to send training email:', error);
      return res.status(500).json({ 
        error: 'Failed to send training email',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
}
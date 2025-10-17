import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed, sendSuccess } from '../_utils/response-helpers';
import { emailManagementAgent } from '../../server/services/email-management-agent';

export const config = { runtime: 'nodejs', maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'User ID not found', 401);
      }

      const insights = await emailManagementAgent.processUnreadEmails(userId);

      return sendSuccess(res, {
        message: 'Email processing completed',
        insights: (insights as any).processed || 0,
        data: insights
      });
    } catch (error) {
      console.error('❌ Email processing error:', error);
      return sendError(res, 'Failed to process emails', 500);
    }
  });
}


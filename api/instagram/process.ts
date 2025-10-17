import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed, sendSuccess } from '../_utils/response-helpers';
import { instagramIntegration } from '../../server/services/instagram-integration';

export const config = { runtime: 'nodejs', maxDuration: 60 };

interface InstagramMessage {
  id: string;
  category: string;
  priority: string;
  isBusinessOpportunity: boolean;
  needsResponse: boolean;
}

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

      const processedMessages: InstagramMessage[] = await instagramIntegration.processInstagramMessages(userId);

      return sendSuccess(res, {
        message: 'Instagram message processing completed',
        totalMessages: processedMessages.length,
        customerInquiries: processedMessages.filter((m: InstagramMessage) => m.category === 'customer_inquiry').length,
        businessOpportunities: processedMessages.filter((m: InstagramMessage) => m.isBusinessOpportunity).length,
        urgentMessages: processedMessages.filter((m: InstagramMessage) => m.priority === 'high').length,
        needResponse: processedMessages.filter((m: InstagramMessage) => m.needsResponse).length,
        data: processedMessages.slice(0, 10)
      });
    } catch (error) {
      console.error('❌ Instagram processing error:', error);
      return sendError(res, 'Failed to process Instagram messages', 500);
    }
  });
}


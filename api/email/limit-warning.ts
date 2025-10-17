/**
 * POST /api/email/limit-warning - Send generation limit warning email
 * Triggered when user approaches generation limit
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed } from '../_utils/response-helpers';
import { getRequestBody } from '../_utils/request-helpers';
import { sendLimitWarningEmail } from '../../server/services/email-service';

export const config = { runtime: 'nodejs', maxDuration: 30 };

interface LimitWarningEmailRequest {
  userEmail: string;
  userName: string;
  percentage: number;
  planType: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const body = await getRequestBody(req) as LimitWarningEmailRequest;
      const { userEmail, userName, percentage, planType } = body;

      if (!userEmail || !userName || !percentage || !planType) {
        return sendError(res, 'Missing required parameters', 400);
      }

      const success = await sendLimitWarningEmail(userEmail, userName, percentage, planType);

      return res.status(200).json({
        success,
        message: success ? 'Limit warning email sent' : 'Failed to send limit warning'
      });
    } catch (error: unknown) {
      console.error('[ERROR] /api/email/limit-warning:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return sendError(res, `Failed to send limit warning: ${errorMessage}`, 500);
    }
  });
}


/**
 * POST /api/email/training-complete - Send training completion email
 * Triggered when model training completes
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed } from '../_utils/response-helpers';
import { getRequestBody } from '../_utils/request-helpers';
import { sendTrainingCompleteEmail } from '../../server/services/email-service';

export const config = { runtime: 'nodejs', maxDuration: 30 };

interface TrainingCompleteEmailRequest {
  userEmail: string;
  userName: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const body = await getRequestBody(req) as TrainingCompleteEmailRequest;
      const { userEmail, userName } = body;

      if (!userEmail || !userName) {
        return sendError(res, 'User email and name required', 400);
      }

      const success = await sendTrainingCompleteEmail(userEmail, userName);

      return res.status(200).json({
        success,
        message: success ? 'Training completion email sent' : 'Failed to send training email'
      });
    } catch (error: unknown) {
      console.error('[ERROR] /api/email/training-complete:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return sendError(res, `Failed to send training email: ${errorMessage}`, 500);
    }
  });
}


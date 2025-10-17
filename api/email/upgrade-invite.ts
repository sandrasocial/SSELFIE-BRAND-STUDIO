/**
 * POST /api/email/upgrade-invite - Send upgrade invitation email
 * Triggered to invite users to upgrade their plan
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed } from '../_utils/response-helpers';
import { getRequestBody } from '../_utils/request-helpers';
import { sendUpgradeInviteEmail } from '../../server/services/email-service';

export const config = { runtime: 'nodejs', maxDuration: 30 };

interface UpgradeInviteEmailRequest {
  userEmail: string;
  userName: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  return withAuth(req, res, async (req: AuthenticatedRequest, res: VercelResponse) => {
    try {
      const body = await getRequestBody(req) as UpgradeInviteEmailRequest;
      const { userEmail, userName } = body;

      if (!userEmail || !userName) {
        return sendError(res, 'User email and name required', 400);
      }

      const success = await sendUpgradeInviteEmail(userEmail, userName);

      return res.status(200).json({
        success,
        message: success ? 'Upgrade invitation email sent' : 'Failed to send upgrade invitation'
      });
    } catch (error: unknown) {
      console.error('[ERROR] /api/email/upgrade-invite:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return sendError(res, `Failed to send upgrade invitation: ${errorMessage}`, 500);
    }
  });
}


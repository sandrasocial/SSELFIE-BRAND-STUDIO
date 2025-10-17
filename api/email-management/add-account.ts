import type { VercelRequest, VercelResponse } from '@vercel/node';
import { withAuth } from '../_middleware/auth';
import type { AuthenticatedRequest } from '../_shared/auth-types';
import { sendError, sendMethodNotAllowed, sendSuccess } from '../_utils/response-helpers';
import { getRequestBody } from '../_utils/request-helpers';
import { emailManagementAgent } from '../../server/services/email-management-agent';

export const config = { runtime: 'nodejs', maxDuration: 30 };

interface AddEmailAccountRequest {
  type: 'personal' | 'business';
  email: string;
  provider: string;
  accessToken?: string;
  refreshToken?: string;
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

      const body = await getRequestBody(req) as AddEmailAccountRequest;
      const { type, email, provider, accessToken, refreshToken } = body;

      if (!type || !email || !provider) {
        return sendError(res, 'Missing required fields: type, email, provider', 400);
      }

      if (!['personal', 'business'].includes(type)) {
        return sendError(res, 'Account type must be personal or business', 400);
      }

      const accountId = `${userId}_${type}_${Date.now()}`;
      const success = await emailManagementAgent.addEmailAccount(userId, {
        id: accountId,
        type,
        email,
        provider,
        accessToken,
        refreshToken
      });

      if (!success) {
        return sendError(res, 'Failed to add email account', 500);
      }

      return sendSuccess(res, {
        message: 'Email account added successfully',
        accountId,
        email,
        type
      }, 201);
    } catch (error) {
      console.error('❌ Add email account error:', error);
      return sendError(res, 'Failed to add email account', 500);
    }
  });
}


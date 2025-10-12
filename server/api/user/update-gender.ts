/**
 * POST /api/user/update-gender - Pure Serverless Implementation
 * 
 * Update the gender field for the authenticated user.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUserFromRequest } from '../../_utils/auth-helpers.js';
import { 
  sendSuccess, 
  sendUnauthorized,
  sendBadRequest,
  sendMethodNotAllowed,
  sendError
} from '../../_utils/response-helpers.js';
import { getRequestBody, validateRequiredFields } from '../../_utils/request-helpers.js';
import { userService } from '../../services/user-service.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 25,
};

interface UpdateGenderRequest {
  gender: 'man' | 'woman' | 'other';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  try {
    // Auth
    const user = await getUserFromRequest(req);
    if (!user) {
      return sendUnauthorized(res);
    }

    // Parse body
    const body = getRequestBody<UpdateGenderRequest>(req);
    
    // Validate required fields
    const validation = validateRequiredFields(body, ['gender']);
    if (!validation.valid) {
      return sendBadRequest(res, 'Missing required fields', { missing: (validation as any).missing });
    }

    const { gender } = body;

    // Validate gender value
    if (!['man', 'woman', 'other'].includes(gender)) {
      return sendBadRequest(res, 'Invalid gender value. Must be "man", "woman", or "other"');
    }

    // Update user profile
    await userService.updateUserProfile(user.id, { gender });

    return sendSuccess(res, {
      success: true,
      message: 'Gender updated successfully'
    });
    
  } catch (error) {
    console.error('[ERROR] /api/user/update-gender:', error);
    return sendError(
      res,
      'Failed to update gender',
      500,
      process.env.NODE_ENV === 'development' ? {
        message: error instanceof Error ? error.message : 'Unknown error'
      } : undefined
    );
  }
}

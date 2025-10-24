/**
 * POST /api/user/update-gender - Pure Serverless Implementation
 *
 * Update the gender field for the authenticated user.
 *
 * ✅ PATTERN 1: Accepts middleware-attached user from withAuth wrapper
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
  gender: string; // canonicalized server-side to 'woman' | 'man' | 'non-binary' | null
}

// Canonicalize incoming gender values to enforce server-side consistency
function clampGender(input: string | null | undefined): 'woman' | 'man' | 'non-binary' | null {
  if (!input) return null;
  const g = String(input).toLowerCase().trim();
  if (['woman','female','f'].includes(g)) return 'woman';
  if (['man','male','m'].includes(g)) return 'man';
  if (['non-binary','nonbinary','non binary','nb','enby'].includes(g)) return 'non-binary';
  // Treat "other" and "prefer-not-to-say" (and variants) as intentionally unspecified
  if (['other','prefer-not-to-say','prefer not to say','prefer_not_to_say','na','n/a','none','unknown'].includes(g)) return null;
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  try {
    // ✅ PATTERN 1: User already attached by withAuth middleware
    // Fallback to getUserFromRequest for legacy compatibility
    let user = (req as any).user;

    if (!user) {
      console.log('⚠️ No user attached to request, attempting getUserFromRequest fallback');
      user = await getUserFromRequest(req);
    }

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

    // Canonicalize to server-approved tokens
    const canonical = clampGender(gender);

    // If input provided but not recognized and not explicitly opting out, reject
    if (gender && canonical === null && !['other','prefer-not-to-say','prefer not to say','prefer_not_to_say','na','n/a','none','unknown'].includes(String(gender).toLowerCase())) {
      return sendBadRequest(res, 'Invalid gender value. Allowed: "man", "woman", "non-binary", or "prefer-not-to-say"');
    }

    // Update user profile (null means intentionally unspecified)
    await userService.updateUserProfile(user.id, { gender: canonical });

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

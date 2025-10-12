/**
 * PUT /api/profile - Pure Serverless Implementation
 * 
 * Update profile information for the authenticated user.
 * Accepts: displayName, firstName, lastName, profileImageUrl, gender
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
import { getRequestBody } from '../../_utils/request-helpers.js';
import { userService } from '../../services/user-service.js';

export const config = {
  runtime: 'nodejs',
  maxDuration: 25,
};

interface UpdateProfileRequest {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  gender?: 'man' | 'woman' | 'other';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return sendMethodNotAllowed(res, ['PUT']);
  }

  try {
    // Auth
    const user = await getUserFromRequest(req);
    if (!user) {
      return sendUnauthorized(res);
    }

    // Parse body
    const body = getRequestBody<UpdateProfileRequest>(req);
    const { displayName, firstName, lastName, profileImageUrl, gender } = body;

    // Build updates object
    const updates: any = {};
    if (displayName) updates.displayName = displayName;
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (profileImageUrl) updates.profileImageUrl = profileImageUrl;
    
    if (gender) {
      // Validate gender value
      if (!['man', 'woman', 'other'].includes(gender)) {
        return sendBadRequest(res, 'Invalid gender value. Must be "man", "woman", or "other"');
      }
      updates.gender = gender;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return sendBadRequest(res, 'No valid fields to update');
    }

    // Update user profile
    await userService.updateUserProfile(user.id, updates);

    // Get updated profile
    const updatedUser = await userService.getUser(user.id);

    return sendSuccess(res, {
      user: {
        id: updatedUser?.id,
        email: updatedUser?.email,
        displayName: updatedUser?.displayName,
        firstName: updatedUser?.firstName,
        lastName: updatedUser?.lastName,
        profileImageUrl: updatedUser?.profileImageUrl,
        gender: (updatedUser as any)?.gender,
      },
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('[ERROR] PUT /api/profile:', error);
    return sendError(
      res,
      'Failed to update profile',
      500,
      process.env.NODE_ENV === 'development' ? {
        message: error instanceof Error ? error.message : 'Unknown error'
      } : undefined
    );
  }
}

/**
 * POST /api/auth/auto-register - Pure Serverless Implementation
 * 
 * Auto-register a new user with email (and optional name).
 * Returns existing user if already registered.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { 
  sendSuccess, 
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

interface AutoRegisterRequest {
  email: string;
  name?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST']);
  }

  try {
    // Parse body
    const body = getRequestBody<AutoRegisterRequest>(req);
    
    // Validate required fields
    const validation = validateRequiredFields(body, ['email']);
    if (!validation.valid) {
      return sendBadRequest(res, 'Missing required fields', { missing: (validation as any).missing });
    }

    const { email, name } = body;

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);

    if (existingUser) {
      return sendSuccess(res, {
        userId: existingUser.id,
        message: 'User already exists'
      });
    }

    // Create new user
    const newUser = await userService.createUser(email, {
      displayName: name || email.split('@')[0],
    });

    if (!newUser) {
      return sendError(res, 'Failed to create user', 500);
    }

    return sendSuccess(res, {
      userId: newUser.id,
      message: 'User created successfully'
    }, 201);
    
  } catch (error) {
    console.error('[ERROR] /api/auth/auto-register:', error);
    return sendError(
      res,
      'Failed to register user',
      500,
      process.env.NODE_ENV === 'development' ? {
        message: error instanceof Error ? error.message : 'Unknown error'
      } : undefined
    );
  }
}

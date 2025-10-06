/**
 * Authentication Routes
 * Handles user authentication and profile management
 */

import { Router, Response } from 'express';
import { requireStackAuth } from '../../stack-auth.js';
import { storage } from '../../storage.js';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler.js';
import { userService } from '../../services/user-service.js';
import { AuthenticatedRequest } from '../../types/ai-generation.js';
import { SuccessResponse } from '../../types/ai-generation.js';

// User types
interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  gender?: 'man' | 'woman' | 'other';
  plan?: string;
  role?: string;
  monthlyGenerationLimit?: number;
  createdAt: Date;
}

const router = Router();
// Me endpoint: JSON only, no cache, ensures user exists
router.get('/api/me', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const userId = req.user.id;
  let user = await userService.getUser(userId) as UserProfile;
  
  if (!user && req.user) {
    user = await userService.createUser(req.user.email || req.user.id, {
      id: req.user.id,
      email: req.user.email,
      displayName: req.user.displayName,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      profileImageUrl: req.user.profileImageUrl,
    }) as UserProfile;
  }
  
  if (!user) {
    throw createError.notFound('User not found');
  }
  
  const responseData: SuccessResponse<{ user: UserProfile }> = {
    data: { user }
  };
  
  sendSuccess(res, responseData);
}));

// Get current user
router.get('/api/auth/user', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const userId = req.user.id;
  let user = await userService.getUser(userId) as UserProfile;

  // If user doesn't exist in database but Stack Auth user exists, create them
  if (!user && req.user) {
    user = await userService.createUser(req.user.email || req.user.id, {
      id: req.user.id,
      email: req.user.email,
      displayName: req.user.displayName,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      profileImageUrl: req.user.profileImageUrl,
    }) as UserProfile;
  }

  if (!user) {
    throw createError.notFound('User not found');
  }
  
  const responseData: SuccessResponse<Omit<UserProfile, 'profileImageUrl' | 'gender'>> = {
    data: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      plan: user.plan,
      role: user.role,
      monthlyGenerationLimit: user.monthlyGenerationLimit,
      createdAt: user.createdAt,
    }
  };
  
  sendSuccess(res, responseData);
}));

interface AutoRegisterRequest {
  email: string;
  name?: string;
}

// Auto-register user
router.post('/api/auth/auto-register', asyncHandler(async (req: AuthenticatedRequest & { body: AutoRegisterRequest }, res: Response) => {
  const { email, name } = req.body;
  validateRequired({ email }, ['email']);

  const existingUser = await userService.getUserByEmail(email) as UserProfile;

  if (existingUser) {
    const responseData: SuccessResponse<{ userId: string }> = {
      data: { userId: existingUser.id },
      message: 'User already exists'
    };
    return sendSuccess(res, responseData);
  }

  const newUser = await userService.createUser(email, {
    displayName: name || email.split('@')[0],
  }) as UserProfile;

  const responseData: SuccessResponse<{ userId: string }> = {
    data: { userId: newUser.id },
    message: 'User created successfully'
  };

  sendSuccess(res, responseData, 'User created successfully', 201);
}));

interface UpdateGenderRequest {
  gender: 'man' | 'woman' | 'other';
}

// Update user gender
router.post('/api/user/update-gender', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: UpdateGenderRequest }, res: Response) => {
  const userId = req.user.id;
  const { gender } = req.body;
  validateRequired({ gender }, ['gender']);

  if (!['man', 'woman', 'other'].includes(gender)) {
    throw createError.validation('Invalid gender value. Must be "man", "woman", or "other"');
  }

  await userService.updateUserProfile(userId, { gender });
  
  const responseData: SuccessResponse<{ success: true }> = {
    data: { success: true },
    message: 'Gender updated successfully'
  };
  
  sendSuccess(res, responseData);
}));

interface PublicProfile {
  id: string;
  email: string;
  name?: string;
  gender?: string;
  createdAt: Date;
}

// Get user profile
router.get('/api/profile', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user.id;
  const user = await userService.getUser(userId) as UserProfile;

  if (!user) {
    throw createError.notFound('User not found');
  }

  const responseData: SuccessResponse<PublicProfile> = {
    data: {
      id: user.id,
      email: user.email,
      name: user.displayName,
      gender: user.gender,
      createdAt: user.createdAt,
    }
  };

  sendSuccess(res, responseData);
}));

interface UpdateProfileRequest {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  gender?: 'man' | 'woman' | 'other';
}

// Update user profile
router.put('/api/profile', requireStackAuth, asyncHandler(async (req: AuthenticatedRequest & { body: UpdateProfileRequest }, res: Response) => {
  const userId = req.user.id;
  const { displayName, firstName, lastName, profileImageUrl, gender } = req.body;

  const updates: Partial<UserProfile> = {};
  if (displayName) updates.displayName = displayName;
  if (firstName) updates.firstName = firstName;
  if (lastName) updates.lastName = lastName;
  if (profileImageUrl) updates.profileImageUrl = profileImageUrl;
  if (gender) {
    if (!['man', 'woman', 'other'].includes(gender)) {
      throw createError.validation('Invalid gender value. Must be "man", "woman", or "other"');
    }
    updates.gender = gender;
  }

  if (Object.keys(updates).length === 0) {
    throw createError.validation('No valid fields to update');
  }

  await userService.updateUserProfile(userId, updates);
  
  const responseData: SuccessResponse<{ success: true }> = {
    data: { success: true },
    message: 'Profile updated successfully'
  };
  
  sendSuccess(res, responseData);
}));

export default router;
/**
 * Authentication Routes
 * Handles user authentication and profile management
 */

import { Router } from 'express';
import { requireStackAuth } from '../middleware/auth';
import { storage } from '../../storage';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler';
import { userService } from '../../services/user-service';

const router = Router();

// Get current user
router.get('/api/auth/user', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const user = await userService.getUserById(userId);

  if (!user) {
    throw createError.notFound('User not found');
  }
  sendSuccess(res, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  });
}));

// Auto-register user
router.post('/api/auth/auto-register', asyncHandler(async (req: any, res) => {
  const { email, name } = req.body;
  validateRequired({ email });

  let existingUser = await userService.getUserByEmail(email);

  if (existingUser) {
    return sendSuccess(res, {
      message: 'User already exists',
      userId: existingUser.id
    });
  }

  const newUser = await userService.createUser({
    email,
    displayName: name || email.split('@')[0],
  });

  sendSuccess(res, {
    message: 'User created successfully',
    userId: newUser.id
  }, 201);
}));

// Update user gender
router.post('/api/user/update-gender', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { gender } = req.body;
  validateRequired({ gender });

  if (!['man', 'woman', 'other'].includes(gender)) {
    throw createError.validation('Invalid gender value. Must be "man", "woman", or "other"');
  }

  await userService.updateUserProfile(userId, { gender });
  sendSuccess(res, { message: 'Gender updated successfully' });
}));

// Get user profile
router.get('/api/profile', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const user = await userService.getUserById(userId);

  if (!user) {
    throw createError.notFound('User not found');
  }
  sendSuccess(res, {
    id: user.id,
    email: user.email,
    name: user.displayName,
    gender: user.gender,
    createdAt: user.createdAt,
  });
}));

// Update user profile
router.put('/api/profile', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { displayName, firstName, lastName, profileImageUrl, gender } = req.body;

  const updates: Partial<any> = {};
  if (displayName) updates.displayName = displayName;
  if (firstName) updates.firstName = firstName;
  if (lastName) updates.lastName = lastName;
  if (profileImageUrl) updates.profileImageUrl = profileImageUrl;
  if (gender) updates.gender = gender;

  if (Object.keys(updates).length === 0) {
    throw createError.validation('No valid fields to update');
  }

  await userService.updateUserProfile(userId, updates);
  sendSuccess(res, { message: 'Profile updated successfully' });
}));

export default router;
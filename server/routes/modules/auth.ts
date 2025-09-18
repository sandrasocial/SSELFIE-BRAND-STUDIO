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
// Me endpoint: JSON only, no cache, ensures user exists
router.get('/api/me', requireStackAuth, asyncHandler(async (req: any, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const userId = req.user.id;
  let user = await userService.getUser(userId);
  if (!user && req.user) {
    user = await userService.createUser(req.user.email || req.user.id, {
      id: req.user.id,
      email: req.user.email,
      displayName: req.user.displayName,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      profileImageUrl: req.user.profileImageUrl,
    });
  }
  if (!user) {
    throw createError.notFound('User not found');
  }
  sendSuccess(res, { user });
}));

// Get current user
router.get('/api/auth/user', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  let user = await userService.getUser(userId);

  // If user doesn't exist in database but Stack Auth user exists, create them
  if (!user && req.user) {
    console.log('🔄 Auto-creating user from Stack Auth data:', req.user.email);
    user = await userService.createUser(req.user.email || req.user.id, {
      id: req.user.id,
      email: req.user.email,
      displayName: req.user.displayName,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      profileImageUrl: req.user.profileImageUrl,
    });
    console.log('✅ User auto-created successfully:', user.id);
  }

  if (!user) {
    throw createError.notFound('User not found');
  }
  
  sendSuccess(res, {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    firstName: user.firstName,
    lastName: user.lastName,
    plan: user.plan,
    role: user.role,
    monthlyGenerationLimit: user.monthlyGenerationLimit,
    createdAt: user.createdAt,
  });
}));

// Auto-register user
router.post('/api/auth/auto-register', asyncHandler(async (req: any, res) => {
  const { email, name } = req.body;
  validateRequired({ email }, ['email']);

  let existingUser = await userService.getUserByEmail(email);

  if (existingUser) {
    return sendSuccess(res, {
      message: 'User already exists',
      userId: existingUser.id
    });
  }

  const newUser = await userService.createUser(email, {
    displayName: name || email.split('@')[0],
  });

  sendSuccess(res, {
    message: 'User created successfully',
    userId: newUser.id
  }, 'User created successfully', 201);
}));

// Update user gender
router.post('/api/user/update-gender', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const { gender } = req.body;
  validateRequired({ gender }, ['gender']);

  if (!['man', 'woman', 'other'].includes(gender)) {
    throw createError.validation('Invalid gender value. Must be "man", "woman", or "other"');
  }

  await userService.updateUserProfile(userId, { gender });
  sendSuccess(res, { message: 'Gender updated successfully' });
}));

// Get user profile
router.get('/api/profile', requireStackAuth, asyncHandler(async (req: any, res) => {
  const userId = req.user.id;
  const user = await userService.getUser(userId);

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
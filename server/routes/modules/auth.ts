/**
 * Authentication Routes Module
 * User authentication and profile management
 */

import { Router } from 'express';
import { requireStackAuth } from '../middleware/auth';
import { storage } from '../../storage';
import { asyncHandler, createError, sendSuccess, validateRequired } from '../middleware/error-handler';
import { userService } from '../../services/user-service';

const router = Router();

// Get current user
router.get('
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw createError.notFound("User not found");
    }
    
    res.json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      // Add other user fields as needed
    });
  ', requireStackAuth, asyncHandler(async (req, res) => {
console.error('Error fetching user:', error);
}));

// Auto-register user
router.post('
    const { email, name } = req.body;
    
    if (!email) {
      throw createError.validation("Email is required");
    }
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.json({ 
        message: 'User already exists',
        userId: existingUser.id 
      });
    }
    
    // Create new user
    const newUser = await storage.createUser({
      id: crypto.randomUUID(),
      email,
      displayName: name || email.split('@')[0],
      // Add other required fields
    });
    
    res.status(201).json({
      message: 'User created successfully',
      userId: newUser.id
    });
  ', asyncHandler(async (req, res) => {
console.error('Error auto-registering user:', error);
}));

// Test authentication
router.get('/api/test-auth', requireStackAuth, async (req: any, res) => {
  res.json({
    message: 'Authentication successful',
    userId: req.user.id,
    email: req.user.email
  });
});

// Update user gender
router.post('
    const { gender } = req.body;
    const userId = req.user.id;
    
    if (!gender) {
      throw createError.validation("Gender is required");
    }
    
    // Update user gender
    await storage.updateUserProfile(userId, { gender });
    
    res.json({ message: 'Gender updated successfully' });
  ', requireStackAuth, asyncHandler(async (req, res) => {
console.error('Error updating gender:', error);
}));

// Get user profile
router.get('
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw createError.notFound("User not found");
    }
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.displayName,
      gender: user.gender,
      createdAt: user.createdAt,
      // Add other profile fields
    });
  ', requireStackAuth, asyncHandler(async (req, res) => {
console.error('Error fetching profile:', error);
}));

// Update user profile
router.put('
    const userId = req.user.id;
    const updates = req.body;
    
    // Validate updates
    const allowedFields = ['name', 'gender', 'email'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);
    
    if (Object.keys(filteredUpdates).length === 0) {
      throw createError.validation("No valid fields to update");
    }
    
    // Update user
    await storage.updateUserProfile(userId, filteredUpdates);
    
    res.json({ message: 'Profile updated successfully' });
  ', requireStackAuth, asyncHandler(async (req, res) => {
console.error('Error updating profile:', error);
}));

export default router;

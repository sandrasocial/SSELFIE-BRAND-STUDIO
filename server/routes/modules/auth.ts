/**
 * Authentication Routes Module
 * User authentication and profile management
 */

import { Router } from 'express';
import { requireStackAuth } from '../middleware/auth';
import { storage } from '../../storage';

const router = Router();

// Get current user
router.get('/api/auth/user', requireStackAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      // Add other user fields as needed
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auto-register user
router.post('/api/auth/auto-register', async (req: any, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
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
  } catch (error) {
    console.error('Error auto-registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test authentication
router.get('/api/test-auth', requireStackAuth, async (req: any, res) => {
  res.json({
    message: 'Authentication successful',
    userId: req.user.id,
    email: req.user.email
  });
});

// Update user gender
router.post('/api/user/update-gender', requireStackAuth, async (req: any, res) => {
  try {
    const { gender } = req.body;
    const userId = req.user.id;
    
    if (!gender) {
      return res.status(400).json({ error: 'Gender is required' });
    }
    
    // Update user gender
    await storage.updateUserProfile(userId, { gender });
    
    res.json({ message: 'Gender updated successfully' });
  } catch (error) {
    console.error('Error updating gender:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/api/profile', requireStackAuth, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.displayName,
      gender: user.gender,
      createdAt: user.createdAt,
      // Add other profile fields
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.put('/api/profile', requireStackAuth, async (req: any, res) => {
  try {
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
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    // Update user
    await storage.updateUserProfile(userId, filteredUpdates);
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

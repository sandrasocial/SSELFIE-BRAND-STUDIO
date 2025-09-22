/**
 * USER INTERVENTION ADMIN ROUTES
 * Manage inactive user campaigns and monitoring
 */

import express from 'express';
import { UserInterventionService } from '../../services/user-intervention-service.js';

const router = express.Router();

// Get inactive users who need intervention
router.get('/inactive-users', async (req, res) => {
  try {
    const inactiveUsers = await UserInterventionService.getInactiveUsers();
    res.json({
      success: true,
      users: inactiveUsers,
      count: inactiveUsers.length
    });
  } catch (error) {
    console.error('❌ Failed to get inactive users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve inactive users'
    });
  }
});

// Get intervention statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await UserInterventionService.getInterventionStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Failed to get intervention stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics'
    });
  }
});

// Preview email content for specific user
router.get('/email-preview/:userId', async (req, res) => {
  try {
    const inactiveUsers = await UserInterventionService.getInactiveUsers();
    const user = inactiveUsers.find(u => u.id === req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found or not inactive'
      });
    }
    
    const emailContent = UserInterventionService.generatePersonalizedEmail(user);
    res.json({
      success: true,
      user,
      email: emailContent
    });
  } catch (error) {
    console.error('❌ Failed to generate email preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate email preview'
    });
  }
});

export default router;
import { Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Admin endpoint to impersonate/manage user accounts
router.post('/api/admin/impersonate-user', async (req: any, res) => {
  try {
    // Check admin authentication
    const adminToken = req.headers['x-admin-token'];
    const isAdminAuth = adminToken === 'sandra-admin-2025';
    
    const sessionUser = req.user;
    const isSessionAdmin = req.isAuthenticated && sessionUser?.claims?.email === 'ssa@ssasocial.com';
    
    if (!isAdminAuth && !isSessionAdmin) {
      return res.status(401).json({ message: "Admin access required" });
    }

    const { userId, email } = req.body;
    
    let targetUser;
    if (userId) {
      targetUser = await storage.getUser(userId);
    } else if (email) {
      targetUser = await storage.getUserByEmail(email);
    }
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create full user impersonation session - replaces main user session
    req.session.impersonatedUser = targetUser;
    
    // Override user claims for complete impersonation
    if (req.user) {
      req.user.claims = {
        sub: targetUser.id,
        email: targetUser.email,
        first_name: targetUser.firstName,
        last_name: targetUser.lastName,
        profile_image_url: targetUser.profileImageUrl
      };
    }

    res.json({
      success: true,
      message: `Now impersonating ${targetUser.email}`,
      user: targetUser
    });

  } catch (error) {
    console.error('Admin impersonation error:', error);
    res.status(500).json({ error: 'Failed to impersonate user' });
  }
});

// Admin endpoint to stop impersonation
router.post('/api/admin/stop-impersonation', async (req: any, res) => {
  try {
    // Check admin authentication
    const adminToken = req.headers['x-admin-token'];
    const isAdminAuth = adminToken === 'sandra-admin-2025';
    
    const sessionUser = req.user;
    const isSessionAdmin = req.isAuthenticated && sessionUser?.claims?.email === 'ssa@ssasocial.com';
    
    if (!isAdminAuth && !isSessionAdmin) {
      return res.status(401).json({ message: "Admin access required" });
    }

    delete req.session.impersonatedUser;
    
    // Restore original admin user session
    if (req.user) {
      req.user.claims = {
        sub: '42585527',
        email: 'ssa@ssasocial.com',
        first_name: 'Sandra',
        last_name: 'Sigurjonsdottir',
        profile_image_url: null
      };
    }
    
    res.json({
      success: true,
      message: 'Stopped impersonation, back to admin account'
    });

  } catch (error) {
    console.error('Stop impersonation error:', error);
    res.status(500).json({ error: 'Failed to stop impersonation' });
  }
});

// Admin endpoint to get all white-label clients
router.get('/api/admin/white-label-clients', async (req: any, res) => {
  try {
    // Check admin authentication
    const adminToken = req.headers['x-admin-token'];
    const isAdminAuth = adminToken === 'sandra-admin-2025';
    
    const sessionUser = req.user;
    const isSessionAdmin = req.isAuthenticated && sessionUser?.claims?.email === 'ssa@ssasocial.com';
    
    if (!isAdminAuth && !isSessionAdmin) {
      return res.status(401).json({ message: "Admin access required" });
    }

    const allUsers = await storage.getAllUsers();
    
    // Filter for white-label clients (non-admin users with full profiles)
    const whitelabelClients = [];
    
    for (const user of allUsers) {
      if (user.email !== 'ssa@ssasocial.com' && user.plan) {
        const profile = await storage.getUserProfile(user.id);
        const onboarding = await storage.getOnboardingData(user.id);
        
        whitelabelClients.push({
          ...user,
          profile,
          onboarding,
          isWhitelabelClient: true
        });
      }
    }

    res.json({
      success: true,
      clients: whitelabelClients,
      totalClients: whitelabelClients.length
    });

  } catch (error) {
    console.error('Error fetching white-label clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

export default router;
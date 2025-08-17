import { Router } from 'express';
import { db } from '../db';
import { users, subscriptions, sessions, importedSubscribers, aiImages, userModels } from '../../shared/schema';
import { eq, count, sum, desc, sql, gte } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { requireAdmin, checkAdminAccess, getAdminUserData } from '../middleware/admin-middleware';

const router = Router();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Get total users
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get active subscriptions (count users with paid plans)
    const activeSubscriptionsResult = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.plan, 'full-access'));
    const activeSubscriptions = activeSubscriptionsResult[0]?.count || 0;

    // Get monthly revenue (mock calculation - adjust based on your revenue tracking)
    const monthlyRevenue = activeSubscriptions * 97; // Assuming $97 per subscription

    // Get total sessions (sessions table doesn't have status field)
    const totalSessionsResult = await db
      .select({ count: count() })
      .from(sessions);
    const totalSessions = totalSessionsResult[0]?.count || 0;

    res.json({
      totalUsers,
      activeSubscriptions,
      monthlyRevenue,
      totalSessions
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Get recent activity
router.get('/activity', async (req, res) => {
  try {
    // Get recent user registrations
    const recentUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);

    // Get recent sessions (sessions table only has sid, sess, expire)
    const recentSessions = await db
      .select({
        sid: sessions.sid,
        expire: sessions.expire
      })
      .from(sessions)
      .orderBy(desc(sessions.expire))
      .limit(10);

    // Combine and format activities
    const activities = [
      ...recentUsers.map((user: any) => ({
        id: `user-${user.id}`,
        type: 'user_registration',
        title: `New user registration: ${user.email || user.firstName || 'Unknown'}`,
        timestamp: formatTimestamp(user.createdAt),
        user: user.email || user.firstName || 'Unknown',
        avatar: '/gallery/default-avatar.jpg'
      })),
      ...recentSessions.map((session: any) => ({
        id: `session-${session.sid}`,
        type: 'session_activity',
        title: `Session activity`,
        timestamp: formatTimestamp(session.expire),
        avatar: '/gallery/session-icon.jpg'
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
     .slice(0, 15);

    res.json(activities);
  } catch (error) {
    console.error('Error fetching admin activity:', error);
    res.status(500).json({ error: 'Failed to fetch admin activity' });
  }
});

// Get user management data
router.get('/users', async (req, res) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        plan: users.plan,
        role: users.role,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Helper function to format timestamp
function formatTimestamp(date: Date | null): string {
  if (!date) return 'Unknown';
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  return `${days} days ago`;
}

// CONSOLIDATED: Business metrics endpoints (from admin-business-metrics.ts)
router.get('/business-metrics', requireAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching comprehensive business metrics...');

    // Calculate total revenue from subscriptions
    const revenueResult = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN plan = 'sselfie-studio' THEN 67 WHEN plan = 'basic' THEN 29 ELSE 0 END), 0)`
      })
      .from(users)
      .where(sql`plan IN ('sselfie-studio', 'basic')`);

    // Calculate monthly revenue (active subscriptions)
    const monthlyRevenueResult = await db
      .select({
        activeSubscriptions: count(),
        studioUsers: sql<number>`COUNT(CASE WHEN plan = 'sselfie-studio' THEN 1 END)`,
        basicUsers: sql<number>`COUNT(CASE WHEN plan = 'basic' THEN 1 END)`
      })
      .from(users)
      .where(sql`plan IN ('sselfie-studio', 'basic')`);

    // Get total subscribers from all sources
    const subscriberStats = await db
      .select({
        total: count(),
        flodesk: sql<number>`COUNT(CASE WHEN source = 'flodesk' THEN 1 END)`,
        manychat: sql<number>`COUNT(CASE WHEN source = 'manychat' THEN 1 END)`
      })
      .from(importedSubscribers);

    // Get total AI images generated
    const aiImageStats = await db
      .select({
        totalImages: count()
      })
      .from(aiImages);

    // Get trained models count
    const trainedModelsStats = await db
      .select({
        totalModels: count()
      })
      .from(userModels);

    // Calculate metrics
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const studioUsers = monthlyRevenueResult[0]?.studioUsers || 0;
    const basicUsers = monthlyRevenueResult[0]?.basicUsers || 0;
    const monthlyRevenue = (studioUsers * 67) + (basicUsers * 29);
    const totalSubscribers = subscriberStats[0]?.total || 0;
    const activeUsers = (await db.select({ count: count() }).from(users))[0]?.count || 0;
    const totalAIImages = aiImageStats[0]?.totalImages || 0;
    const trainedModels = trainedModelsStats[0]?.totalModels || 0;

    const businessMetrics = {
      totalRevenue: totalRevenue.toString(),
      monthlyRevenue,
      totalSubscribers,
      activeUsers,
      totalAIImages,
      trainedModels
    };

    console.log('✅ Business metrics calculated:', businessMetrics);
    res.json(businessMetrics);
  } catch (error) {
    console.error('❌ Error fetching business metrics:', error);
    res.status(500).json({ error: 'Failed to fetch business metrics' });
  }
});

// CONSOLIDATED: Subscriber stats endpoint
router.get('/subscriber-stats', requireAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching subscriber statistics by source...');
    
    const stats = await db
      .select({
        source: importedSubscribers.source,
        count: count()
      })
      .from(importedSubscribers)
      .groupBy(importedSubscribers.source);

    const result = stats.reduce((acc, stat) => {
      acc[stat.source] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    console.log('✅ Subscriber stats:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ Error fetching subscriber stats:', error);
    res.status(500).json({ error: 'Failed to fetch subscriber statistics' });
  }
});

// CONSOLIDATED: Recent activity endpoint (enhanced version)
router.get('/recent-activity', requireAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching recent platform activity...');
    
    const recentUsers = await db
      .select({
        email: users.email,
        firstName: users.firstName,
        plan: users.plan,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(15);

    const recentAIImages = await db
      .select({
        userId: aiImages.userId,
        imageUrl: aiImages.imageUrl,
        prompt: aiImages.prompt,
        createdAt: aiImages.createdAt
      })
      .from(aiImages)
      .orderBy(desc(aiImages.createdAt))
      .limit(10);

    res.json({
      recentUsers,
      recentAIImages,
      totalUsers: recentUsers.length,
      totalImages: recentAIImages.length
    });
    
    console.log('✅ Recent activity fetched');
  } catch (error) {
    console.error('❌ Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
});

// CONSOLIDATED: User management endpoints (from admin-user-management.ts)
router.post('/impersonate-user', async (req: any, res) => {
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

    // Store admin session before impersonation
    req.session.adminOriginalUser = {
      id: '42585527',
      email: 'ssa@ssasocial.com',
      firstName: 'Sandra',
      lastName: 'Sigurjonsdottir'
    };
    
    // Create full user impersonation session
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
      message: `Now impersonating user: ${targetUser.email}`,
      impersonatedUser: {
        id: targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        plan: targetUser.plan
      }
    });
    
  } catch (error) {
    console.error('❌ Admin user impersonation error:', error);
    res.status(500).json({ error: 'Failed to impersonate user' });
  }
});

export default router;
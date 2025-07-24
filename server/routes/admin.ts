import { Router } from 'express';
import { db } from '../db/index.js';
import { users, subscriptions, sessions } from '@shared/schema.ts';
import { eq, count, sum, desc } from 'drizzle-orm';

const router = Router();

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    // Get total users
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get active subscriptions (you might need to adjust based on your subscription schema)
    const activeSubscriptionsResult = await db
      .select({ count: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, 'active'));
    const activeSubscriptions = activeSubscriptionsResult[0]?.count || 0;

    // Get monthly revenue (mock calculation - adjust based on your revenue tracking)
    const monthlyRevenue = activeSubscriptions * 97; // Assuming $97 per subscription

    // Get completed sessions
    const completedSessionsResult = await db
      .select({ count: count() })
      .from(sessions)
      .where(eq(sessions.status, 'completed'));
    const completedSessions = completedSessionsResult[0]?.count || 0;

    res.json({
      totalUsers,
      activeSubscriptions,
      monthlyRevenue,
      completedSessions
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
        username: users.username,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(10);

    // Get recent sessions
    const recentSessions = await db
      .select({
        id: sessions.id,
        userId: sessions.userId,
        type: sessions.type,
        createdAt: sessions.createdAt
      })
      .from(sessions)
      .orderBy(desc(sessions.createdAt))
      .limit(10);

    // Combine and format activities
    const activities = [
      ...recentUsers.map(user => ({
        id: `user-${user.id}`,
        type: 'user_registration',
        title: `New user registration: ${user.username}`,
        timestamp: formatTimestamp(user.createdAt),
        user: user.username,
        avatar: '/gallery/default-avatar.jpg'
      })),
      ...recentSessions.map(session => ({
        id: `session-${session.id}`,
        type: 'session_start',
        title: `New ${session.type} session started`,
        timestamp: formatTimestamp(session.createdAt),
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
        username: users.username,
        email: users.email,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt
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
function formatTimestamp(date: Date): string {
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

export default router;
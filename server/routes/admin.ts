import { Router } from 'express';
import { db } from '../db';
import { users, subscriptions, sessions } from '@shared/schema';
import { eq, count, sum, desc } from 'drizzle-orm';

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

export default router;
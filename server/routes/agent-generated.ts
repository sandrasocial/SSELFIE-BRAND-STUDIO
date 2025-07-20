// /server/routes/admin.ts - Stats endpoint coordination
import { Router } from 'express';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq, count, and, gte } from 'drizzle-orm';

const router = Router();

router.get('/dashboard-stats', async (req, res) => {
  try {
    // Coordinated stats gathering
    const [totalUsersResult, activeUsersResult] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() })
        .from(users)
        .where(gte(users.updatedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))) // Active in last 30 days
    ]);

    const stats = {
      totalUsers: totalUsersResult[0]?.count || 0,
      activeProjects: activeUsersResult[0]?.count || 0, // Using active users as proxy for now
      revenue: '$12,500' // Placeholder - coordinate with actual revenue system
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export { router as adminRouter };
import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { db } from '../db';
import { users, importedSubscribers, aiImages, subscriptions } from '../../shared/schema';
import { sql, count, sum, eq, gte } from 'drizzle-orm';

const router = Router();

// Admin-only middleware
const isAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  if (!user || (user.claims?.email !== 'ssa@ssasocial.com' && user.role !== 'admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get comprehensive business metrics
router.get('/business-metrics', isAuthenticated, isAdmin, async (req, res) => {
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

    // Get active platform users (users with plan)
    const activeUserStats = await db
      .select({
        activeUsers: count()
      })
      .from(users)
      .where(sql`plan IS NOT NULL AND plan != 'free'`);

    // Get trained models count
    const trainedModelsResult = await db
      .select({
        trainedModels: sql<number>`COUNT(DISTINCT user_id)`
      })
      .from(aiImages)
      .where(sql`model_name IS NOT NULL`);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const monthlyRevenue = (monthlyRevenueResult[0]?.studioUsers || 0) * 67 + (monthlyRevenueResult[0]?.basicUsers || 0) * 29;
    const totalSubscribers = subscriberStats[0]?.total || 0;
    const activeUsers = activeUserStats[0]?.activeUsers || 0;
    const totalAIImages = aiImageStats[0]?.totalImages || 0;
    const trainedModels = trainedModelsResult[0]?.trainedModels || 0;

    console.log('✅ Business metrics calculated:', {
      totalRevenue,
      monthlyRevenue,
      totalSubscribers,
      activeUsers,
      totalAIImages,
      trainedModels
    });

    res.json({
      totalRevenue,
      monthlyRevenue,
      totalSubscribers,
      activeUsers,
      totalAIImages,
      trainedModels,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching business metrics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch business metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get subscriber statistics by source
router.get('/subscriber-stats', isAuthenticated, isAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching subscriber statistics by source...');

    const stats = await db
      .select({
        source: importedSubscribers.source,
        count: count()
      })
      .from(importedSubscribers)
      .groupBy(importedSubscribers.source);

    const formattedStats = stats.reduce((acc, stat) => {
      acc[stat.source] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    console.log('✅ Subscriber stats:', formattedStats);

    res.json(formattedStats);

  } catch (error) {
    console.error('❌ Error fetching subscriber stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch subscriber statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get recent platform activity
router.get('/recent-activity', isAuthenticated, isAdmin, async (req, res) => {
  try {
    console.log('📊 Fetching recent platform activity...');

    // Get recent user registrations
    const recentUsers = await db
      .select({
        email: users.email,
        plan: users.plan,
        createdAt: users.createdAt
      })
      .from(users)
      .where(gte(users.createdAt, sql`NOW() - INTERVAL '30 days'`))
      .orderBy(sql`created_at DESC`)
      .limit(10);

    // Get recent AI image generations
    const recentImages = await db
      .select({
        userId: aiImages.userId,
        createdAt: aiImages.createdAt,
        status: aiImages.status
      })
      .from(aiImages)
      .where(gte(aiImages.createdAt, sql`NOW() - INTERVAL '7 days'`))
      .orderBy(sql`created_at DESC`)
      .limit(20);

    console.log('✅ Recent activity fetched');

    res.json({
      recentUsers,
      recentImages,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error fetching recent activity:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recent activity',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
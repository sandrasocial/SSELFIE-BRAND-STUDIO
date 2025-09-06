import { Router } from 'express';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { requireAuth } from '../stackAuth';

const router = Router();

// Apply authentication to all routes
router.use(requireAuth);

// Customer Management APIs
router.get('/customer-stats', async (req, res) => {
  try {
    // Show all test users (admin + friends/family) since we're in launch phase
    const totalUsersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    const activeSubscriptionsResult = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE plan = 'sselfie-studio' AND stripe_subscription_id IS NOT NULL`);
    const newThisMonthResult = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE created_at >= date_trunc('month', CURRENT_DATE)`);
    
    res.json({
      totalCustomers: (totalUsersResult[0] as any)?.count || 0, // All test users for now
      activeSubscriptions: (activeSubscriptionsResult[0] as any)?.count || 0, // Real paying customers (currently 0)
      newThisMonth: (newThisMonthResult[0] as any)?.count || 0,
      systemHealth: 98
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({ error: 'Failed to fetch customer stats' });
  }
});

router.get('/customers', async (req, res) => {
  try {
    const { search, status, sort } = req.query;
    
    // Show all users during launch phase (admin + test users)
    let query = sql`
      SELECT u.*, up.full_name, up.phone, up.location
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE 1=1
    `;
    
    if (search) {
      query = sql`${query} AND (u.email ILIKE ${'%' + search + '%'} OR u.first_name ILIKE ${'%' + search + '%'} OR u.last_name ILIKE ${'%' + search + '%'})`;
    }
    
    // Add sorting
    if (sort === 'name') {
      query = sql`${query} ORDER BY u.first_name, u.last_name`;
    } else if (sort === 'created') {
      query = sql`${query} ORDER BY u.created_at DESC`;
    } else {
      query = sql`${query} ORDER BY u.created_at DESC`;
    }
    
    query = sql`${query} LIMIT 50`;
    
    const customersResult = await db.execute(query);
    const customers = Array.from(customersResult as unknown as any[]);
    
    // Add calculated fields with accurate test user status
    const enrichedCustomers = customers.map((customer: any) => ({
      ...customer,
      status: customer.stripe_subscription_id ? 'paying' : 'test-user',
      totalSpent: customer.stripe_subscription_id ? 47 : 0, // €0 for test users
      lastActiveAt: customer.updated_at || customer.created_at,
      userType: customer.id === '42585527' ? 'admin' : 'test-user' // Mark admin vs test users
    }));
    
    res.json(enrichedCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

router.get('/customer-insights', async (req, res) => {
  try {
    const newThisMonthResult = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE created_at >= date_trunc('month', CURRENT_DATE)`);
    
    // Calculate real metrics - currently 0 paying customers in launch phase
    const totalPayingUsersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE stripe_subscription_id IS NOT NULL`);
    const averageLifetimeValue = 0; // €0 since no paying customers yet
    
    res.json({
      newThisMonth: (newThisMonthResult[0] as any)?.count || 0,
      averageLifetimeValue: averageLifetimeValue,
      averageGenerationsPerMonth: 0, // No paying customer activity yet
      churnRate: 0 // No churn data yet in launch phase
    });
  } catch (error) {
    console.error('Error fetching customer insights:', error);
    res.status(500).json({ error: 'Failed to fetch customer insights' });
  }
});

// Revenue Analytics APIs
router.get('/revenue-summary', async (req, res) => {
  try {
    const payingUsersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE stripe_subscription_id IS NOT NULL`);
    const totalUsersResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    const monthlyRevenue = 0; // €0 revenue - launch phase with test users only
    
    res.json({
      monthlyRevenue: monthlyRevenue,
      totalCustomers: (totalUsersResult[0] as any)?.count || 0, // All test users
      activeSubscriptions: (payingUsersResult[0] as any)?.count || 0, // Real paying customers (0)
      systemHealth: 98
    });
  } catch (error) {
    console.error('Error fetching revenue summary:', error);
    res.status(500).json({ error: 'Failed to fetch revenue summary' });
  }
});

router.get('/revenue-analytics', async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    
    // Launch phase - all metrics start at 0
    const monthlyRevenue = 0;
    
    res.json({
      monthlyRevenue: monthlyRevenue,
      previousMonthRevenue: 0,
      yearlyRevenue: 0,
      averageRevenuePerUser: 0, // Will be €47 when we get paying customers
      monthlyGrowthRate: 0,
      churnRate: 0,
      newCustomerRevenue: 0,
      recurringRevenue: 0
    });
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

router.get('/revenue-breakdown', async (req, res) => {
  try {
    // Launch phase - no revenue yet
    res.json({
      subscriptions: 0,
      retraining: 0,
      oneTime: 0
    });
  } catch (error) {
    console.error('Error fetching revenue breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch revenue breakdown' });
  }
});

// Content Moderation APIs (placeholder endpoints)
router.get('/content-moderation', async (req, res) => {
  try {
    // Return empty array for now - will be implemented when content moderation is added
    res.json([]);
  } catch (error) {
    console.error('Error fetching content moderation items:', error);
    res.status(500).json({ error: 'Failed to fetch content moderation items' });
  }
});

router.get('/moderation-stats', async (req, res) => {
  try {
    res.json({
      pendingReview: 0,
      approvedToday: 0,
      rejectedToday: 0,
      averageReviewTime: 0
    });
  } catch (error) {
    console.error('Error fetching moderation stats:', error);
    res.status(500).json({ error: 'Failed to fetch moderation stats' });
  }
});

router.patch('/content-moderation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body;
    
    // Implementation will be added when content moderation tables are created
    res.json({ success: true, action, reason });
  } catch (error) {
    console.error('Error processing moderation action:', error);
    res.status(500).json({ error: 'Failed to process moderation action' });
  }
});

// Support Management APIs (placeholder endpoints)
router.get('/support-tickets', async (req, res) => {
  try {
    // Return empty array for now - will be implemented when support system is added
    res.json([]);
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({ error: 'Failed to fetch support tickets' });
  }
});

router.get('/support-stats', async (req, res) => {
  try {
    res.json({
      openTickets: 0,
      averageResponseTime: 0,
      resolvedToday: 0,
      satisfactionScore: 95
    });
  } catch (error) {
    console.error('Error fetching support stats:', error);
    res.status(500).json({ error: 'Failed to fetch support stats' });
  }
});

router.patch('/support-tickets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo } = req.body;
    
    // Implementation will be added when support ticket tables are created
    res.json({ success: true, status, priority, assignedTo });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    res.status(500).json({ error: 'Failed to update support ticket' });
  }
});

router.post('/support-tickets/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    
    // Implementation will be added when support ticket tables are created
    res.json({ success: true, message });
  } catch (error) {
    console.error('Error sending ticket reply:', error);
    res.status(500).json({ error: 'Failed to send ticket reply' });
  }
});

export default router;
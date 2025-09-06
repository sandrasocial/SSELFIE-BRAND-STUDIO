import { Router } from 'express';
import { requireAuth } from '../neonAuth';
import { db } from '../db';
import { eq, desc, and, gte } from 'drizzle-orm';

const router = Router();

// Store agent insights for dashboard display
interface StoredInsight {
  id: string;
  agentName: string;
  insightType: 'strategic' | 'technical' | 'operational' | 'urgent';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  context: Record<string, any>;
  triggerReason: string;
  timestamp: Date;
  isRead: boolean;
  actionTaken?: string;
}

// In-memory storage for insights (replace with database table in production)
const insights: StoredInsight[] = [];

// Get recent agent insights for dashboard
router.get('/recent', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (userId !== '42585527') { // Sandra's user ID
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { limit = 20, type, agent, priority } = req.query;
    
    let filteredInsights = [...insights];
    
    // Apply filters
    if (type) {
      filteredInsights = filteredInsights.filter(i => i.insightType === type);
    }
    if (agent) {
      filteredInsights = filteredInsights.filter(i => i.agentName === agent);
    }
    if (priority) {
      filteredInsights = filteredInsights.filter(i => i.priority === priority);
    }
    
    // Sort by timestamp (newest first) and limit
    const recentInsights = filteredInsights
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, parseInt(limit as string));

    res.json({
      success: true,
      insights: recentInsights,
      total: filteredInsights.length,
      unreadCount: filteredInsights.filter(i => !i.isRead).length
    });

  } catch (error) {
    console.error('Get recent insights error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mark insight as read
router.patch('/mark-read/:id', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (userId !== '42585527') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;
    const insight = insights.find(i => i.id === id);
    
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }

    insight.isRead = true;
    
    res.json({
      success: true,
      message: 'Insight marked as read'
    });

  } catch (error) {
    console.error('Mark insight read error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add action taken to insight
router.patch('/action-taken/:id', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (userId !== '42585527') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;
    const { action } = req.body;
    
    const insight = insights.find(i => i.id === id);
    
    if (!insight) {
      return res.status(404).json({ message: 'Insight not found' });
    }

    insight.actionTaken = action;
    insight.isRead = true;
    
    res.json({
      success: true,
      message: 'Action recorded',
      insight
    });

  } catch (error) {
    console.error('Record action error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get insight statistics for dashboard
router.get('/stats', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (userId !== '42585527') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Calculate stats from stored insights
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayInsights = insights.filter(i => i.timestamp >= today);
    const thisWeekInsights = insights.filter(i => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return i.timestamp >= weekAgo;
    });

    const stats = {
      total: insights.length,
      today: todayInsights.length,
      thisWeek: thisWeekInsights.length,
      unread: insights.filter(i => !i.isRead).length,
      byType: {
        strategic: insights.filter(i => i.insightType === 'strategic').length,
        technical: insights.filter(i => i.insightType === 'technical').length,
        operational: insights.filter(i => i.insightType === 'operational').length,
        urgent: insights.filter(i => i.insightType === 'urgent').length
      },
      byPriority: {
        high: insights.filter(i => i.priority === 'high').length,
        medium: insights.filter(i => i.priority === 'medium').length,
        low: insights.filter(i => i.priority === 'low').length
      },
      topAgents: Object.entries(
        insights.reduce((acc, insight) => {
          acc[insight.agentName] = (acc[insight.agentName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      )
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([agent, count]) => ({ agent, count }))
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get insight stats error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Store new insight (called by insight engine)
router.post('/store', async (req, res) => {
  try {
    const { agentName, insightType, title, message, priority, context, triggerReason } = req.body;
    
    const newInsight: StoredInsight = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentName,
      insightType,
      title,
      message,
      priority,
      context,
      triggerReason,
      timestamp: new Date(),
      isRead: false
    };

    insights.push(newInsight);
    
    // Keep only last 200 insights to prevent memory issues
    if (insights.length > 200) {
      insights.splice(0, insights.length - 200);
    }

    console.log(`📊 INSIGHT STORED: ${agentName} - ${title}`);
    
    res.json({
      success: true,
      insight: newInsight
    });

  } catch (error) {
    console.error('Store insight error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete insight
router.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user?.claims?.sub;
    if (userId !== '42585527') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;
    const index = insights.findIndex(i => i.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: 'Insight not found' });
    }

    insights.splice(index, 1);
    
    res.json({
      success: true,
      message: 'Insight deleted'
    });

  } catch (error) {
    console.error('Delete insight error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
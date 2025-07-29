import { Request, Response } from 'express';
import { db } from '../db';
import { agentLearning, claudeConversations, users } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

// Unified user ID resolution for consistent memory handling
const resolveUserId = async (inputUserId: string): Promise<string> => {
  // Handle admin user variations
  if (['sandra-admin', 'admin', 'admin-sandra', '42585527'].includes(inputUserId)) {
    try {
      const adminUser = await db
        .select()
        .from(users)
        .where(eq(users.email, 'ssa@ssasocial.com'))
        .limit(1);
      
      if (adminUser.length > 0) {
        return adminUser[0].id;
      }
      
      // Fallback to standard Sandra ID
      return '42585527';
    } catch (error) {
      console.warn('User ID resolution fallback:', error);
      return '42585527';
    }
  }
  
  return inputUserId;
};

// Store agent learning data with enhanced user ID handling
export const storeAgentLearning = async (req: Request, res: Response) => {
  try {
    const { agentName, userId, learningType, category, data, confidence = 0.7 } = req.body;

    // Validate required fields
    if (!agentName || !userId || !learningType || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields: agentName, userId, learningType, category' 
      });
    }

    // Resolve user ID consistently
    const resolvedUserId = await resolveUserId(userId);

    // Check for existing learning entry to update frequency
    const existingLearning = await db
      .select()
      .from(agentLearning)
      .where(and(
        eq(agentLearning.agentName, agentName),
        eq(agentLearning.userId, resolvedUserId),
        eq(agentLearning.learningType, learningType),
        eq(agentLearning.category, category)
      ))
      .limit(1);

    let learning;
    
    if (existingLearning.length > 0) {
      // Update existing learning entry
      const updated = await db
        .update(agentLearning)
        .set({
          data: { ...existingLearning[0].data, ...data },
          confidence: Math.min(1.0, parseFloat(existingLearning[0].confidence || "0.5") + 0.1).toFixed(2),
          frequency: (existingLearning[0].frequency || 0) + 1,
          lastSeen: new Date(),
          updatedAt: new Date()
        })
        .where(eq(agentLearning.id, existingLearning[0].id))
        .returning();
      
      learning = updated[0];
      console.log(`📚 Updated existing learning for ${agentName}: ${category}`);
    } else {
      // Create new learning entry
      const inserted = await db.insert(agentLearning).values({
        agentName,
        userId: resolvedUserId,
        learningType,
        category,
        data,
        confidence: confidence.toString(),
        frequency: 1,
        lastSeen: new Date(),
      }).returning();
      
      learning = inserted[0];
      console.log(`📚 Created new learning for ${agentName}: ${category}`);
    }

    res.json({ success: true, learning });
  } catch (error) {
    console.error('Store learning error:', error);
    res.status(500).json({ error: 'Failed to store learning data' });
  }
};

// Retrieve agent memory for context with enhanced filtering
export const getAgentMemory = async (req: Request, res: Response) => {
  try {
    const { agentName, userId } = req.params;

    // Validate required parameters
    if (!agentName || !userId) {
      return res.status(400).json({ 
        error: 'Missing required parameters: agentName, userId' 
      });
    }

    // Resolve user ID consistently
    const resolvedUserId = await resolveUserId(userId);

    // Get recent learning patterns with confidence weighting
    const recentLearning = await db
      .select()
      .from(agentLearning)
      .where(and(
        eq(agentLearning.agentName, agentName),
        eq(agentLearning.userId, resolvedUserId)
      ))
      .orderBy(desc(agentLearning.lastSeen))
      .limit(50); // Get more entries for better filtering

    // Get conversation context
    const conversations = await db
      .select()
      .from(claudeConversations)
      .where(and(
        eq(claudeConversations.agentName, agentName),
        eq(claudeConversations.userId, resolvedUserId)
      ))
      .orderBy(desc(claudeConversations.lastMessageAt))
      .limit(10);

    // Filter and weight learning data by confidence and frequency
    const highConfidenceLearning = recentLearning.filter(learning => {
      const confidence = parseFloat(learning.confidence || "0");
      const frequency = learning.frequency || 0;
      return confidence > 0.5 && frequency > 1; // Only include well-established patterns
    });

    // Build enhanced memory context
    const memoryContext = {
      preferences: highConfidenceLearning
        .filter(l => l.learningType === 'preference')
        .slice(0, 10), // Top 10 preferences
      patterns: highConfidenceLearning
        .filter(l => l.learningType === 'pattern')
        .slice(0, 15), // Top 15 patterns
      context: recentLearning
        .filter(l => l.learningType === 'context')
        .slice(0, 5), // Recent 5 context entries
      learning: highConfidenceLearning
        .filter(l => l.learningType === 'learning')
        .slice(0, 10), // Top 10 learning insights
      recentConversations: conversations.map(c => ({
        title: c.title,
        context: c.context,
        messageCount: c.messageCount,
        lastMessageAt: c.lastMessageAt
      })),
      stats: {
        totalLearningEntries: recentLearning.length,
        highConfidenceEntries: highConfidenceLearning.length,
        conversationCount: conversations.length,
        lastUpdated: new Date().toISOString()
      }
    };

    console.log(`🧠 Retrieved memory for ${agentName}: ${highConfidenceLearning.length} high-confidence entries`);
    res.json({ success: true, memory: memoryContext });
  } catch (error) {
    console.error('Get memory error:', error);
    res.status(500).json({ error: 'Failed to retrieve memory' });
  }
};

// Update learning frequency and confidence
export const updateLearningPattern = async (req: Request, res: Response) => {
  try {
    const { learningId } = req.params;
    const { confidence, frequency } = req.body;

    await db
      .update(agentLearning)
      .set({
        confidence,
        frequency,
        lastSeen: new Date(),
        updatedAt: new Date()
      })
      .where(eq(agentLearning.id, parseInt(learningId)));

    res.json({ success: true });
  } catch (error) {
    console.error('Update learning error:', error);
    res.status(500).json({ error: 'Failed to update learning pattern' });
  }
};
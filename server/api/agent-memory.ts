import { Request, Response } from 'express';
import { db } from '../db';
import { agentLearning, claudeConversations } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

// Store agent learning data
export const storeAgentLearning = async (req: Request, res: Response) => {
  try {
    const { agentName, userId, learningType, category, data, confidence = 0.7 } = req.body;

    const learning = await db.insert(agentLearning).values({
      agentName,
      userId,
      learningType, // 'preference', 'pattern', 'skill', 'context'
      category,
      data,
      confidence,
      frequency: 1,
      lastSeen: new Date(),
    }).returning();

    res.json({ success: true, learning: learning[0] });
  } catch (error) {
    console.error('Store learning error:', error);
    res.status(500).json({ error: 'Failed to store learning data' });
  }
};

// Retrieve agent memory for context
export const getAgentMemory = async (req: Request, res: Response) => {
  try {
    const { agentName, userId } = req.params;

    // Get recent learning patterns
    const recentLearning = await db
      .select()
      .from(agentLearning)
      .where(and(
        eq(agentLearning.agentName, agentName),
        eq(agentLearning.userId, userId)
      ))
      .orderBy(desc(agentLearning.lastSeen))
      .limit(20);

    // Get conversation context
    const conversations = await db
      .select()
      .from(claudeConversations)
      .where(and(
        eq(claudeConversations.agentName, agentName),
        eq(claudeConversations.userId, userId)
      ))
      .orderBy(desc(claudeConversations.lastMessageAt))
      .limit(5);

    // Build memory context
    const memoryContext = {
      preferences: recentLearning.filter(l => l.learningType === 'preference'),
      patterns: recentLearning.filter(l => l.learningType === 'pattern'),
      context: recentLearning.filter(l => l.learningType === 'context'),
      recentConversations: conversations.map(c => c.context)
    };

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
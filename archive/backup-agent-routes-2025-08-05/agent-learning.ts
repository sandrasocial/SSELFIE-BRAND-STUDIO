// Agent Learning & Training API Routes
import { Router } from 'express';
import { z } from 'zod';
import { agentLearningSystem } from '../agents/agent-learning-system';
import { isAuthenticated } from '../replitAuth';

const router = Router();

// Record learning event for agent improvement
router.post('/learning-event', isAuthenticated, async (req, res) => {
  try {
    const eventSchema = z.object({
      agentId: z.string(),
      taskType: z.string(),
      context: z.string(),
      outcome: z.enum(['success', 'failure', 'partial']),
      learningNotes: z.string(),
      metadata: z.record(z.any()).optional()
    });

    const event = eventSchema.parse(req.body);
    await agentLearningSystem.recordLearningEvent(event);
    
    res.json({ success: true, message: 'Learning event recorded' });
  } catch (error) {
    console.error('Failed to record learning event:', error);
    res.status(500).json({ error: 'Failed to record learning event' });
  }
});

// Add knowledge to agent's knowledge base
router.post('/knowledge', isAuthenticated, async (req, res) => {
  try {
    const knowledgeSchema = z.object({
      agentId: z.string(),
      topic: z.string(),
      content: z.string(),
      source: z.enum(['conversation', 'training', 'documentation', 'experience']),
      confidence: z.number().min(0).max(1)
    });

    const knowledge = knowledgeSchema.parse(req.body);
    knowledge.lastUpdated = new Date();
    
    await agentLearningSystem.addKnowledge(knowledge);
    
    res.json({ success: true, message: 'Knowledge added successfully' });
  } catch (error) {
    console.error('Failed to add knowledge:', error);
    res.status(500).json({ error: 'Failed to add knowledge' });
  }
});

// Get agent knowledge
router.get('/knowledge/:agentId', isAuthenticated, async (req, res) => {
  try {
    const { agentId } = req.params;
    const { topic } = req.query;
    
    const knowledge = await agentLearningSystem.getAgentKnowledge(
      agentId, 
      topic as string
    );
    
    res.json(knowledge);
  } catch (error) {
    console.error('Failed to get agent knowledge:', error);
    res.status(500).json({ error: 'Failed to get agent knowledge' });
  }
});

// Get agent performance metrics
router.get('/performance/:agentId', isAuthenticated, async (req, res) => {
  try {
    const { agentId } = req.params;
    const metrics = await agentLearningSystem.getPerformanceMetrics(agentId);
    
    res.json(metrics);
  } catch (error) {
    console.error('Failed to get performance metrics:', error);
    res.status(500).json({ error: 'Failed to get performance metrics' });
  }
});

// Get learning history
router.get('/history/:agentId', isAuthenticated, async (req, res) => {
  try {
    const { agentId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const history = await agentLearningSystem.getLearningHistory(agentId, limit);
    
    res.json(history);
  } catch (error) {
    console.error('Failed to get learning history:', error);
    res.status(500).json({ error: 'Failed to get learning history' });
  }
});

// Get enhancement recommendations
router.get('/recommendations/:agentId', isAuthenticated, async (req, res) => {
  try {
    const { agentId } = req.params;
    const recommendations = await agentLearningSystem.generateEnhancementRecommendations(agentId);
    
    res.json({ recommendations });
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Bulk training session
router.post('/training-session', isAuthenticated, async (req, res) => {
  try {
    const sessionSchema = z.object({
      agentId: z.string(),
      sessionType: z.enum(['manual', 'automatic', 'feedback']),
      trainingData: z.record(z.any()),
      improvements: z.string().optional(),
      performanceGain: z.number().optional()
    });

    const session = sessionSchema.parse(req.body);
    
    // For now, we'll just record this as a learning event
    // In the future, this could trigger actual model retraining
    await agentLearningSystem.recordLearningEvent({
      agentId: session.agentId,
      taskType: 'training_session',
      context: `Training session: ${session.sessionType}`,
      outcome: 'success',
      learningNotes: session.improvements || 'Training session completed',
      metadata: {
        sessionType: session.sessionType,
        trainingData: session.trainingData,
        performanceGain: session.performanceGain
      }
    });
    
    res.json({ success: true, message: 'Training session recorded' });
  } catch (error) {
    console.error('Failed to record training session:', error);
    res.status(500).json({ error: 'Failed to record training session' });
  }
});

export default router;
import { Router } from 'express';
import { db } from '../drizzle';
import { agentSessions, approvalQueue } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const emergencyRouter = Router();

// Emergency stop all agents
emergencyRouter.post('/emergency-stop', async (req, res) => {
  try {
    // Pause all active agent sessions
    await db.update(agentSessions)
      .set({ status: 'emergency_paused', updatedAt: new Date() })
      .where(eq(agentSessions.status, 'active'));
    
    // Clear approval queue with emergency flag
    await db.update(approvalQueue)
      .set({ status: 'emergency_paused' })
      .where(eq(approvalQueue.status, 'pending'));
    
    res.json({ success: true, message: 'All agents emergency stopped' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Emergency stop failed' });
  }
});

// Resume agents after emergency
emergencyRouter.post('/resume-agents', async (req, res) => {
  try {
    // Resume all emergency paused agent sessions
    await db.update(agentSessions)
      .set({ status: 'active', updatedAt: new Date() })
      .where(eq(agentSessions.status, 'emergency_paused'));
    
    // Resume all emergency paused approvals
    await db.update(approvalQueue)
      .set({ status: 'pending' })
      .where(eq(approvalQueue.status, 'emergency_paused'));
    
    res.json({ success: true, message: 'All agents resumed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Resume failed' });
  }
});

export { emergencyRouter };
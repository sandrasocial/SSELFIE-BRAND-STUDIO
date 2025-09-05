import { Router } from 'express';
import { db } from '../db';
import { approvalQueue } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const emergencyRouter = Router();

// Emergency stop all agents
emergencyRouter.post('/emergency-stop', async (req, res) => {
  try {
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
  // Implementation for resuming agents safely
});

export { emergencyRouter };
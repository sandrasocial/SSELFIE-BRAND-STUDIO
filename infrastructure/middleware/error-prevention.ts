import { Request, Response, NextFunction } from 'express';
import { agentCodeCheck } from '../utils/agent-error-prevention';

export const errorPreventionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Check if this is a code modification request
  if (req.body?.code) {
    const safetyCheck = await agentCodeCheck(
      req.body.code,
      req.body.agentName || 'Unknown Agent'
    );
    
    if (!safetyCheck.safe) {
      res.status(400).json({ 
        error: 'Potential code issues detected',
        details: safetyCheck.message || safetyCheck.error
      });
      return;
    }
  }
  
  next();
};
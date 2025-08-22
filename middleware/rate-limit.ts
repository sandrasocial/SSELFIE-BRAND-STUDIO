import { Request, Response, NextFunction } from 'express';
import { SecurityAuditLogger } from '../security/audit-logger';

export const loginRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.body.email || 'anonymous';
  const ipAddress = req.ip;

  try {
    const isRateLimited = await SecurityAuditLogger.checkRateLimit(userId);
    
    if (isRateLimited) {
      await SecurityAuditLogger.logSecurityEvent('RATE_LIMIT_EXCEEDED', userId, {
        ipAddress,
        timestamp: new Date()
      });
      
      return res.status(429).json({
        error: 'Too many login attempts. Please try again later.',
        retryAfter: '30 minutes'
      });
    }

    next();
  } catch (error) {
    console.error('Rate limit check failed:', error);
    next(error);
  }
};
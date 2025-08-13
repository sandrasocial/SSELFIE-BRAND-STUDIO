import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
// Agent security validation (simplified - no more competing config systems)
import { agentPerformanceMonitor } from '../services/agent-performance-monitor';

// Rate limiter setup
const rateLimiter = new RateLimiterMemory({
  points: 100, // Number of points
  duration: 60, // Per minute
});

export async function agentSecurityMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const agentId = req.headers['x-agent-id'] as string;
  
  try {
    // Rate limiting
    await rateLimiter.consume(agentId);

    // Simplified resource validation (no more competing config systems)
    const performanceStats = agentPerformanceMonitor.getAgentPerformanceReport(agentId);
    if (performanceStats.stats.totalCalls > 10) { // Simplified limit
      return res.status(429).json({
        error: 'Max concurrent operations exceeded',
        message: 'Please try again later'
      });
    }

    // Start performance monitoring
    const stopMonitoring = agentPerformanceMonitor.startMonitoring(
      agentId,
      req.headers['x-conversation-id'] as string
    );

    // Clean up monitoring on response finish
    res.on('finish', () => {
      stopMonitoring();
    });

    next();
  } catch (error: any) {
    if (error.name === 'RateLimiterRes') {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later'
      });
    }
    next(error);
  }
}
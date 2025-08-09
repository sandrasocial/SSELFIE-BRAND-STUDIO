import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { validateAgentResources, systemLimits } from '../config/agent-system-config';
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

    // Resource validation
    if (!validateAgentResources(agentId)) {
      return res.status(429).json({
        error: 'Agent resource limit exceeded',
        message: 'Please try again later'
      });
    }

    // Performance check
    const performanceStats = agentPerformanceMonitor.getAgentPerformanceReport(agentId);
    if (performanceStats.stats.totalCalls > systemLimits.maxConcurrentAgents) {
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
  } catch (error) {
    if (error.name === 'RateLimiterRes') {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later'
      });
    }
    next(error);
  }
}
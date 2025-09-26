/**
 * Health Check Routes
 * Comprehensive health monitoring endpoints
 */

import { Router } from 'express';
import { performanceMonitor } from '../utils/performance-monitor';
import { serviceDiscovery } from '../services/service-discovery';
import { unifiedErrorHandler } from '../services/unified-error-handler';
import { Logger } from '../utils/logger';

const router = Router();
const logger = new Logger('HealthCheck');

/**
 * Basic health check
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SSELFIE Studio',
    version: '1.0.0'
  });
});

/**
 * Detailed health check
 */
router.get('/health/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check system performance
    const performanceSummary = performanceMonitor.getSystemSummary();
    
    // Check service status
    const serviceStats = serviceDiscovery.getServiceStatistics();
    
    // Check error rates
    const errorStats = unifiedErrorHandler.getErrorStatistics();
    
    // Check database connectivity (simplified)
    const databaseStatus = await checkDatabaseHealth();
    
    // Check external services
    const externalServicesStatus = await checkExternalServices();
    
    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'SSELFIE Studio',
      version: '1.0.0',
      responseTime: `${responseTime}ms`,
      checks: {
        database: databaseStatus,
        externalServices: externalServicesStatus,
        performance: {
          status: performanceSummary.averageResponseTime < 5000 ? 'healthy' : 'degraded',
          averageResponseTime: `${performanceSummary.averageResponseTime.toFixed(2)}ms`,
          successRate: `${performanceSummary.successRate.toFixed(2)}%`,
          totalOperations: performanceSummary.totalOperations
        },
        services: {
          status: serviceStats.healthyServices === serviceStats.totalServices ? 'healthy' : 'degraded',
          total: serviceStats.totalServices,
          healthy: serviceStats.healthyServices,
          degraded: serviceStats.degradedServices,
          unhealthy: serviceStats.unhealthyServices
        },
        errors: {
          status: errorStats.totalErrors < 100 ? 'healthy' : 'degraded',
          totalErrors: errorStats.totalErrors,
          recentErrors: errorStats.recentErrors.length
        }
      },
      system: {
        memory: {
          used: `${(performanceSummary.memoryUsage.current / 1024 / 1024).toFixed(2)}MB`,
          average: `${(performanceSummary.memoryUsage.average / 1024 / 1024).toFixed(2)}MB`,
          peak: `${(performanceSummary.memoryUsage.peak / 1024 / 1024).toFixed(2)}MB`
        },
        cpu: {
          current: `${performanceSummary.cpuUsage.current.toFixed(2)}s`,
          average: `${performanceSummary.cpuUsage.average.toFixed(2)}s`
        }
      }
    };
    
    // Determine overall status
    const overallStatus = determineOverallStatus(healthStatus);
    healthStatus.status = overallStatus;
    
    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
    
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Readiness check
 */
router.get('/health/ready', async (req, res) => {
  try {
    const checks = await Promise.allSettled([
      checkDatabaseHealth(),
      checkExternalServices(),
      checkServiceHealth()
    ]);
    
    const allHealthy = checks.every(check => 
      check.status === 'fulfilled' && check.value.status === 'healthy'
    );
    
    if (allHealthy) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks: checks.map((check, index) => ({
          check: ['database', 'externalServices', 'serviceHealth'][index],
          status: check.status === 'fulfilled' ? check.value.status : 'failed',
          error: check.status === 'rejected' ? check.reason : undefined
        }))
      });
    }
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Liveness check
 */
router.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Metrics endpoint
 */
router.get('/health/metrics', (req, res) => {
  try {
    const performanceSummary = performanceMonitor.getSystemSummary();
    const serviceStats = serviceDiscovery.getServiceStatistics();
    const errorStats = unifiedErrorHandler.getErrorStatistics();
    
    res.json({
      timestamp: new Date().toISOString(),
      performance: performanceSummary,
      services: serviceStats,
      errors: errorStats
    });
  } catch (error) {
    logger.error('Metrics endpoint failed:', error);
    res.status(500).json({
      error: 'Failed to retrieve metrics'
    });
  }
});

/**
 * Check database health
 */
async function checkDatabaseHealth(): Promise<{ status: string; details?: any }> {
  try {
    // Simplified database check - in production, this would test actual database connectivity
    const { db } = await import('../drizzle');
    
    // Try a simple query
    await db.execute('SELECT 1');
    
    return {
      status: 'healthy',
      details: {
        connection: 'active',
        responseTime: '< 100ms'
      }
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Check external services health
 */
async function checkExternalServices(): Promise<{ status: string; details?: any }> {
  try {
    const services = [
      { name: 'Anthropic Claude', url: 'https://api.anthropic.com', required: true },
      { name: 'Google GenAI', url: 'https://generativelanguage.googleapis.com', required: false },
      { name: 'Replicate', url: 'https://api.replicate.com', required: true }
    ];
    
    const results = await Promise.allSettled(
      services.map(async (service) => {
        try {
          const response = await fetch(service.url, { 
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
          });
          return {
            name: service.name,
            status: response.ok ? 'healthy' : 'degraded',
            required: service.required
          };
        } catch (error) {
          return {
            name: service.name,
            status: 'unhealthy',
            required: service.required,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );
    
    const serviceResults = results.map((result, index) => 
      result.status === 'fulfilled' ? result.value : {
        name: services[index].name,
        status: 'unhealthy',
        required: services[index].required,
        error: 'Check failed'
      }
    );
    
    const unhealthyRequired = serviceResults.filter(s => s.required && s.status === 'unhealthy');
    const overallStatus = unhealthyRequired.length > 0 ? 'unhealthy' : 'healthy';
    
    return {
      status: overallStatus,
      details: {
        services: serviceResults
      }
    };
  } catch (error) {
    logger.error('External services health check failed:', error);
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Check service health
 */
async function checkServiceHealth(): Promise<{ status: string; details?: any }> {
  try {
    const serviceStats = serviceDiscovery.getServiceStatistics();
    const unhealthyServices = serviceStats.unhealthyServices;
    
    return {
      status: unhealthyServices > 0 ? 'degraded' : 'healthy',
      details: {
        totalServices: serviceStats.totalServices,
        healthyServices: serviceStats.healthyServices,
        unhealthyServices: serviceStats.unhealthyServices
      }
    };
  } catch (error) {
    logger.error('Service health check failed:', error);
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Determine overall health status
 */
function determineOverallStatus(healthStatus: any): string {
  const checks = healthStatus.checks;
  
  // Check if any critical component is unhealthy
  if (checks.database.status === 'unhealthy' || 
      checks.externalServices.status === 'unhealthy' ||
      checks.services.status === 'unhealthy') {
    return 'unhealthy';
  }
  
  // Check if any component is degraded
  if (checks.database.status === 'degraded' || 
      checks.externalServices.status === 'degraded' ||
      checks.services.status === 'degraded' ||
      checks.performance.status === 'degraded' ||
      checks.errors.status === 'degraded') {
    return 'degraded';
  }
  
  return 'healthy';
}

export default router;

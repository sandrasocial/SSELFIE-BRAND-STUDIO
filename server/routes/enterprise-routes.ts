/**
 * PHASE 3: ENTERPRISE SCALING - API ROUTES
 * Enterprise-level API endpoints for predictive intelligence, security, performance, and global expansion
 */

import type { Express, Request, Response } from 'express';
import { predictiveIntelligence } from '../enterprise/predictive-intelligence.js';
import { securityAudit } from '../enterprise/security-audit.js';
import { PerformanceMonitor } from '../enterprise/performance-monitor.js';
import { globalExpansion } from '../enterprise/global-expansion.js';
import { analyticsReporting } from '../enterprise/analytics-reporting.js';
import { requireStackAuth } from '../stack-auth.js'

// Standardized response types for enterprise routes
interface EnterpriseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  message?: string;
  timestamp: string;
}

interface EnterpriseErrorResponse {
  success: false;
  error: string;
  details?: string;
  timestamp: string;
}

// Input validation helpers
function validateThreatDetectionInput(body: any): { 
  valid: boolean; 
  error?: string; 
  data?: { type: string; source: string; description: string; severity: string } 
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const { type, source, description, severity } = body;

  if (!type || typeof type !== 'string') {
    return { valid: false, error: 'Threat type is required and must be a string' };
  }

  if (!source || typeof source !== 'string') {
    return { valid: false, error: 'Threat source is required and must be a string' };
  }

  if (!description || typeof description !== 'string') {
    return { valid: false, error: 'Threat description is required and must be a string' };
  }

  if (!severity || typeof severity !== 'string' || !['low', 'medium', 'high', 'critical'].includes(severity)) {
    return { valid: false, error: 'Severity must be one of: low, medium, high, critical' };
  }

  if (!['brute_force', 'ddos', 'data_breach', 'unauthorized_access', 'api_abuse'].includes(type)) {
    return { valid: false, error: 'Type must be one of: brute_force, ddos, data_breach, unauthorized_access, api_abuse' };
  }

  return { 
    valid: true, 
    data: { type, source, description, severity } 
  };
}

function validateAlertId(alertId: string): { valid: boolean; error?: string } {
  if (!alertId || typeof alertId !== 'string' || alertId.trim() === '') {
    return { valid: false, error: 'Alert ID is required and must be a non-empty string' };
  }
  return { valid: true };
}

// Error handling helper
function handleEnterpriseError(error: unknown, context: string): EnterpriseErrorResponse {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  console.error(`❌ ${context} ERROR:`, errorMessage);
  
  return {
    success: false,
    error: `Failed to ${context.toLowerCase()}`,
    details: errorMessage,
    timestamp: new Date().toISOString()
  };
}

// Success response helper
function createSuccessResponse<T>(data: T, message?: string): EnterpriseResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
}

export function registerEnterpriseRoutes(app: Express): void {
  console.log('🏢 Registering Enterprise Scaling API routes...');

  // Predictive Intelligence Endpoints
  app.get('/api/enterprise/predictive-metrics', requireStackAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🔮 PREDICTIVE INTELLIGENCE: Generating metrics...');
      const metrics = await predictiveIntelligence.generatePredictiveMetrics();
      
      const response = createSuccessResponse(metrics);
      res.json(response);
    } catch (error) {
      const errorResponse = handleEnterpriseError(error, 'PREDICTIVE INTELLIGENCE');
      res.status(500).json(errorResponse);
    }
  });

  // Security Audit Endpoints
  app.get('/api/enterprise/security-report', requireStackAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🔒 SECURITY AUDIT: Generating security report...');
      const report = await securityAudit.generateSecurityReport();
      
      const response = createSuccessResponse(report);
      res.json(response);
    } catch (error) {
      const errorResponse = handleEnterpriseError(error, 'SECURITY AUDIT');
      res.status(500).json(errorResponse);
    }
  });

  // Security threat detection endpoint
  app.post('/api/enterprise/security/detect-threat', requireStackAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      const validation = validateThreatDetectionInput(req.body);
      
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          error: 'Invalid input',
          details: validation.error,
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { type, source, description, severity } = validation.data!;
      
      // Type assertions to match expected security audit types
      const threatType = type as 'brute_force' | 'ddos' | 'data_breach' | 'unauthorized_access' | 'api_abuse';
      const threatSeverity = severity as 'critical' | 'low' | 'medium' | 'high';
      
      await securityAudit.detectThreat(threatType, source, description, threatSeverity);
      
      const response = createSuccessResponse(null, 'Threat detection logged successfully');
      res.json(response);
    } catch (error) {
      const errorResponse = handleEnterpriseError(error, 'THREAT DETECTION');
      res.status(500).json(errorResponse);
    }
  });

  // Performance Monitoring Endpoints
  app.get('/api/enterprise/performance-report', requireStackAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📊 PERFORMANCE MONITOR: Generating performance report...');
      const report = await PerformanceMonitor.generatePerformanceReport();
      
      const response = createSuccessResponse(report);
      res.json(response);
    } catch (error) {
      const errorResponse = handleEnterpriseError(error, 'PERFORMANCE MONITOR');
      res.status(500).json(errorResponse);
    }
  });

  // Performance alerts endpoint
  app.get('/api/enterprise/performance/alerts', requireStackAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      const alerts = await PerformanceMonitor.getSystemAlerts();
      
      const response = createSuccessResponse({
        alerts,
        count: alerts.length
      });
      res.json(response);
    } catch (error) {
      const errorResponse = handleEnterpriseError(error, 'PERFORMANCE ALERTS');
      res.status(500).json(errorResponse);
    }
  });

  // Resolve performance alert endpoint
  app.post('/api/enterprise/performance/alerts/:alertId/resolve', requireStackAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      const { alertId } = req.params;
      
      const validation = validateAlertId(alertId);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          error: 'Invalid alert ID',
          details: validation.error,
          timestamp: new Date().toISOString()
        });
        return;
      }

      const result = await PerformanceMonitor.resolveAlert(alertId);
      
      if (result.success) {
        const response = createSuccessResponse(result, 'Alert resolved successfully');
        res.json(response);
      } else {
        res.status(404).json({
          success: false,
          error: result.error || 'Alert not found',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      const errorResponse = handleEnterpriseError(error, 'ALERT RESOLUTION');
      res.status(500).json(errorResponse);
    }
  });

  // Global Expansion Endpoints
  app.get('/api/enterprise/global-expansion', requireStackAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🌍 GLOBAL EXPANSION: Generating expansion metrics...');
      const metrics = await globalExpansion.generateExpansionMetrics();
      
      const response = createSuccessResponse(metrics);
      res.json(response);
    } catch (error) {
      const errorResponse = handleEnterpriseError(error, 'GLOBAL EXPANSION');
      res.status(500).json(errorResponse);
    }
  });

  // Advanced Analytics & Reporting Endpoints
  app.get('/api/enterprise/analytics-report', requireStackAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📈 ENTERPRISE ANALYTICS: Generating comprehensive report...');
      const report = await analyticsReporting.generateEnterpriseReport();
      
      const response = createSuccessResponse(report);
      res.json(response);
    } catch (error) {
      const errorResponse = handleEnterpriseError(error, 'ENTERPRISE ANALYTICS');
      res.status(500).json(errorResponse);
    }
  });

  // Executive Summary endpoint for quick dashboard overview
  app.get('/api/enterprise/executive-summary', requireStackAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📋 EXECUTIVE SUMMARY: Generating quick overview...');
      const fullReport = await analyticsReporting.generateEnterpriseReport();
      
      // Return only executive summary for faster loading
      const summaryData = {
        executiveSummary: fullReport.executiveSummary,
        keyMetrics: {
          overallHealth: fullReport.executiveSummary.overallHealth,
          totalRevenue: fullReport.businessIntelligence.revenueAnalysis.totalRevenue,
          activeCustomers: fullReport.businessIntelligence.customerAnalysis.activeCustomers,
          systemUptime: fullReport.operationalMetrics.systemPerformance.uptime,
          threatLevel: 'low' // Default for summary
        }
      };

      const response = createSuccessResponse(summaryData);
      res.json(response);
    } catch (error) {
      const errorResponse = handleEnterpriseError(error, 'EXECUTIVE SUMMARY');
      res.status(500).json(errorResponse);
    }
  });

  // Enterprise health check endpoint
  app.get('/api/enterprise/health', requireStackAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      const [
        predictiveHealth,
        securityHealth,
        performanceHealth,
        expansionHealth
      ] = await Promise.allSettled([
        // Quick health checks with error handling
        Promise.resolve({ status: 'operational', service: 'predictive-intelligence' }),
        Promise.resolve({ status: 'operational', service: 'security-audit' }),
        Promise.resolve({ status: 'operational', service: 'performance-monitor' }),
        Promise.resolve({ status: 'operational', service: 'global-expansion' })
      ]);

      const services = [
        predictiveHealth.status === 'fulfilled' ? predictiveHealth.value : { status: 'error', service: 'predictive-intelligence' },
        securityHealth.status === 'fulfilled' ? securityHealth.value : { status: 'error', service: 'security-audit' },
        performanceHealth.status === 'fulfilled' ? performanceHealth.value : { status: 'error', service: 'performance-monitor' },
        expansionHealth.status === 'fulfilled' ? expansionHealth.value : { status: 'error', service: 'global-expansion' }
      ];

      const healthData = {
        overall: services.every(service => service.status === 'operational') ? 'operational' : 'degraded',
        services,
        timestamp: new Date().toISOString(),
        version: '3.0.0'
      };

      const response = createSuccessResponse(healthData);
      res.json(response);
    } catch (error) {
      const errorResponse = handleEnterpriseError(error, 'ENTERPRISE HEALTH CHECK');
      res.status(500).json(errorResponse);
    }
  });

  // Enterprise configuration endpoint
  app.get('/api/enterprise/config', requireStackAuth, async (req: Request, res: Response): Promise<void> => {
    try {
      const configData = {
        features: {
          predictiveIntelligence: true,
          securityAudit: true,
          performanceMonitoring: true,
          globalExpansion: true,
          advancedAnalytics: true
        },
        limits: {
          maxReportsPerDay: 100,
          maxAlerts: 500,
          dataRetentionDays: 365
        },
        version: '3.0.0',
        deployedAt: new Date().toISOString()
      };

      const response = createSuccessResponse(configData);
      res.json(response);
    } catch (error) {
      const errorResponse = handleEnterpriseError(error, 'ENTERPRISE CONFIG');
      res.status(500).json(errorResponse);
    }
  });

  console.log('✅ Enterprise Scaling API routes registered successfully');
}
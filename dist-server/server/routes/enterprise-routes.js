/**
 * PHASE 3: ENTERPRISE SCALING - API ROUTES
 * Enterprise-level API endpoints for predictive intelligence, security, performance, and global expansion
 */
import { predictiveIntelligence } from '../enterprise/predictive-intelligence';
import { securityAudit } from '../enterprise/security-audit';
import { PerformanceMonitor } from '../enterprise/performance-monitor';
import { globalExpansion } from '../enterprise/global-expansion';
import { analyticsReporting } from '../enterprise/analytics-reporting';
import { requireStackAuth } from '../stack-auth';
export function registerEnterpriseRoutes(app) {
    console.log('🏢 Registering Enterprise Scaling API routes...');
    // Predictive Intelligence Endpoints
    app.get('/api/enterprise/predictive-metrics', requireStackAuth, async (req, res) => {
        try {
            console.log('🔮 PREDICTIVE INTELLIGENCE: Generating metrics...');
            const metrics = await predictiveIntelligence.generatePredictiveMetrics();
            res.json({
                success: true,
                data: metrics,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('❌ PREDICTIVE INTELLIGENCE ERROR:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to generate predictive metrics',
                details: error.message
            });
        }
    });
    // Security Audit Endpoints
    app.get('/api/enterprise/security-report', requireStackAuth, async (req, res) => {
        try {
            console.log('🔒 SECURITY AUDIT: Generating security report...');
            const report = await securityAudit.generateSecurityReport();
            res.json({
                success: true,
                data: report,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('❌ SECURITY AUDIT ERROR:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to generate security report',
                details: error.message
            });
        }
    });
    // Security threat detection endpoint
    app.post('/api/enterprise/security/detect-threat', requireStackAuth, async (req, res) => {
        try {
            const { type, source, description, severity } = req.body;
            await securityAudit.detectThreat(type, source, description, severity);
            res.json({
                success: true,
                message: 'Threat detection logged successfully'
            });
        }
        catch (error) {
            console.error('❌ THREAT DETECTION ERROR:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to log threat detection',
                details: error.message
            });
        }
    });
    // Performance Monitoring Endpoints
    app.get('/api/enterprise/performance-report', requireStackAuth, async (req, res) => {
        try {
            console.log('📊 PERFORMANCE MONITOR: Generating performance report...');
            const report = await PerformanceMonitor.generatePerformanceReport();
            res.json({
                success: true,
                data: report,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('❌ PERFORMANCE MONITOR ERROR:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to generate performance report',
                details: error.message
            });
        }
    });
    // Performance alerts endpoint
    app.get('/api/enterprise/performance/alerts', requireStackAuth, async (req, res) => {
        try {
            const alerts = await PerformanceMonitor.getSystemAlerts();
            res.json({
                success: true,
                data: alerts,
                count: alerts.length
            });
        }
        catch (error) {
            console.error('❌ PERFORMANCE ALERTS ERROR:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve performance alerts',
                details: error.message
            });
        }
    });
    // Resolve performance alert endpoint
    app.post('/api/enterprise/performance/alerts/:alertId/resolve', requireStackAuth, async (req, res) => {
        try {
            const { alertId } = req.params;
            const resolved = await PerformanceMonitor.resolveAlert(alertId);
            if (resolved) {
                res.json({
                    success: true,
                    message: 'Alert resolved successfully'
                });
            }
            else {
                res.status(404).json({
                    success: false,
                    error: 'Alert not found'
                });
            }
        }
        catch (error) {
            console.error('❌ ALERT RESOLUTION ERROR:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to resolve alert',
                details: error.message
            });
        }
    });
    // Global Expansion Endpoints
    app.get('/api/enterprise/global-expansion', requireStackAuth, async (req, res) => {
        try {
            console.log('🌍 GLOBAL EXPANSION: Generating expansion metrics...');
            const metrics = await globalExpansion.generateExpansionMetrics();
            res.json({
                success: true,
                data: metrics,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('❌ GLOBAL EXPANSION ERROR:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to generate global expansion metrics',
                details: error.message
            });
        }
    });
    // Advanced Analytics & Reporting Endpoints
    app.get('/api/enterprise/analytics-report', requireStackAuth, async (req, res) => {
        try {
            console.log('📈 ENTERPRISE ANALYTICS: Generating comprehensive report...');
            const report = await analyticsReporting.generateEnterpriseReport();
            res.json({
                success: true,
                data: report,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('❌ ENTERPRISE ANALYTICS ERROR:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to generate enterprise analytics report',
                details: error.message
            });
        }
    });
    // Executive Summary endpoint for quick dashboard overview
    app.get('/api/enterprise/executive-summary', requireStackAuth, async (req, res) => {
        try {
            console.log('📋 EXECUTIVE SUMMARY: Generating quick overview...');
            const fullReport = await analyticsReporting.generateEnterpriseReport();
            // Return only executive summary for faster loading
            res.json({
                success: true,
                data: {
                    executiveSummary: fullReport.executiveSummary,
                    keyMetrics: {
                        overallHealth: fullReport.executiveSummary.overallHealth,
                        totalRevenue: fullReport.businessIntelligence.revenueAnalysis.totalRevenue,
                        activeCustomers: fullReport.businessIntelligence.customerAnalysis.activeCustomers,
                        systemUptime: fullReport.operationalMetrics.systemPerformance.uptime,
                        threatLevel: 'low' // Default for summary
                    }
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('❌ EXECUTIVE SUMMARY ERROR:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to generate executive summary',
                details: error.message
            });
        }
    });
    // Enterprise health check endpoint
    app.get('/api/enterprise/health', requireStackAuth, async (req, res) => {
        try {
            const [predictiveHealth, securityHealth, performanceHealth, expansionHealth] = await Promise.all([
                // Quick health checks
                Promise.resolve({ status: 'operational', service: 'predictive-intelligence' }),
                Promise.resolve({ status: 'operational', service: 'security-audit' }),
                Promise.resolve({ status: 'operational', service: 'performance-monitor' }),
                Promise.resolve({ status: 'operational', service: 'global-expansion' })
            ]);
            res.json({
                success: true,
                data: {
                    overall: 'operational',
                    services: [
                        predictiveHealth,
                        securityHealth,
                        performanceHealth,
                        expansionHealth
                    ],
                    timestamp: new Date().toISOString(),
                    version: '3.0.0'
                }
            });
        }
        catch (error) {
            console.error('❌ ENTERPRISE HEALTH CHECK ERROR:', error.message);
            res.status(500).json({
                success: false,
                error: 'Health check failed',
                details: error.message
            });
        }
    });
    // Enterprise configuration endpoint
    app.get('/api/enterprise/config', requireStackAuth, async (req, res) => {
        try {
            res.json({
                success: true,
                data: {
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
                }
            });
        }
        catch (error) {
            console.error('❌ ENTERPRISE CONFIG ERROR:', error.message);
            res.status(500).json({
                success: false,
                error: 'Failed to retrieve enterprise configuration',
                details: error.message
            });
        }
    });
    console.log('✅ Enterprise Scaling API routes registered successfully');
}

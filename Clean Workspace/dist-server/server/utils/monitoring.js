/**
 * Comprehensive Monitoring System
 * Real-time monitoring of application health, performance, and errors
 */
import { Logger } from './logger.js';
import { performanceMonitor } from './performance-monitor.js';
import { errorTracker } from './error-tracker.js';
import { securityMonitor } from './security-monitor.js';
import { healthCheckSystem } from './health-check.js';
import { dashboardSystem } from './dashboard.js';
export class MonitoringSystem {
    logger;
    isEnabled;
    monitoringInterval;
    constructor() {
        this.logger = new Logger('MonitoringSystem');
        this.isEnabled = true;
        this.monitoringInterval = null;
    }
    /**
     * Start monitoring
     */
    startMonitoring() {
        if (!this.isEnabled) {
            this.logger.warn('Monitoring system is disabled');
            return;
        }
        if (this.monitoringInterval) {
            this.logger.warn('Monitoring already started');
            return;
        }
        this.logger.info('Starting comprehensive monitoring system...');
        // Start individual monitoring systems (removed circular reference)
        // monitoringSystem.startMonitoring(); // This would be a circular call
        performanceMonitor.setEnabled(true);
        errorTracker.setEnabled(true);
        securityMonitor.setEnabled(true);
        healthCheckSystem.startMonitoring();
        dashboardSystem.startMonitoring();
        // Start overall monitoring interval
        this.monitoringInterval = setInterval(() => {
            this.performMonitoringCycle();
        }, 30000); // Every 30 seconds
        this.logger.info('Monitoring system started successfully');
    }
    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (!this.monitoringInterval) {
            this.logger.warn('Monitoring not started');
            return;
        }
        this.logger.info('Stopping monitoring system...');
        // Stop individual monitoring systems (removed circular reference)
        // monitoringSystem.stopMonitoring(); // This would be a circular call
        performanceMonitor.setEnabled(false);
        errorTracker.setEnabled(false);
        securityMonitor.setEnabled(false);
        healthCheckSystem.stopMonitoring();
        dashboardSystem.stopMonitoring();
        // Stop overall monitoring interval
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
        this.logger.info('Monitoring system stopped');
    }
    /**
     * Perform monitoring cycle
     */
    async performMonitoringCycle() {
        try {
            // Get system health
            const healthCheck = await healthCheckSystem.performHealthCheck();
            // Get performance metrics
            const performanceStats = performanceMonitor.getPerformanceStats(1); // Last hour
            const realTimeSummary = performanceMonitor.getRealTimeSummary();
            // Get error statistics
            const errorStats = errorTracker.getErrorStats(1); // Last hour
            // Get security statistics
            const securityStats = securityMonitor.getSecurityStats(1); // Last hour
            // Get dashboard data
            const dashboardData = dashboardSystem.getDashboardData();
            // Log monitoring summary
            this.logger.info('Monitoring cycle completed', {
                health: healthCheck.status,
                performance: {
                    averageResponseTime: performanceStats.averageResponseTime ?? 0,
                    errorRate: performanceStats.errorRate ?? 0,
                    throughput: performanceStats.throughput ?? 0,
                },
                errors: {
                    total: errorStats.totalErrors ?? 0,
                    rate: errorStats.errorRate ?? 0,
                    critical: errorStats.criticalErrors ?? 0,
                },
                security: {
                    events: securityStats.totalEvents ?? 0,
                    blocked: securityStats.blockedRequests ?? 0,
                    riskScore: securityStats.riskScoreDistribution ?? { low: 0, medium: 0, high: 0, critical: 0 },
                },
                system: {
                    memory: dashboardData?.system?.memory?.percentage || 0,
                    cpu: 0, // TODO: dashboardData.system doesn't have cpu property, need to get from SystemMetrics
                },
            });
            // Check for alerts - create a compatible HealthCheck object from HealthCheckResult
            const healthCheckForAlerts = {
                status: healthCheck.status === 'unhealthy' ? 'unhealthy' :
                    healthCheck.status === 'degraded' ? 'degraded' : 'healthy',
                services: [], // HealthCheckResult doesn't have services, so empty array
                issues: [], // HealthCheckResult doesn't have issues, so empty array
            };
            this.checkAlerts(healthCheckForAlerts, {
                averageResponseTime: performanceStats.averageResponseTime ?? 0,
                errorRate: performanceStats.errorRate ?? 0,
                throughput: performanceStats.throughput ?? 0,
            }, errorStats, securityStats);
        }
        catch (error) {
            this.logger.error('Monitoring cycle failed', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Check for alerts
     */
    checkAlerts(healthCheck, performanceStats, errorStats, securityStats) {
        const alerts = [];
        // Health alerts
        if (healthCheck.status === 'unhealthy') {
            alerts.push('System health is unhealthy');
        }
        else if (healthCheck.status === 'degraded') {
            alerts.push('System health is degraded');
        }
        // Performance alerts
        if (performanceStats.averageResponseTime > 5000) {
            alerts.push(`High average response time: ${performanceStats.averageResponseTime}ms`);
        }
        if (performanceStats.errorRate > 10) {
            alerts.push(`High error rate: ${performanceStats.errorRate}%`);
        }
        // Error alerts
        if (errorStats.criticalErrors > 0) {
            alerts.push(`${errorStats.criticalErrors} critical errors in the last hour`);
        }
        if (errorStats.errorRate > 5) {
            alerts.push(`High error rate: ${errorStats.errorRate}%`);
        }
        // Security alerts
        if (securityStats.totalEvents > 50) {
            alerts.push(`High security event count: ${securityStats.totalEvents}`);
        }
        if (securityStats.blockedRequests > 10) {
            alerts.push(`${securityStats.blockedRequests} requests blocked in the last hour`);
        }
        // Log alerts
        if (alerts.length > 0) {
            this.logger.warn('Monitoring alerts detected', { alerts });
        }
    }
    /**
     * Get monitoring status
     */
    getMonitoringStatus() {
        return {
            enabled: this.isEnabled,
            running: this.monitoringInterval !== null,
            systems: {
                monitoring: this.isEnabled, // Fixed: use this.isEnabled instead of circular reference
                performance: true, // TODO: performanceMonitor.isEnabled() is private, defaulting to true
                errors: true, // TODO: errorTracker.isEnabled() is private, defaulting to true
                security: true, // TODO: securityMonitor.isEnabled() is private, defaulting to true
                health: true, // TODO: healthCheckSystem.isEnabled() is private, defaulting to true
                dashboard: true, // TODO: dashboardSystem.isEnabled() is private, defaulting to true
            },
            metrics: {
                memory: 0, // TODO: Get actual memory usage
                cpu: 0, // TODO: Get actual CPU usage
            },
        };
    }
    /**
     * Get monitoring summary
     */
    async getMonitoringSummary() {
        const healthCheck = await healthCheckSystem.performHealthCheck();
        const performanceStats = performanceMonitor.getPerformanceStats(1);
        const errorStats = errorTracker.getErrorStats(1);
        const securityStats = securityMonitor.getSecurityStats(1);
        const dashboardData = dashboardSystem.getDashboardData();
        return {
            health: healthCheck.status,
            performance: {
                averageResponseTime: performanceStats?.averageResponseTime || 0,
                errorRate: performanceStats?.errorRate || 0,
                throughput: performanceStats?.throughput || 0,
            },
            errors: {
                total: errorStats?.totalErrors || 0,
                rate: errorStats?.errorRate || 0,
                critical: errorStats?.criticalErrors || 0,
            },
            security: {
                events: securityStats?.totalEvents || 0,
                blocked: securityStats?.blockedRequests || 0,
                riskScore: securityStats?.riskScoreDistribution || { low: 0, medium: 0, high: 0, critical: 0 },
            },
            system: {
                memory: dashboardData?.system?.memory?.percentage ?? 0,
                cpu: 0, // dashboardData.system doesn't have cpu property in current type definition
                uptime: dashboardData?.overview?.uptime ?? '0m',
            },
        };
    }
    /**
     * Get monitoring data for external systems
     */
    async getMonitoringData() {
        const timestamp = new Date().toISOString();
        const healthCheck = await healthCheckSystem.performHealthCheck();
        const performanceStats = performanceMonitor.getPerformanceStats(1);
        const errorStats = errorTracker.getErrorStats(1);
        const securityStats = securityMonitor.getSecurityStats(1);
        const dashboardData = dashboardSystem.getDashboardData();
        return {
            timestamp,
            health: healthCheck,
            performance: performanceStats,
            errors: errorStats,
            security: securityStats,
            system: dashboardData,
        };
    }
    /**
     * Export monitoring data
     */
    async exportMonitoringData() {
        const timestamp = new Date().toISOString();
        const healthCheck = await healthCheckSystem.performHealthCheck();
        const performanceStats = performanceMonitor.getPerformanceStats(24); // Last 24 hours
        const errorStats = errorTracker.getErrorStats(24); // Last 24 hours
        const securityStats = securityMonitor.getSecurityStats(24); // Last 24 hours
        const dashboardData = dashboardSystem.getDashboardData();
        return {
            timestamp,
            health: healthCheck,
            performance: performanceStats,
            errors: errorStats,
            security: securityStats,
            system: dashboardData,
            monitoring: this.getMonitoringStatus(), // Use getMonitoringStatus instead of non-existent getStatus
        };
    }
    /**
     * Clear monitoring data
     */
    clearMonitoringData() {
        this.logger.info('Clearing monitoring data...');
        // Clear old data from individual systems
        performanceMonitor.clearOldMetrics(24); // Keep last 24 hours
        errorTracker.clearOldErrors(168); // Keep last 7 days
        securityMonitor.clearOldEvents(168); // Keep last 7 days
        this.logger.info('Monitoring data cleared');
    }
    /**
     * Enable/disable monitoring
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.logger.info(`Monitoring system ${enabled ? 'enabled' : 'disabled'}`);
    }
    /**
     * Check if monitoring is enabled
     */
    getEnabled() {
        return this.isEnabled;
    }
}
// Export singleton instance
export const monitoringSystem = new MonitoringSystem();

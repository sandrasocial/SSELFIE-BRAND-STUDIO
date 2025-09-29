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
        performanceMonitor.setEnabled(true);
        errorTracker.setEnabled(true);
        securityMonitor.setEnabled(true);
        healthCheckSystem.startMonitoring();
        dashboardSystem.startMonitoring();
        this.monitoringInterval = setInterval(() => {
            this.performMonitoringCycle();
        }, 30000);
        this.logger.info('Monitoring system started successfully');
    }
    stopMonitoring() {
        if (!this.monitoringInterval) {
            this.logger.warn('Monitoring not started');
            return;
        }
        this.logger.info('Stopping monitoring system...');
        performanceMonitor.setEnabled(false);
        errorTracker.setEnabled(false);
        securityMonitor.setEnabled(false);
        healthCheckSystem.stopMonitoring();
        dashboardSystem.stopMonitoring();
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = null;
        this.logger.info('Monitoring system stopped');
    }
    async performMonitoringCycle() {
        try {
            const healthCheck = await healthCheckSystem.performHealthCheck();
            const performanceStats = performanceMonitor.getPerformanceStats(1);
            const realTimeSummary = performanceMonitor.getRealTimeSummary();
            const errorStats = errorTracker.getErrorStats(1);
            const securityStats = securityMonitor.getSecurityStats(1);
            const dashboardData = dashboardSystem.getDashboardData();
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
                    cpu: 0,
                },
            });
            const healthCheckForAlerts = {
                status: healthCheck.status === 'unhealthy' ? 'unhealthy' :
                    healthCheck.status === 'degraded' ? 'degraded' : 'healthy',
                services: [],
                issues: [],
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
    checkAlerts(healthCheck, performanceStats, errorStats, securityStats) {
        const alerts = [];
        if (healthCheck.status === 'unhealthy') {
            alerts.push('System health is unhealthy');
        }
        else if (healthCheck.status === 'degraded') {
            alerts.push('System health is degraded');
        }
        if (performanceStats.averageResponseTime > 5000) {
            alerts.push(`High average response time: ${performanceStats.averageResponseTime}ms`);
        }
        if (performanceStats.errorRate > 10) {
            alerts.push(`High error rate: ${performanceStats.errorRate}%`);
        }
        if (errorStats.criticalErrors > 0) {
            alerts.push(`${errorStats.criticalErrors} critical errors in the last hour`);
        }
        if (errorStats.errorRate > 5) {
            alerts.push(`High error rate: ${errorStats.errorRate}%`);
        }
        if (securityStats.totalEvents > 50) {
            alerts.push(`High security event count: ${securityStats.totalEvents}`);
        }
        if (securityStats.blockedRequests > 10) {
            alerts.push(`${securityStats.blockedRequests} requests blocked in the last hour`);
        }
        if (alerts.length > 0) {
            this.logger.warn('Monitoring alerts detected', { alerts });
        }
    }
    getMonitoringStatus() {
        return {
            enabled: this.isEnabled,
            running: this.monitoringInterval !== null,
            systems: {
                monitoring: this.isEnabled,
                performance: true,
                errors: true,
                security: true,
                health: true,
                dashboard: true,
            },
            metrics: {
                memory: 0,
                cpu: 0,
            },
        };
    }
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
                cpu: 0,
                uptime: dashboardData?.overview?.uptime ?? '0m',
            },
        };
    }
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
    async exportMonitoringData() {
        const timestamp = new Date().toISOString();
        const healthCheck = await healthCheckSystem.performHealthCheck();
        const performanceStats = performanceMonitor.getPerformanceStats(24);
        const errorStats = errorTracker.getErrorStats(24);
        const securityStats = securityMonitor.getSecurityStats(24);
        const dashboardData = dashboardSystem.getDashboardData();
        return {
            timestamp,
            health: healthCheck,
            performance: performanceStats,
            errors: errorStats,
            security: securityStats,
            system: dashboardData,
            monitoring: this.getMonitoringStatus(),
        };
    }
    clearMonitoringData() {
        this.logger.info('Clearing monitoring data...');
        performanceMonitor.clearOldMetrics(24);
        errorTracker.clearOldErrors(168);
        securityMonitor.clearOldEvents(168);
        this.logger.info('Monitoring data cleared');
    }
    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.logger.info(`Monitoring system ${enabled ? 'enabled' : 'disabled'}`);
    }
    getEnabled() {
        return this.isEnabled;
    }
}
export const monitoringSystem = new MonitoringSystem();
//# sourceMappingURL=monitoring.js.map
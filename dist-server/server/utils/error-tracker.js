import { Logger } from './logger.js';
export class ErrorTracker {
    logger;
    errors;
    maxErrors;
    isEnabled;
    constructor(maxErrors = 5000) {
        this.logger = new Logger('ErrorTracker');
        this.errors = [];
        this.maxErrors = maxErrors;
        this.isEnabled = true;
    }
    trackError(error, context = {}) {
        if (!this.isEnabled) {
            return '';
        }
        const errorId = this.generateErrorId();
        const timestamp = new Date().toISOString();
        const severity = context.severity || this.determineSeverity(error);
        const category = context.category || this.determineCategory(error);
        const requestContext = this.extractRequestContext(context.req);
        const errorContext = {
            timestamp,
            errorId,
            type: error.constructor.name,
            message: error.message,
            stack: error.stack,
            severity,
            category,
            endpoint: requestContext.endpoint,
            method: requestContext.method,
            userId: context.userId || requestContext.userId,
            ip: requestContext.ip,
            userAgent: requestContext.userAgent,
            requestBody: requestContext.requestBody,
            queryParams: requestContext.queryParams,
            headers: requestContext.headers,
            environment: process.env['NODE_ENV'] || 'development',
            version: process.env.npm_package_version || '1.0.0',
            resolved: false,
            ...context.additionalData,
        };
        if (this.errors.length >= this.maxErrors) {
            this.errors.shift();
        }
        this.errors.push(errorContext);
        this.logger.error('Error tracked', {
            errorId,
            type: errorContext.type,
            message: errorContext.message,
            severity: errorContext.severity,
            category: errorContext.category,
            endpoint: errorContext.endpoint,
            userId: errorContext.userId,
        });
        if (severity === 'critical') {
            this.sendCriticalErrorAlert(errorContext);
        }
        return errorId;
    }
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    determineSeverity(error) {
        const message = error.message.toLowerCase();
        const stack = error.stack?.toLowerCase() || '';
        if (message.includes('database') ||
            message.includes('connection') ||
            message.includes('timeout') ||
            message.includes('memory') ||
            message.includes('fatal')) {
            return 'critical';
        }
        if (message.includes('unauthorized') ||
            message.includes('forbidden') ||
            message.includes('not found') ||
            message.includes('validation') ||
            message.includes('invalid')) {
            return 'high';
        }
        if (message.includes('warning') ||
            message.includes('deprecated') ||
            message.includes('slow')) {
            return 'medium';
        }
        return 'low';
    }
    determineCategory(error) {
        const message = error.message.toLowerCase();
        const stack = error.stack?.toLowerCase() || '';
        if (message.includes('validation') || message.includes('invalid')) {
            return 'validation';
        }
        if (message.includes('database') || message.includes('sql') || message.includes('connection')) {
            return 'database';
        }
        if (message.includes('api') || message.includes('http') || message.includes('fetch')) {
            return 'external_api';
        }
        if (message.includes('auth') || message.includes('token') || message.includes('login')) {
            return 'authentication';
        }
        if (message.includes('permission') || message.includes('access') || message.includes('role')) {
            return 'authorization';
        }
        if (message.includes('system') || message.includes('process') || message.includes('memory')) {
            return 'system';
        }
        return 'unknown';
    }
    extractRequestContext(req) {
        if (!req) {
            return {};
        }
        return {
            endpoint: req.path,
            method: req.method,
            userId: req.user?.id,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            requestBody: req.body,
            queryParams: req.query,
            headers: req.headers,
        };
    }
    async sendCriticalErrorAlert(errorContext) {
        try {
            if (process.env.SLACK_WEBHOOK_URL) {
                await fetch(process.env.SLACK_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: '🚨 Critical Error Alert',
                        attachments: [{
                                color: 'danger',
                                fields: [
                                    { title: 'Error ID', value: errorContext.errorId, short: true },
                                    { title: 'Type', value: errorContext.type, short: true },
                                    { title: 'Message', value: errorContext.message, short: false },
                                    { title: 'Endpoint', value: errorContext.endpoint || 'N/A', short: true },
                                    { title: 'User ID', value: errorContext.userId || 'N/A', short: true },
                                    { title: 'Timestamp', value: errorContext.timestamp, short: true },
                                ],
                            }],
                    }),
                });
            }
            if (process.env.ERROR_EMAIL) {
                this.logger.info('Critical error email sent', { errorId: errorContext.errorId });
            }
        }
        catch (error) {
            this.logger.error('Failed to send critical error alert', { error });
        }
    }
    getErrorStats(timeWindow) {
        const now = Date.now();
        const windowMs = timeWindow ? timeWindow * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        const cutoffTime = now - windowMs;
        const recentErrors = this.errors.filter(error => new Date(error.timestamp).getTime() > cutoffTime);
        if (recentErrors.length === 0) {
            return {
                totalErrors: 0,
                errorsByCategory: {},
                errorsBySeverity: {},
                errorsByEndpoint: {},
                errorRate: 0,
                criticalErrors: 0,
                unresolvedErrors: 0,
                averageResolutionTime: 0,
                topErrors: [],
            };
        }
        const totalErrors = recentErrors.length;
        const criticalErrors = recentErrors.filter(e => e.severity === 'critical').length;
        const unresolvedErrors = recentErrors.filter(e => !e.resolved).length;
        const errorsByCategory = {};
        recentErrors.forEach(error => {
            errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
        });
        const errorsBySeverity = {};
        recentErrors.forEach(error => {
            errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
        });
        const errorsByEndpoint = {};
        recentErrors.forEach(error => {
            if (error.endpoint) {
                const key = `${error.method} ${error.endpoint}`;
                errorsByEndpoint[key] = (errorsByEndpoint[key] || 0) + 1;
            }
        });
        const timeWindowHours = windowMs / (60 * 60 * 1000);
        const errorRate = totalErrors / timeWindowHours;
        const resolvedErrors = recentErrors.filter(e => e.resolved && e.resolvedAt);
        const averageResolutionTime = resolvedErrors.length > 0
            ? resolvedErrors.reduce((sum, error) => {
                const resolvedAt = new Date(error.resolvedAt).getTime();
                const createdAt = new Date(error.timestamp).getTime();
                return sum + (resolvedAt - createdAt) / (1000 * 60 * 60);
            }, 0) / resolvedErrors.length
            : 0;
        const errorCounts = new Map();
        recentErrors.forEach(error => {
            const key = error.message;
            const existing = errorCounts.get(key) || { count: 0, lastOccurred: error.timestamp, severity: error.severity };
            errorCounts.set(key, {
                count: existing.count + 1,
                lastOccurred: error.timestamp > existing.lastOccurred ? error.timestamp : existing.lastOccurred,
                severity: error.severity,
            });
        });
        const topErrors = Array.from(errorCounts.entries())
            .map(([message, data]) => ({
            message,
            count: data.count,
            lastOccurred: data.lastOccurred,
            severity: data.severity,
        }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return {
            totalErrors,
            errorsByCategory,
            errorsBySeverity,
            errorsByEndpoint,
            errorRate: Math.round(errorRate * 100) / 100,
            criticalErrors,
            unresolvedErrors,
            averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
            topErrors,
        };
    }
    getErrorsBySeverity(severity) {
        return this.errors.filter(error => error.severity === severity);
    }
    getErrorsByCategory(category) {
        return this.errors.filter(error => error.category === category);
    }
    getUnresolvedErrors() {
        return this.errors.filter(error => !error.resolved);
    }
    resolveError(errorId, resolvedBy, notes) {
        const error = this.errors.find(e => e.errorId === errorId);
        if (!error) {
            return false;
        }
        error.resolved = true;
        error.resolvedAt = new Date().toISOString();
        error.resolvedBy = resolvedBy;
        if (notes) {
            error.notes = notes;
        }
        this.logger.info('Error resolved', { errorId, resolvedBy });
        return true;
    }
    getErrorById(errorId) {
        return this.errors.find(error => error.errorId === errorId);
    }
    clearOldErrors(olderThanHours = 168) {
        const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
        const initialLength = this.errors.length;
        this.errors = this.errors.filter(error => new Date(error.timestamp).getTime() > cutoffTime);
        const removedCount = initialLength - this.errors.length;
        if (removedCount > 0) {
            this.logger.info(`Cleared ${removedCount} old errors`);
        }
    }
    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.logger.info(`Error tracking ${enabled ? 'enabled' : 'disabled'}`);
    }
    getErrorsCount() {
        return this.errors.length;
    }
    exportErrors() {
        return [...this.errors];
    }
}
export const errorTracker = new ErrorTracker();
//# sourceMappingURL=error-tracker.js.map
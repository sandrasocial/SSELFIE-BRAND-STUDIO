/**
 * Comprehensive Logging System
 * Structured logging with different levels and outputs
 */
import { Logger } from './logger';
import { structuredLogger } from './structured-logger';
export class LoggingSystem {
    logger;
    isEnabled;
    config;
    constructor() {
        this.logger = new Logger('LoggingSystem');
        this.isEnabled = true;
        this.config = {
            level: process.env.LOG_LEVEL || 'info',
            enableConsole: true,
            enableFile: process.env.NODE_ENV === 'production',
            enableRemote: !!process.env.LOG_REMOTE_ENDPOINT,
            remoteEndpoint: process.env.LOG_REMOTE_ENDPOINT,
            maxFileSize: 10,
            maxFiles: 5,
            enableRequestLogging: true,
            enableErrorLogging: true,
            enablePerformanceLogging: true,
        };
    }
    /**
     * Initialize logging system
     */
    async initialize() {
        if (!this.isEnabled) {
            this.logger.warn('Logging system is disabled');
            return;
        }
        this.logger.info('Initializing logging system...');
        try {
            // Configure structured logger
            structuredLogger.updateConfig(this.config);
            this.logger.info('Logging system initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize logging system', { error: error.message });
            throw error;
        }
    }
    /**
     * Log message
     */
    log(level, message, context = {}) {
        if (!this.isEnabled) {
            return;
        }
        structuredLogger.log(level, message, context);
    }
    /**
     * Log debug message
     */
    debug(message, context) {
        this.log('debug', message, context);
    }
    /**
     * Log info message
     */
    info(message, context) {
        this.log('info', message, context);
    }
    /**
     * Log warning message
     */
    warn(message, context) {
        this.log('warn', message, context);
    }
    /**
     * Log error message
     */
    error(message, context) {
        this.log('error', message, context);
    }
    /**
     * Log fatal message
     */
    fatal(message, context) {
        this.log('fatal', message, context);
    }
    /**
     * Log HTTP request
     */
    logRequest(req, res, responseTime) {
        if (!this.isEnabled || !this.config.enableRequestLogging) {
            return;
        }
        structuredLogger.logRequest(req, res, responseTime);
    }
    /**
     * Log error with context
     */
    logError(error, context = {}) {
        if (!this.isEnabled || !this.config.enableErrorLogging) {
            return;
        }
        structuredLogger.logError(error, context);
    }
    /**
     * Log performance metrics
     */
    logPerformance(operation, duration, context = {}) {
        if (!this.isEnabled || !this.config.enablePerformanceLogging) {
            return;
        }
        structuredLogger.logPerformance(operation, duration, context);
    }
    /**
     * Log database operation
     */
    logDatabase(operation, table, duration, context = {}) {
        if (!this.isEnabled) {
            return;
        }
        structuredLogger.logDatabase(operation, table, duration, context);
    }
    /**
     * Log external API call
     */
    logExternalApi(service, endpoint, method, statusCode, duration, context = {}) {
        if (!this.isEnabled) {
            return;
        }
        structuredLogger.logExternalApi(service, endpoint, method, statusCode, duration, context);
    }
    /**
     * Log authentication event
     */
    logAuth(event, userId, success, context = {}) {
        if (!this.isEnabled) {
            return;
        }
        structuredLogger.logAuth(event, userId, success, context);
    }
    /**
     * Log business logic event
     */
    logBusiness(event, entity, entityId, action, context = {}) {
        if (!this.isEnabled) {
            return;
        }
        structuredLogger.logBusiness(event, entity, entityId, action, context);
    }
    /**
     * Get logging configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update logging configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        structuredLogger.updateConfig(this.config);
        this.logger.info('Logging configuration updated', { config: this.config });
    }
    /**
     * Create child logger with additional context
     */
    child(additionalContext) {
        const childLogger = new LoggingSystem();
        childLogger.log = (level, message, context) => {
            this.log(level, message, { ...additionalContext, ...context });
        };
        return childLogger;
    }
    /**
     * Enable/disable logging
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        structuredLogger.setEnabled(enabled);
        this.logger.info(`Logging system ${enabled ? 'enabled' : 'disabled'}`);
    }
    /**
     * Check if logging is enabled
     */
    getEnabled() {
        return this.isEnabled;
    }
}
// Export singleton instance
export const loggingSystem = new LoggingSystem();

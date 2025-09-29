import { Logger } from './logger.js';
import { StructuredLogger } from './structured-logger.js';
export class LoggingSystem {
    logger;
    isEnabled;
    config;
    structuredLogger;
    constructor() {
        this.logger = new Logger('LoggingSystem');
        this.isEnabled = true;
        this.structuredLogger = new StructuredLogger('LoggingSystem');
        this.config = {
            level: process.env['LOG_LEVEL'] || 'info',
            enableConsole: true,
            enableFile: process.env['NODE_ENV'] === 'production',
            enableRemote: !!process.env['LOG_REMOTE_ENDPOINT'],
            remoteEndpoint: process.env['LOG_REMOTE_ENDPOINT'] || undefined,
            maxFileSize: 10,
            maxFiles: 5,
            enableRequestLogging: true,
            enableErrorLogging: true,
            enablePerformanceLogging: true,
        };
    }
    async initialize() {
        if (!this.isEnabled) {
            this.logger.warn('Logging system is disabled');
            return;
        }
        this.logger.info('Initializing logging system...');
        try {
            this.structuredLogger.updateConfig(this.config);
            this.logger.info('Logging system initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize logging system', { error: error.message });
            throw error;
        }
    }
    log(level, message, context = {}) {
        if (!this.isEnabled) {
            return;
        }
        this.structuredLogger.log(level, message, context);
    }
    debug(message, context) {
        this.log('debug', message, context);
    }
    info(message, context) {
        this.log('info', message, context);
    }
    warn(message, context) {
        this.log('warn', message, context);
    }
    error(message, context) {
        this.log('error', message, context);
    }
    fatal(message, context) {
        this.log('fatal', message, context);
    }
    logRequest(req, res, responseTime) {
        if (!this.isEnabled || !this.config.enableRequestLogging) {
            return;
        }
        this.structuredLogger.logRequest(req, res, responseTime);
    }
    logError(error, context = {}) {
        if (!this.isEnabled || !this.config.enableErrorLogging) {
            return;
        }
        this.structuredLogger.logError(error, context);
    }
    logPerformance(operation, duration, context = {}) {
        if (!this.isEnabled || !this.config.enablePerformanceLogging) {
            return;
        }
        this.structuredLogger.logPerformance(operation, duration, context);
    }
    logDatabase(operation, table, duration, context = {}) {
        if (!this.isEnabled) {
            return;
        }
        this.structuredLogger.logDatabase(operation, table, duration, context);
    }
    logExternalApi(service, endpoint, method, statusCode, duration, context = {}) {
        if (!this.isEnabled) {
            return;
        }
        this.structuredLogger.logExternalApi(service, endpoint, method, statusCode, duration, context);
    }
    logAuth(event, userId, success, context = {}) {
        if (!this.isEnabled) {
            return;
        }
        this.structuredLogger.logAuth(event, userId, success, context);
    }
    logBusiness(event, entity, entityId, action, context = {}) {
        if (!this.isEnabled) {
            return;
        }
        this.structuredLogger.logBusiness(event, entity, entityId, action, context);
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.structuredLogger.updateConfig(this.config);
        this.logger.info('Logging configuration updated', { config: this.config });
    }
    child(additionalContext) {
        const childLogger = new LoggingSystem();
        childLogger.log = (level, message, context) => {
            this.log(level, message, { ...additionalContext, ...context });
        };
        return childLogger;
    }
    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.structuredLogger.setEnabled(enabled);
        this.logger.info(`Logging system ${enabled ? 'enabled' : 'disabled'}`);
    }
    getEnabled() {
        return this.isEnabled;
    }
}
export const loggingSystem = new LoggingSystem();
//# sourceMappingURL=logging.js.map
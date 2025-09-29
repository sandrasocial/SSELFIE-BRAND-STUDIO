/**
 * Comprehensive Logging System
 * Structured logging with different levels and outputs
 */
export class Logger {
    service;
    enabled;
    logLevel;
    constructor(service) {
        this.service = service;
        this.enabled = true;
        this.logLevel = process.env['LOG_LEVEL'] || 'info';
    }
    /**
     * Log debug message
     */
    debug(message, metadata) {
        this.log('debug', message, metadata);
    }
    /**
     * Log info message
     */
    info(message, metadata) {
        this.log('info', message, metadata);
    }
    /**
     * Log warning message
     */
    warn(message, metadata) {
        this.log('warn', message, metadata);
    }
    /**
     * Log error message
     */
    error(message, metadata) {
        this.log('error', message, metadata);
    }
    /**
     * Log fatal message
     */
    fatal(message, metadata) {
        this.log('fatal', message, metadata);
    }
    /**
     * Log message with specified level
     */
    log(level, message, metadata) {
        if (!this.enabled || !this.shouldLog(level)) {
            return;
        }
        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            service: this.service,
            environment: process.env['NODE_ENV'] || 'development',
            version: process.env['npm_package_version'] || '1.0.0',
            ...metadata,
        };
        this.outputLog(logEntry);
    }
    /**
     * Check if should log based on level
     */
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }
    /**
     * Output log entry
     */
    outputLog(entry) {
        const { timestamp, level, message, service, ...rest } = entry;
        const logMessage = {
            timestamp,
            level: level.toUpperCase(),
            service,
            message,
            ...rest,
        };
        switch (level) {
            case 'debug':
                console.debug(JSON.stringify(logMessage, null, 2));
                break;
            case 'info':
                console.info(JSON.stringify(logMessage, null, 2));
                break;
            case 'warn':
                console.warn(JSON.stringify(logMessage, null, 2));
                break;
            case 'error':
            case 'fatal':
                console.error(JSON.stringify(logMessage, null, 2));
                break;
        }
    }
    /**
     * Create child logger with additional context
     */
    child(additionalContext) {
        const childLogger = new Logger(this.service);
        childLogger.log = (level, message, metadata) => {
            this.log(level, message, { ...additionalContext, ...metadata });
        };
        return childLogger;
    }
    /**
     * Set log level
     */
    setLogLevel(level) {
        this.logLevel = level;
    }
    /**
     * Enable/disable logging
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    /**
     * Check if logging is enabled
     */
    isEnabled() {
        return this.enabled;
    }
}
// Export default logger instance
export const logger = new Logger('SSELFIE Studio');

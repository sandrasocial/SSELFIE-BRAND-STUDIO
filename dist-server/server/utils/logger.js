export class Logger {
    service;
    enabled;
    logLevel;
    constructor(service) {
        this.service = service;
        this.enabled = true;
        this.logLevel = process.env['LOG_LEVEL'] || 'info';
    }
    debug(message, metadata) {
        this.log('debug', message, metadata);
    }
    info(message, metadata) {
        this.log('info', message, metadata);
    }
    warn(message, metadata) {
        this.log('warn', message, metadata);
    }
    error(message, metadata) {
        this.log('error', message, metadata);
    }
    fatal(message, metadata) {
        this.log('fatal', message, metadata);
    }
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
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error', 'fatal'];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const messageLevelIndex = levels.indexOf(level);
        return messageLevelIndex >= currentLevelIndex;
    }
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
    child(additionalContext) {
        const childLogger = new Logger(this.service);
        childLogger.log = (level, message, metadata) => {
            this.log(level, message, { ...additionalContext, ...metadata });
        };
        return childLogger;
    }
    setLogLevel(level) {
        this.logLevel = level;
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    isEnabled() {
        return this.enabled;
    }
}
export const logger = new Logger('SSELFIE Studio');
//# sourceMappingURL=logger.js.map
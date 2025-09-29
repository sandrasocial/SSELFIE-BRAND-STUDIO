import { Logger } from './logger.js';
import * as fs from 'fs';
export class ConsoleLogOutput {
    write(entry) {
        const logMethod = console[entry.level] || console.log;
        logMethod(JSON.stringify(entry, null, 2));
    }
}
export class FileLogOutput {
    fs;
    path;
    constructor(logPath) {
        this.fs = fs;
        this.path = logPath;
    }
    write(entry) {
        const logLine = JSON.stringify(entry) + '\n';
        this.fs.appendFileSync(this.path, logLine);
    }
}
export class RemoteLogOutput {
    endpoint;
    constructor(endpoint) {
        this.endpoint = endpoint;
    }
    async write(entry) {
        try {
            await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
            });
        }
        catch (error) {
            console.error('Failed to send log to remote endpoint:', error);
        }
    }
}
export class StructuredLogger {
    baseLogger;
    outputs;
    requestId;
    userId;
    config;
    constructor(service, outputs = []) {
        this.baseLogger = new Logger(service);
        this.outputs = outputs.length > 0 ? outputs : [new ConsoleLogOutput()];
        this.config = {
            level: 'info',
            enableConsole: true,
            enableFile: false,
            enableRemote: false,
            maxFileSize: 10,
            maxFiles: 5,
            enableRequestLogging: true,
            enableErrorLogging: true,
            enablePerformanceLogging: true
        };
    }
    setEnabled(enabled) {
        this.baseLogger.setEnabled(enabled);
    }
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        this.reconfigureOutputs();
    }
    setContext(requestId, userId) {
        this.requestId = requestId || undefined;
        this.userId = userId || undefined;
    }
    debug(message, metadata) {
        if (this.config.level !== 'debug')
            return;
        this.log('debug', message, metadata);
    }
    info(message, metadata) {
        if (!['debug', 'info'].includes(this.config.level))
            return;
        this.log('info', message, metadata);
    }
    warn(message, metadata) {
        if (!['debug', 'info', 'warn'].includes(this.config.level))
            return;
        this.log('warn', message, metadata);
    }
    error(message, error, metadata) {
        if (!['debug', 'info', 'warn', 'error'].includes(this.config.level))
            return;
        this.log('error', message, {
            ...metadata,
            error: error ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : undefined
        });
    }
    log(level, message, metadata) {
        if (!this.baseLogger.isEnabled())
            return;
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            service: 'StructuredLogger',
            requestId: this.requestId,
            userId: this.userId,
            metadata: metadata || undefined
        };
        this.baseLogger[level](message, metadata);
        this.outputs.forEach(output => {
            try {
                output.write(entry);
            }
            catch (error) {
                console.error('Failed to write log entry:', error);
            }
        });
    }
    reconfigureOutputs() {
        this.outputs = [];
        if (this.config.enableConsole) {
            this.outputs.push(new ConsoleLogOutput());
        }
        if (this.config.enableFile && this.config.filePath) {
            this.outputs.push(new FileLogOutput(this.config.filePath));
        }
        if (this.config.enableRemote && this.config.remoteEndpoint) {
            this.outputs.push(new RemoteLogOutput(this.config.remoteEndpoint));
        }
    }
    logRequest(req, res, responseTime) {
        if (!this.baseLogger.isEnabled() || !this.config?.enableRequestLogging)
            return;
        this.log('info', 'HTTP Request', {
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            responseTime
        });
    }
    logError(error, context = {}) {
        if (!this.baseLogger.isEnabled() || !this.config?.enableErrorLogging)
            return;
        this.error(error.message, error, context);
    }
    logPerformance(operation, duration, context = {}) {
        if (!this.baseLogger.isEnabled() || !this.config?.enablePerformanceLogging)
            return;
        this.info(`Performance: ${operation}`, {
            ...context,
            duration,
            operation
        });
    }
    logDatabase(operation, table, duration, context = {}) {
        if (!this.baseLogger.isEnabled())
            return;
        this.info(`Database: ${operation} on ${table}`, {
            ...context,
            operation,
            table,
            duration
        });
    }
    logExternalApi(service, endpoint, method, statusCode, duration, context = {}) {
        if (!this.baseLogger.isEnabled())
            return;
        this.info(`External API: ${service} ${method} ${endpoint}`, {
            ...context,
            service,
            endpoint,
            method,
            statusCode,
            duration
        });
    }
    logAuth(event, userId, success, context = {}) {
        if (!this.baseLogger.isEnabled())
            return;
        const level = success ? 'info' : 'warn';
        this.log(level, `Auth: ${event}`, {
            ...context,
            event,
            userId,
            success
        });
    }
    logBusiness(event, entity, entityId, action, context = {}) {
        if (!this.baseLogger.isEnabled())
            return;
        this.info(`Business: ${event} - ${action} ${entity}`, {
            ...context,
            event,
            entity,
            entityId,
            action
        });
    }
    addOutput(output) {
        this.outputs.push(output);
    }
    removeOutput(output) {
        const index = this.outputs.indexOf(output);
        if (index > -1) {
            this.outputs.splice(index, 1);
        }
    }
}
export function createStructuredLogger(service, outputs) {
    return new StructuredLogger(service, outputs);
}
//# sourceMappingURL=structured-logger.js.map
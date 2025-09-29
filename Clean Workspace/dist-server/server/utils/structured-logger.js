/**
 * Structured Logger
 * Enhanced logging with structured data and multiple outputs
 */
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
export class StructuredLogger {
    outputs;
    service;
    requestId;
    userId;
    constructor(service, outputs = []) {
        this.service = service;
        this.outputs = outputs.length > 0 ? outputs : [new ConsoleLogOutput()];
    }
    setContext(requestId, userId) {
        this.requestId = requestId || undefined;
        this.userId = userId || undefined;
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
    error(message, error, metadata) {
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
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            service: this.service,
            requestId: this.requestId || undefined,
            userId: this.userId || undefined,
            metadata: metadata || undefined
        };
        this.outputs.forEach(output => {
            try {
                output.write(entry);
            }
            catch (error) {
                console.error('Failed to write log entry:', error);
            }
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
// Export factory function
export function createStructuredLogger(service, outputs) {
    return new StructuredLogger(service, outputs);
}

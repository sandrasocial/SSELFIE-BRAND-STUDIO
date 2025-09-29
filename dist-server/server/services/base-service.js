import { storage } from '../storage.js';
export class BaseService {
    storage = storage;
    generateId(prefix = 'item') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    validateRequired(data, fields) {
        const missing = fields.filter(field => !data[field]);
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
    }
    sanitizeInput(data) {
        if (typeof data === 'string') {
            return data.trim();
        }
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = this.sanitizeInput(value);
            }
            return sanitized;
        }
        return data;
    }
    log(level, message, data) {
        const timestamp = new Date().toISOString();
        const serviceName = this.constructor.name;
        console[level](`[${timestamp}] ${serviceName}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
    handleError(error, operation) {
        this.log('error', `Error in ${operation}`, { error: error.message, stack: error.stack });
        throw error;
    }
}
//# sourceMappingURL=base-service.js.map
/**
 * Base Service Class
 * Provides common functionality for all service classes
 */
import { storage } from '../storage.js';
export class BaseService {
    storage = storage;
    /**
     * Generate a unique ID
     */
    generateId(prefix = 'item') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Validate required fields
     */
    validateRequired(data, fields) {
        const missing = fields.filter(field => !data[field]);
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
    }
    /**
     * Sanitize input data
     */
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
    /**
     * Log service operations
     */
    log(level, message, data) {
        const timestamp = new Date().toISOString();
        const serviceName = this.constructor.name;
        console[level](`[${timestamp}] ${serviceName}: ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
    /**
     * Handle service errors
     */
    handleError(error, operation) {
        this.log('error', `Error in ${operation}`, { error: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined });
        throw error;
    }
}

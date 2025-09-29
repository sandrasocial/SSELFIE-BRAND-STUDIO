/**
 * Input Validator
 * Comprehensive input validation and sanitization
 */
import { Logger } from './logger.js';
export class InputValidator {
    logger;
    constructor() {
        this.logger = new Logger('InputValidator');
    }
    /**
     * Validate a single value against rules
     */
    validate(value, rules, fieldName = 'field') {
        const errors = [];
        let sanitizedValue = value;
        // Check if required
        if (rules.required && (value === undefined || value === null || value === '')) {
            errors.push(`${fieldName} is required`);
            return { isValid: false, errors, sanitizedValue };
        }
        // Skip validation if value is empty and not required
        if (!rules.required && (value === undefined || value === null || value === '')) {
            return { isValid: true, errors: [], sanitizedValue };
        }
        // Type validation
        if (rules.type) {
            const typeError = this.validateType(value, rules.type, fieldName);
            if (typeError) {
                errors.push(typeError);
            }
        }
        // String-specific validations
        if (typeof value === 'string') {
            // Length validations
            if (rules.minLength !== undefined && value.length < rules.minLength) {
                errors.push(`${fieldName} must be at least ${rules.minLength} characters long`);
            }
            if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                errors.push(`${fieldName} must be no more than ${rules.maxLength} characters long`);
            }
            // Pattern validation
            if (rules.pattern && !rules.pattern.test(value)) {
                errors.push(`${fieldName} format is invalid`);
            }
            // Email validation
            if (rules.type === 'email' && !this.isValidEmail(value)) {
                errors.push(`${fieldName} must be a valid email address`);
            }
            // URL validation
            if (rules.type === 'url' && !this.isValidUrl(value)) {
                errors.push(`${fieldName} must be a valid URL`);
            }
            // UUID validation
            if (rules.type === 'uuid' && !this.isValidUuid(value)) {
                errors.push(`${fieldName} must be a valid UUID`);
            }
            // Sanitization
            if (rules.sanitize) {
                sanitizedValue = this.sanitizeString(value);
            }
        }
        // Number-specific validations
        if (typeof value === 'number') {
            if (rules.min !== undefined && value < rules.min) {
                errors.push(`${fieldName} must be at least ${rules.min}`);
            }
            if (rules.max !== undefined && value > rules.max) {
                errors.push(`${fieldName} must be no more than ${rules.max}`);
            }
        }
        // Array-specific validations
        if (Array.isArray(value)) {
            if (rules.minLength !== undefined && value.length < rules.minLength) {
                errors.push(`${fieldName} must have at least ${rules.minLength} items`);
            }
            if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                errors.push(`${fieldName} must have no more than ${rules.maxLength} items`);
            }
        }
        // Enum validation
        if (rules.enum && !rules.enum.includes(value)) {
            errors.push(`${fieldName} must be one of: ${rules.enum.join(', ')}`);
        }
        // Custom validation
        if (rules.custom) {
            const customResult = rules.custom(value);
            if (customResult !== true) {
                errors.push(typeof customResult === 'string' ? customResult : `${fieldName} is invalid`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors,
            sanitizedValue
        };
    }
    /**
     * Validate an object against a schema
     */
    validateObject(obj, schema) {
        const errors = [];
        const sanitizedObj = {};
        for (const [fieldName, rules] of Object.entries(schema)) {
            const result = this.validate(obj[fieldName], rules, fieldName);
            if (!result.isValid) {
                errors.push(...result.errors);
            }
            sanitizedObj[fieldName] = result.sanitizedValue;
        }
        return {
            isValid: errors.length === 0,
            errors,
            sanitizedValue: sanitizedObj
        };
    }
    /**
     * Sanitize HTML content
     */
    sanitizeHtml(html) {
        // Basic HTML sanitization - in production, use a library like DOMPurify
        return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '');
    }
    /**
     * Sanitize SQL input
     */
    sanitizeSql(input) {
        // Basic SQL injection prevention
        return input
            .replace(/['"\\]/g, '')
            .replace(/--/g, '')
            .replace(/\/\*/g, '')
            .replace(/\*\//g, '')
            .replace(/;/g, '');
    }
    /**
     * Validate and sanitize user input
     */
    validateUserInput(input, schema) {
        const result = this.validateObject(input, schema);
        if (result.isValid && result.sanitizedValue) {
            // Additional security sanitization
            for (const [key, value] of Object.entries(result.sanitizedValue)) {
                if (typeof value === 'string') {
                    result.sanitizedValue[key] = this.sanitizeString(value);
                }
            }
        }
        return result;
    }
    /**
     * Validate API request body
     */
    validateRequestBody(body, schema) {
        if (!body || typeof body !== 'object') {
            return {
                isValid: false,
                errors: ['Request body must be a valid JSON object']
            };
        }
        return this.validateUserInput(body, schema);
    }
    /**
     * Validate query parameters
     */
    validateQueryParams(params, schema) {
        return this.validateUserInput(params, schema);
    }
    /**
     * Validate file upload
     */
    validateFileUpload(file, options = {}) {
        const errors = [];
        if (!file) {
            errors.push('File is required');
            return { isValid: false, errors };
        }
        if (options.maxSize && file.size > options.maxSize) {
            errors.push(`File size must be less than ${options.maxSize} bytes`);
        }
        if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
            errors.push(`File type must be one of: ${options.allowedTypes.join(', ')}`);
        }
        if (options.allowedExtensions) {
            const extension = file.originalname.split('.').pop()?.toLowerCase();
            if (!extension || !options.allowedExtensions.includes(extension)) {
                errors.push(`File extension must be one of: ${options.allowedExtensions.join(', ')}`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateType(value, type, fieldName) {
        switch (type) {
            case 'string':
                return typeof value === 'string' ? null : `${fieldName} must be a string`;
            case 'number':
                return typeof value === 'number' && !isNaN(value) ? null : `${fieldName} must be a number`;
            case 'boolean':
                return typeof value === 'boolean' ? null : `${fieldName} must be a boolean`;
            case 'array':
                return Array.isArray(value) ? null : `${fieldName} must be an array`;
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value) ? null : `${fieldName} must be an object`;
            default:
                return null;
        }
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
    isValidUuid(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    sanitizeString(str) {
        return str
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/[&<>"']/g, (match) => {
            const escapeMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            return escapeMap[match];
        });
    }
}
// Export singleton instance
export const inputValidator = new InputValidator();
